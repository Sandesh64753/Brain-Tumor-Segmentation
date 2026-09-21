"""
One-Class MRI Gatekeeper (Autoencoder-based Anomaly Detection)
================================================================
Trains ONLY on your existing brain MRI images (no negative/non-MRI
dataset needed). Learns to reconstruct MRI images accurately; any
input that is NOT an MRI will reconstruct poorly -> high reconstruction
error -> reject.

Uses your existing folder structure directly:

    tumor/
        Training/
            pituitary/
            notumor/
            meningioma/
            glioma/
        Testing/
            pituitary/
            notumor/
            meningioma/
            glioma/

All images across all 4 class folders are valid MRI scans, so all of
them are used as positive training data -- the class labels themselves
are ignored (this is unsupervised).

Testing/ is used purely to calibrate the rejection threshold on data
the model never trained on, which gives a more honest estimate than a
random split of the training set.

NOTE (Windows): everything is wrapped in `if __name__ == "__main__":`.
This is required on Windows when using num_workers > 0 in DataLoader --
otherwise each worker process re-imports and re-runs the whole script,
which is why you were seeing "Training on 4760 MRI images..." printed
multiple times before training actually started.
"""

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import numpy as np

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
TRAIN_DIR = r"C:\Users\Omen27\Downloads\tumor\Training"
TEST_DIR = r"C:\Users\Omen27\Downloads\tumor\Testing"
IMG_SIZE = 128
BATCH_SIZE = 32
EPOCHS = 30
LR = 1e-3
NUM_WORKERS = 2          # set to 0 if you still see issues
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_OUT = "mri_autoencoder.pt"
THRESHOLD_OUT = "mri_threshold.txt"


# ---------------------------------------------------------------------------
# Model: simple convolutional autoencoder
# ---------------------------------------------------------------------------
class ConvAutoencoder(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(1, 32, 3, stride=2, padding=1), nn.ReLU(),   # 128 -> 64
            nn.Conv2d(32, 64, 3, stride=2, padding=1), nn.ReLU(),  # 64 -> 32
            nn.Conv2d(64, 128, 3, stride=2, padding=1), nn.ReLU(), # 32 -> 16
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 3, stride=2, padding=1, output_padding=1), nn.ReLU(),  # 16 -> 32
            nn.ConvTranspose2d(64, 32, 3, stride=2, padding=1, output_padding=1), nn.ReLU(),   # 32 -> 64
            nn.ConvTranspose2d(32, 1, 3, stride=2, padding=1, output_padding=1), nn.Sigmoid(), # 64 -> 128
        )

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)


def run_epoch(model, loader, criterion, optimizer, device, train=True):
    model.train() if train else model.eval()
    total_loss = 0.0
    torch.set_grad_enabled(train)
    for imgs, _ in loader:   # labels unused -- unsupervised
        imgs = imgs.to(device)
        if train:
            optimizer.zero_grad()
        recon = model(imgs)
        loss = criterion(recon, imgs)
        if train:
            loss.backward()
            optimizer.step()
        total_loss += loss.item() * imgs.size(0)
    return total_loss / len(loader.dataset)


def main():
    tf = transforms.Compose([
        transforms.Grayscale(num_output_channels=1),  # MRIs are grayscale
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
    ])

    train_ds = datasets.ImageFolder(TRAIN_DIR, transform=tf)
    test_ds = datasets.ImageFolder(TEST_DIR, transform=tf)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS)

    print(f"Training on {len(train_ds)} MRI images (Training/), "
          f"calibrating threshold on {len(test_ds)} images (Testing/)")
    print("Class folders found:", train_ds.classes)

    model = ConvAutoencoder().to(DEVICE)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)

    best_train_loss = float("inf")
    for epoch in range(EPOCHS):
        train_loss = run_epoch(model, train_loader, criterion, optimizer, DEVICE, train=True)
        print(f"Epoch {epoch+1}/{EPOCHS} | train_recon_loss={train_loss:.5f}")
        if train_loss < best_train_loss:
            best_train_loss = train_loss
            torch.save(model.state_dict(), MODEL_OUT)

    print(f"Training done. Best train reconstruction loss: {best_train_loss:.5f}")
    print(f"Model saved to {MODEL_OUT}")

    # -----------------------------------------------------------------
    # Calibrate rejection threshold using per-image reconstruction error
    # on the held-out Testing/ set (all known-good MRI images the model
    # never trained on).
    # -----------------------------------------------------------------
    model.eval()
    errors = []
    with torch.no_grad():
        for imgs, _ in test_loader:
            imgs = imgs.to(DEVICE)
            recon = model(imgs)
            per_img_err = ((recon - imgs) ** 2).mean(dim=[1, 2, 3])
            errors.extend(per_img_err.cpu().numpy().tolist())

    errors = np.array(errors)
    # Threshold = mean + 3*std of error on KNOWN GOOD held-out mri images.
    # Anything above this at inference time is flagged as "not MRI".
    threshold = float(errors.mean() + 3 * errors.std())
    with open(THRESHOLD_OUT, "w") as f:
        f.write(str(threshold))

    print(f"Reconstruction error on Testing/ (held-out MRI images): "
          f"mean={errors.mean():.5f}, std={errors.std():.5f}")
    print(f"Calibrated rejection threshold: {threshold:.5f} (saved to {THRESHOLD_OUT})")


if __name__ == "__main__":
    main()