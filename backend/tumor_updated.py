import os
import cv2
import numpy as np
import pandas as pd
import warnings
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

import timm
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score
)

warnings.filterwarnings("ignore")

PADDING = 10

def cutout_image(img, padding=PADDING):
    """
    Automatically detects the largest contour and crops the
    image around it with the specified padding.
    """
    if img is None or img.size == 0:
        return img

    if len(img.shape) == 3 and img.shape[2] == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    elif len(img.shape) == 2:
        gray = img
    else:
        return img

    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    kernel = np.ones((5, 5), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if len(contours) == 0:
        return img

    largest_contour = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest_contour)

    x_min = max(0, x - padding)
    y_min = max(0, y - padding)
    x_max = min(img.shape[1], x + w + padding)
    y_max = min(img.shape[0], y + h + padding)

    cropped = img[y_min:y_max, x_min:x_max]

    if cropped.size == 0:
        return img

    return cropped


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "brain_tumor_model.pth"


# -------------------------
# DATAFRAME CREATION
# -------------------------

def train_df(tr_path):
    classes, class_paths = zip(*[
        (label, os.path.join(tr_path, label, image))
        for label in os.listdir(tr_path)
        if os.path.isdir(os.path.join(tr_path, label))
        for image in os.listdir(os.path.join(tr_path, label))
    ])
    return pd.DataFrame({'Class Path': class_paths, 'Class': classes})


def test_df(ts_path):
    classes, class_paths = zip(*[
        (label, os.path.join(ts_path, label, image))
        for label in os.listdir(ts_path)
        if os.path.isdir(os.path.join(ts_path, label))
        for image in os.listdir(os.path.join(ts_path, label))
    ])
    return pd.DataFrame({'Class Path': class_paths, 'Class': classes})


# -------------------------
# CUSTOM DATASET
# -------------------------

class BrainTumorDataset(Dataset):
    def __init__(self, df, transform=None, class_to_idx=None):
        self.df = df
        self.transform = transform

        if class_to_idx is None:
            classes = sorted(df["Class"].unique())
            self.class_to_idx = {cls: i for i, cls in enumerate(classes)}
        else:
            self.class_to_idx = class_to_idx

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        img_path = self.df.iloc[idx]["Class Path"]
        label = self.df.iloc[idx]["Class"]

        img = cv2.imread(img_path)
        if img is None:
            raise ValueError(f"Could not read image: {img_path}")

        img = cutout_image(img)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(img)

        if self.transform:
            img = self.transform(img)

        label = self.class_to_idx[label]
        return img, label


# -------------------------
# EVALUATION FUNCTION
# -------------------------

def evaluate(model, loader):
    model.eval()
    correct = 0
    preds_list = []
    labels_list = []

    with torch.no_grad():
        for imgs, labels in loader:
            imgs, labels = imgs.to(device), labels.to(device)
            outputs = model(imgs)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            preds_list.extend(preds.cpu().numpy())
            labels_list.extend(labels.cpu().numpy())

    acc = correct / len(loader.dataset)
    return acc, preds_list, labels_list


# -------------------------
# SINGLE IMAGE PREDICTION
# -------------------------

def predict(model, img_path, classes):
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError(f"Could not read image: {img_path}")

    cropped = cutout_image(img)
    cropped_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
    cropped_pil = Image.fromarray(cropped_rgb)

    transform = transforms.Compose([
        transforms.Resize((299, 299)),
        transforms.ToTensor()
    ])

    img_tensor = transform(cropped_pil).unsqueeze(0).to(device)

    model.eval()
    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]

    predicted_idx = np.argmax(probs)
    predicted_class = classes[predicted_idx]
    confidence = probs[predicted_idx]

    print("\n==============================")
    print("PREDICTION")
    print("==============================")
    print(f"Class      : {predicted_class}")
    print(f"Confidence : {confidence * 100:.2f}%")

    plt.figure(figsize=(10, 10))
    plt.subplot(2, 1, 1)
    plt.imshow(cropped_rgb)
    plt.title(f"Automatically Cropped MRI\nPrediction: {predicted_class}")
    plt.axis("off")

    plt.subplot(2, 1, 2)
    bars = plt.barh(classes, probs)
    plt.xlabel("Probability")
    plt.gca().bar_label(bars, fmt="%.2f")
    plt.tight_layout()
    plt.show()


# -------------------------
# MAIN
# -------------------------

if __name__ == "__main__":
    TRAIN_PATH = r"C:/Users/Prajwal/Downloads/tumor/Training"
    TEST_PATH = r"C:/Users/Prajwal/Downloads/tumor/Testing"

    if os.path.exists(TRAIN_PATH) and os.path.exists(TEST_PATH):
        tr_df = train_df(TRAIN_PATH)
        ts_df = test_df(TEST_PATH)

        valid_df, ts_df = train_test_split(
            ts_df,
            train_size=0.5,
            random_state=20,
            stratify=ts_df['Class']
        )

        classes = sorted(tr_df["Class"].unique())
        class_to_idx = {cls: i for i, cls in enumerate(classes)}

        train_transform = transforms.Compose([
            transforms.Resize((299, 299)),
            transforms.ColorJitter(brightness=0.2),
            transforms.ToTensor(),
        ])

        test_transform = transforms.Compose([
            transforms.Resize((299, 299)),
            transforms.ToTensor(),
        ])

        train_dataset = BrainTumorDataset(tr_df, train_transform, class_to_idx)
        valid_dataset = BrainTumorDataset(valid_df, test_transform, class_to_idx)
        test_dataset = BrainTumorDataset(ts_df, test_transform, class_to_idx)

        train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
        valid_loader = DataLoader(valid_dataset, batch_size=32)
        test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

        # -------------------------
        # MODEL CREATION
        # -------------------------

        base_model = timm.create_model("xception", pretrained=True, num_classes=0)

        model = nn.Sequential(
            base_model,
            nn.Flatten(),
            nn.Dropout(0.3),
            nn.Linear(base_model.num_features, 128),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, 4)
        ).to(device)

        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adamax(model.parameters(), lr=0.001)

        epochs = 10
        best_val_acc = 0.0

        print("\n========================================")
        print("STARTING TRAINING")
        print("========================================")
        print(f"Device       : {device}")
        print(f"Epochs       : {epochs}")
        print(f"Batch size   : {train_loader.batch_size}")
        print(f"Learning rate: 0.001")
        print(f"Model path   : {MODEL_PATH}")

        for epoch in range(epochs):
            model.train()
            running_loss = 0.0
            correct = 0
            total = 0

            for batch_idx, (imgs, labels) in enumerate(train_loader):
                imgs = imgs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()
                outputs = model(imgs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                running_loss += loss.item()
                _, preds = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (preds == labels).sum().item()

            train_loss = running_loss / len(train_loader)
            train_acc = correct / total
            val_acc, _, _ = evaluate(model, valid_loader)

            print(
                f"Epoch [{epoch + 1}/{epochs}] "
                f"| Loss: {train_loss:.4f} "
                f"| Train Acc: {train_acc * 100:.2f}% "
                f"| Val Acc: {val_acc * 100:.2f}%"
            )

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save(model.state_dict(), MODEL_PATH)
                print(f"  ✓ Best model saved! Val Acc: {val_acc * 100:.2f}%")

        print("\n========================================")
        print("TRAINING COMPLETE")
        print("========================================")
        print(f"Best Validation Accuracy: {best_val_acc * 100:.2f}%")

        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        print("Best saved model loaded.")

        train_acc, _, _ = evaluate(model, train_loader)
        valid_acc, _, _ = evaluate(model, valid_loader)
        test_acc, preds, y_true = evaluate(model, test_loader)

        print("\n==============================")
        print("MODEL PERFORMANCE")
        print("==============================")
        print(f"Train Accuracy      : {train_acc * 100:.2f}%")
        print(f"Validation Accuracy : {valid_acc * 100:.2f}%")
        print(f"Test Accuracy       : {test_acc * 100:.2f}%")

        precision = precision_score(y_true, preds, average="weighted")
        recall = recall_score(y_true, preds, average="weighted")
        f1 = f1_score(y_true, preds, average="weighted")

        print(f"Precision           : {precision * 100:.2f}%")
        print(f"Recall              : {recall * 100:.2f}%")
        print(f"F1 Score            : {f1 * 100:.2f}%")

        cm = confusion_matrix(y_true, preds)
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=classes, yticklabels=classes)
        plt.xlabel("Predicted")
        plt.ylabel("Actual")
        plt.title("Confusion Matrix")
        plt.tight_layout()
        plt.savefig("confusion_matrix.png", dpi=300)

        report = classification_report(y_true, preds, target_names=classes)
        print("\nClassification Report\n")
        print(report)
        with open("classification_report.txt", "w") as f:
            f.write(report)
        print("\nSaved:\n✔ confusion_matrix.png\n✔ classification_report.txt")
    else:
        print("Dataset directory path not found locally. To perform single image prediction or launch application, ensure model weights exist.")
