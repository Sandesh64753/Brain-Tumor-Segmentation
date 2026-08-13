# 🧠 Brain Tumor Segmentation using U-Net

A deep learning project for **automatic brain tumor segmentation from MRI images** using a custom **U-Net architecture** implemented in PyTorch. The project uses the **BRISC2025 dataset** and performs pixel-level segmentation to identify tumor regions in brain MRI scans.

The complete workflow includes dataset preparation, image-mask pairing, preprocessing, data augmentation, U-Net model construction, training, validation, checkpointing, evaluation, and visualization of predicted segmentation masks.

---

## 📌 Project Overview

Brain tumor segmentation is the process of identifying and outlining tumor regions in brain MRI images.

In this project, a **U-Net-based semantic segmentation model** is trained to classify each pixel of an MRI image as either:

* `0` → Background
* `1` → Tumor

The model takes a brain MRI image as input and produces a binary tumor segmentation mask of the same spatial dimensions.

### Main Objective

> Develop a deep learning model capable of accurately identifying tumor regions in brain MRI scans using pixel-level segmentation.

---

## ✨ Features

* 🧠 Brain MRI tumor segmentation
* 📊 BRISC2025 dataset
* 🔗 Automatic image-mask pairing
* 🖼️ Image resizing and normalization
* 🔄 Data augmentation using Albumentations
* 🏗️ Custom U-Net architecture
* ⚡ GPU acceleration using CUDA
* 📉 Combined BCE + Dice loss
* 🎯 Dice and IoU monitoring
* 📈 Precision, Recall, F1 and Pixel Accuracy evaluation
* 💾 Best-model checkpointing
* ⏹️ Early stopping
* 📉 Learning-rate scheduling
* 🔍 Ground-truth vs prediction visualization

---

## 📂 Dataset

The project uses the **BRISC2025** dataset downloaded using `kagglehub`.

The notebook accesses the dataset using:

```python
path = kagglehub.dataset_download("briscdataset/brisc2025")
```

The segmentation portion of the dataset is organized as:

```text
brisc2025/
└── brisc2025/
    └── segmentation_task/
        ├── train/
        │   ├── images/
        │   └── masks/
        │
        └── test/
            ├── images/
            └── masks/
```

The notebook also shows that BRISC2025 contains a separate `classification_task`, but this project specifically uses the `segmentation_task`.

### Dataset Size

| Split      |    Images |     Masks |
| ---------- | --------: | --------: |
| Training   |     3,933 |     3,933 |
| Validation |       590 |       590 |
| Testing    |       860 |       860 |
| **Total**  | **5,383** | **5,383** |

The original 3,933 training pairs are split into:

* **85% training:** 3,343 images
* **15% validation:** 590 images
* **Official test set:** 860 images

The split uses `random_state=42` and shuffling.

---

## 🖼️ Input Data

The original MRI images have the following format:

```text
Image shape: (512, 512, 3)
Mask shape : (512, 512)
```

The images are RGB MRI scans, while the segmentation masks are grayscale images.

### Mask Processing

The original masks contain multiple grayscale values. For this binary segmentation task, the masks are converted into binary masks using:

```python
mask = (mask > 127).astype(np.float32)
```

Therefore:

```text
0–127   → Background
128–255 → Tumor
```

This converts the original mask into a binary tumor/background segmentation mask.

---

## 🔄 Data Preprocessing

The images and masks are resized from:

```text
512 × 512
```

to:

```text
256 × 256
```

The training pipeline applies the following transformations:

### Training Augmentation

* Resize to `256 × 256`
* Random horizontal flip
* Random shift
* Random scaling
* Random rotation
* Random brightness adjustment
* Random contrast adjustment
* Image normalization
* Conversion to PyTorch tensors

The validation and test pipeline uses resizing and normalization without the training augmentations.

### Normalization

```python
mean = (0.5, 0.5, 0.5)
std  = (0.5, 0.5, 0.5)
```

---

## 🏗️ Model Architecture

The project implements a **custom U-Net architecture** from scratch using PyTorch.

U-Net consists of:

```text
Input MRI
    │
    ▼
Encoder
    │
    ├── 64 filters
    ├── 128 filters
    ├── 256 filters
    └── 512 filters
    │
    ▼
Bottleneck
    │
    └── 1024 filters
    │
    ▼
Decoder
    │
    ├── 512 filters
    ├── 256 filters
    ├── 128 filters
    └── 64 filters
    │
    ▼
1×1 Convolution
    │
    ▼
Binary Tumor Mask
```

### Double Convolution Block

Each convolution block contains:

```text
Conv2D
↓
Batch Normalization
↓
ReLU
↓
Conv2D
↓
Batch Normalization
↓
ReLU
```

### Encoder

```text
3 → 64
64 → 128
128 → 256
256 → 512
```

### Bottleneck

```text
512 → 1024
```

### Decoder

The decoder uses transposed convolutions for upsampling and skip connections to combine encoder and decoder features.

```text
1024 → 512
512 → 256
256 → 128
128 → 64
```

Finally:

```text
64 → 1
```

using a `1×1` convolution.

The model therefore produces a single-channel segmentation map.

---

## ⚙️ Training Configuration

| Parameter               |             Value |
| ----------------------- | ----------------: |
| Framework               |           PyTorch |
| Model                   |      Custom U-Net |
| Image Size              |         256 × 256 |
| Batch Size              |                16 |
| Maximum Epochs          |                30 |
| Learning Rate           |            0.0001 |
| Optimizer               |             AdamW |
| Weight Decay            |            0.0001 |
| Loss                    |   BCE + Dice Loss |
| LR Scheduler            | ReduceLROnPlateau |
| Early Stopping Patience |                 5 |
| Minimum Delta           |             0.001 |
| Random Seed             |                42 |
| Prediction Threshold    |               0.5 |
| GPU                     |   NVIDIA Tesla T4 |

The notebook was executed using CUDA on an NVIDIA Tesla T4 GPU.

---

## 📉 Loss Function

The model uses a combination of:

### Binary Cross Entropy

```python
BCEWithLogitsLoss()
```

### Dice Loss

```text
Dice Loss = 1 - Dice Score
```

### Combined Loss

```text
Combined Loss = BCE Loss + Dice Loss
```

This combination is used to improve pixel-wise classification while also directly optimizing the overlap between predicted and ground-truth tumor regions.

---

## 📊 Evaluation Metrics

The model is evaluated using:

### Dice Score

Measures the overlap between the predicted tumor region and ground-truth tumor region.

```text
Dice = 2 × Intersection / (Prediction + Ground Truth)
```

Higher is better.

### Intersection over Union (IoU)

Measures the ratio between the intersection and union of predicted and ground-truth regions.

Higher is better.

### Precision

Measures how many predicted tumor pixels are actually tumor pixels.

### Recall

Measures how many actual tumor pixels are successfully detected.

### F1 Score

Harmonic mean of precision and recall.

### Pixel Accuracy

Measures the percentage of correctly classified pixels.

---

## 📈 Training Performance

During the recorded training run, validation Dice improved substantially over the 30 epochs.

Some recorded validation results:

| Epoch | Train Dice | Validation Dice | Validation IoU |
| ----: | ---------: | --------------: | -------------: |
|     1 |     0.3903 |          0.5592 |         0.4537 |
|     5 |     0.7233 |          0.7523 |         0.6545 |
|    10 |     0.8067 |          0.7944 |         0.7119 |
|    15 |     0.8373 |          0.8129 |         0.7307 |
|    20 |     0.8522 |          0.8299 |         0.7528 |
|    25 |     0.8718 |          0.8405 |         0.7670 |
|    30 |     0.8853 |          0.8590 |         0.7869 |

The training log shows the model continuing to improve through epoch 30.

---

## 🏆 Test Set Results

The final evaluation was performed on the **860-image BRISC2025 test set** using a prediction threshold of `0.5`.

### Final Results

| Metric             |      Score |
| ------------------ | ---------: |
| **Test Loss**      | **0.0206** |
| **Dice Score**     | **0.8765** |
| **IoU Score**      | **0.7887** |
| **Precision**      | **0.9117** |
| **Recall**         | **0.8642** |
| **F1 Score**       | **0.8873** |
| **Pixel Accuracy** | **0.9958** |

### Interpretation

The model achieved a **Dice score of 87.65%**, indicating strong overlap between predicted and ground-truth tumor regions.

The **IoU of 78.87%** further indicates good segmentation overlap.

The model achieved **91.17% precision**, meaning most pixels classified as tumor were correct.

The **86.42% recall** indicates that the model detected a large proportion of the actual tumor pixels.

The **99.58% pixel accuracy** is high, although pixel accuracy should be interpreted carefully in segmentation because background pixels can dominate the image.

---

## 💾 Model Checkpoint

The trained model is saved as:

```text
best_brisc_unet.pth
```

The notebook loads the checkpoint from Google Drive:

```text
/content/drive/MyDrive/best_brisc_unet.pth
```

The checkpoint contains:

```python
[
    "epoch",
    "model_state_dict",
    "optimizer_state_dict",
    "val_dice",
    "val_iou",
    "history"
]
```

The checkpoint loaded during the final evaluation reports:

```text
Best Epoch       : 23
Validation Dice  : 0.85137
Validation IoU   : 0.77685
```

The final test metrics above were generated using this loaded checkpoint.

> **Note:** The notebook's training log records a later validation Dice of `0.8590` at epoch 30, while the checkpoint subsequently loaded from Google Drive reports epoch `23` with Dice `0.85137`. This indicates that the saved checkpoint and the final training-log state are not the same checkpoint.

---

## 🔬 Prediction Visualization

The notebook generates visual comparisons between:

```text
MRI Image
Ground Truth Mask
Model Prediction
```

It also generates overlay visualizations:

```text
MRI + Ground Truth
MRI + Prediction
```

These visualizations allow qualitative inspection of how closely the predicted tumor boundaries match the ground-truth masks.

---

## 🛠️ Technologies Used

### Programming Language

* Python

### Deep Learning

* PyTorch
* Torchvision-style tensor/data utilities

### Computer Vision

* OpenCV
* Albumentations

### Data Processing

* NumPy
* Pandas

### Visualization

* Matplotlib

### Dataset

* BRISC2025
* KaggleHub

### Development Environment

* Google Colab
* NVIDIA Tesla T4 GPU
* Google Drive for model storage

---

## 📦 Installation

Install the required Python packages:

```bash
pip install torch torchvision
pip install albumentations
pip install opencv-python
pip install numpy pandas matplotlib
pip install tqdm
pip install kagglehub
pip install scikit-learn
```

---

## 🚀 How to Run

### 1. Open the Notebook

Open:

```text
Brain_Tumor_Segmentation.ipynb
```

in Google Colab or another Jupyter-compatible environment.

### 2. Enable GPU

For Google Colab:

```text
Runtime → Change runtime type → GPU
```

The notebook detects CUDA automatically:

```python
device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)
```

### 3. Download the Dataset

The notebook automatically downloads BRISC2025 using:

```python
kagglehub.dataset_download(
    "briscdataset/brisc2025"
)
```

### 4. Prepare the Dataset

The notebook:

1. Locates the `segmentation_task` directory.
2. Loads training and testing images.
3. Loads corresponding masks.
4. Matches images and masks using their filenames.
5. Converts masks to binary format.
6. Splits the training set into training and validation subsets.

### 5. Train the Model

Run the training cells to train the U-Net model.

The best validation model is saved as:

```text
best_brisc_unet.pth
```

### 6. Evaluate

Load the saved checkpoint and run the test evaluation.

The evaluation produces:

```text
Test Loss
Dice
IoU
Precision
Recall
F1
Pixel Accuracy
```

The notebook also saves the evaluation results as:

```text
BRISC2025_evaluation_results.json
```

---

## 📁 Suggested Repository Structure

```text
Brain-Tumor-Segmentation/
│
├── Brain_Tumor_Segmentation.ipynb
├── README.md
│
├── best_brisc_unet.pth
│
├── BRISC2025_evaluation_results.json
│
└── .gitignore
```

> The BRISC2025 dataset itself should generally not be committed to the repository. The notebook downloads it separately using KaggleHub.

---

## 🧠 Project Pipeline

```text
             BRISC2025 Dataset
                     │
                     ▼
          Load MRI Images + Masks
                     │
                     ▼
            Match Image/Mask Pairs
                     │
                     ▼
            Binary Mask Conversion
                     │
                     ▼
           Resize to 256 × 256
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     Augmentation          Normalization
          │                     │
          └──────────┬──────────┘
                     ▼
                PyTorch DataLoader
                     │
                     ▼
                  U-Net
                     │
                     ▼
             Tumor Probability Map
                     │
                     ▼
              Threshold = 0.5
                     │
                     ▼
            Binary Tumor Mask
                     │
                     ▼
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
    Dice            IoU        Precision/Recall
                     │
                     ▼
               Final Evaluation
```

---

## 📌 Key Results

The developed U-Net model achieved:

```text
Dice Score      : 87.65%
IoU Score       : 78.87%
Precision       : 91.17%
Recall          : 86.42%
F1 Score        : 88.73%
Pixel Accuracy  : 99.58%
```

These results demonstrate that the model can produce effective tumor segmentation masks on the BRISC2025 test set.

---

## ⚠️ Limitations

* The project performs **binary tumor segmentation**, not multi-class tumor-type segmentation.
* The input images are resized from `512 × 512` to `256 × 256`, which may remove some fine spatial details.
* The model is a custom U-Net and does not use a pretrained encoder.
* Pixel accuracy is not sufficient by itself for judging segmentation quality because background pixels dominate many MRI images.
* The model has been evaluated on the BRISC2025 dataset and should not be interpreted as clinically validated.
* The project is a research/academic implementation and is **not a medical diagnostic system**.
* The notebook does not provide a clinical deployment or diagnosis workflow.

---

## 🔮 Future Improvements

Possible extensions include:

* Use a pretrained encoder such as ResNet or EfficientNet.
* Experiment with Attention U-Net or U-Net++.
* Add boundary-aware or focal segmentation losses.
* Perform extensive hyperparameter tuning.
* Compare multiple segmentation architectures.
* Use higher-resolution inputs or patch-based segmentation.
* Add post-processing to remove small false-positive regions.
* Perform cross-validation.
* Add external-dataset evaluation.
* Develop a web interface for uploading MRI scans and visualizing segmentation results.
* Package the trained model into a production inference API.

---

## 📚 Project Purpose

This project demonstrates the complete development of a deep learning-based medical image segmentation pipeline, from raw MRI images and segmentation masks to model training and quantitative evaluation.

The primary focus is on understanding and implementing:

* Medical image preprocessing
* Binary segmentation
* U-Net architecture
* Data augmentation
* Dice-based optimization
* Segmentation evaluation
* Model checkpointing
* Quantitative and qualitative model analysis

---
