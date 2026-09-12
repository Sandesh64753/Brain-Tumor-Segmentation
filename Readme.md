<<<<<<< HEAD
# 🧠 NeuroScan AI — Brain Tumor Segmentation, Classification & Explainability Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-orange.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **Clinical-grade, multi-modal Brain MRI Analysis Platform combining Deep Learning (Xception + UNet), Explainable AI (Grad-CAM), Interactive Visualizers, and Publication-Grade PDF Report Generation.**

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Deep Learning Pipeline & Models](#-deep-learning-pipeline--models)
- [Directory Structure](#-directory-structure)
- [Installation & Quick Start](#-installation--quick-start)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Recent Bug Fixes & Improvements](#-recent-bug-fixes--improvements)
- [API Reference](#-api-reference)
- [Docker Deployment](#-docker-deployment)
- [Medical Disclaimer](#-medical-disclaimer)

---

## 🔬 Overview

**NeuroScan AI** is an end-to-end, medical AI platform designed for researchers, radiologists, and clinicians to analyze Brain Magnetic Resonance Imaging (MRI) scans. The system automatically performs:
1. **Multi-Class Tumor Classification** (Glioma, Meningioma, No Tumor, Pituitary) using a fine-tuned **Xception** deep neural network.
2. **Lesion Boundary Segmentation** using a high-precision **U-Net** architecture.
3. **Model Explainability & Saliency** using **Grad-CAM** (Gradient-weighted Class Activation Mapping) to highlight feature regions influencing prediction scores.
4. **Publication-Grade PDF Clinical Reports** complete with analysis metrics, patient details, and high-resolution 4-panel image previews.

---

## ✨ Key Features

- 🎯 **4-Class Brain Tumor Classifier**:
  - Classifies MRI scans into **Glioma**, **Meningioma**, **No Tumor**, or **Pituitary**.
  - Provides full class probability distributions and confidence scores.
- 📐 **U-Net Tumor Segmentation**:
  - Automatically isolates tumor pixel contours.
  - Computes tumor surface area percentage, pixel count, Dice similarity coefficient, and IoU score.
- 🔥 **Vivid Grad-CAM Heatmap Visualization**:
  - Generates high-resolution **RGB JET colormapped** saliency maps (`conv4` feature layer).
  - Clearly visualizes AI attention regions overlayed on original brain anatomy.
- 🖼️ **4-Panel Multi-Modal Image Workspace**:
  - Side-by-side inspection: **Original MRI**, **Grad-CAM Heatmap**, **UNet Mask**, and **Combined Synthetic Overlay**.
  - Interactive opacity controls, zoom modal, and individual image downloads.
- 📄 **Authenticated PDF Report Generation**:
  - Generates publication-ready PDF reports with headers, probability tables, and clinical disclaimers.
  - Supports token-authenticated downloads in browser sessions and direct link downloads.
- 🗄️ **Database Telemetry & History**:
  - Automatically persists all user uploads, classification records, and image masks in SQLite / PostgreSQL databases.
  - Searchable and filterable analysis history log.

---

## 🛠️ System Architecture & Tech Stack

```
 ┌─────────────────────────────────────────────────────────┐
 │                   React + Vite Frontend                 │
 │       (TypeScript, Tailwind CSS, Lucide Icons)          │
 └────────────────────────────┬────────────────────────────┘
                              │ REST API Requests (JWT Auth)
                              ▼
 ┌─────────────────────────────────────────────────────────┐
 │                    FastAPI Backend                      │
 │    (Python, Uvicorn, SQLAlchemy, Pydantic, ReportLab)   │
 └──────┬──────────────────────┬────────────────────┬──────┘
        │                      │                    │
        ▼                      ▼                    ▼
┌──────────────┐      ┌─────────────────┐  ┌────────────────┐
│   PyTorch    │      │    Grad-CAM     │  │   SQL Database │
│ Models Engine│      │ Saliency Engine │  │ (SQLite / Postgres)
└──────────────┘      └─────────────────┘  └────────────────┘
```

### **Backend Stack**:
- **Framework**: FastAPI + Uvicorn
- **ML Framework**: PyTorch, torchvision, `timm` (Xception)
- **Computer Vision**: OpenCV (`cv2`), PIL, NumPy
- **PDF Generator**: ReportLab
- **Database / ORM**: SQLAlchemy (SQLite default, PostgreSQL compatible)
- **Auth & Security**: OAuth2 with JWT tokens, passlib (Bcrypt)

### **Frontend Stack**:
- **Framework**: React 18 (Vite build tool)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons & UI**: Lucide React, Custom Dark/Light Clinical Interface

---

## 🧠 Deep Learning Pipeline & Models

### 1. Classification Model (`BrainTumorClassifier`)
- **Backbone**: `timm.create_model("xception", pretrained=True, num_classes=0)`
- **Head**: `Flatten` ➔ `Dropout(0.3)` ➔ `Linear(2048, 128)` ➔ `ReLU` ➔ `Dropout(0.25)` ➔ `Linear(128, 4)`
- **Class Label Alignment**:
  - `0`: `Glioma`
  - `1`: `Meningioma`
  - `2`: `No Tumor`
  - `3`: `Pituitary`
- **Weights File**: `backend/trained_models/classification/brain_tumor_model-2.pth`

### 2. Segmentation Model (`UNet`)
- **Architecture**: Deep convolutional U-Net with contracting and expansive paths.
- **Weights File**: `backend/trained_models/segmentation/best_brisc_unet.pth`

### 3. Grad-CAM Engine
- **Target Layer**: `conv4` (Separable Convolution feature map layer).
- **Gradient Hooks**: Tensor-level `output.register_hook(save_grad)` for non-blocking gradient capture.
- **Color Mapping**: Bicubic upsampling (`cv2.INTER_CUBIC`) + OpenCV `COLORMAP_JET` RGB conversion.

---

## 📁 Directory Structure

```text
Brain Tumor/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI Endpoint Routers (auth, analysis, reports, etc.)
│   │   ├── core/            # Configuration & JWT Security settings
│   │   ├── database/        # Database session and base model setup
│   │   ├── ml/              # PyTorch Model Adapters & Loaders
│   │   │   ├── classification_model.py
│   │   │   ├── segmentation_model.py
│   │   │   └── model_loader.py
│   │   ├── models/          # SQLAlchemy Database Models (User, Analysis, Contact)
│   │   ├── schemas/         # Pydantic Request/Response validation schemas
│   │   ├── services/        # Preprocessing, Classification, UNet, Grad-CAM, PDF Services
│   │   ├── utils/           # Contour Cutout, DICOM Reader & Overlay generator
│   │   └── main.py          # Application entrypoint & lifespan model initialization
│   ├── trained_models/      # Directory containing model weight checkpoints
│   │   ├── classification/  # brain_tumor_model-2.pth (84.5 MB)
│   │   └── segmentation/    # best_brisc_unet.pth (372.5 MB)
│   ├── uploads/             # Storage for uploaded MRI scans
│   ├── outputs/             # Storage for generated masks & overlays
│   ├── reports/             # Storage for generated PDF reports
│   ├── tumor_updated.py     # Training & evaluation script reference
│   ├── requirements.txt     # Python backend dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # Modular UI components (VisualizationGrid, GradCAMCard, etc.)
│   │   ├── context/         # AuthContext state management
│   │   ├── pages/           # Landing, Analysis, History, Models, About pages
│   │   ├── services/        # Frontend API client (authApi, analysisApi, reportsApi)
│   │   ├── types/           # TypeScript interface declarations
│   │   ├── App.tsx          # Main routing table
│   │   └── main.tsx         # React root mounting
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml       # Containerized multi-service deployment setup
└── README.md                # Project documentation
```

---

## 🚀 Installation & Quick Start

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18.0 or higher
- **Package Managers**: `pip` & `npm`

---

### Step 1: Backend Setup

1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

   The backend will automatically initialize the database and load PyTorch model weights into memory. API will be live at:
   - **API Server**: `http://127.0.0.1:8000`
   - **Swagger Docs**: `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup

1. Open a new terminal tab and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

---

## ⚙️ Configuration & Environment Variables

Backend settings are configured via `backend/.env`:

```env
# Database & Auth
DATABASE_URL=sqlite:///./neuroscan.db
SECRET_KEY=neuroscan_super_secret_jwt_key_2026_change_in_production!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Model Paths & Devices
CLASSIFICATION_MODEL_PATH=trained_models/classification/brain_tumor_model-2.pth
SEGMENTATION_MODEL_PATH=trained_models/segmentation/best_brisc_unet.pth
DEVICE=cpu

# Machine Learning Settings
CLASS_NAMES=["Glioma", "Meningioma", "No Tumor", "Pituitary"]
IMAGE_SIZE=224
GRADCAM_TARGET_LAYER=conv4

# Network & Upload Limits
MAX_UPLOAD_SIZE_MB=10
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

---

## 🛠️ Recent Bug Fixes & Improvements

1. **PDF Report Download Fix**:
   - Resolved `401 Unauthorized` redirect when clicking "Download Report PDF".
   - `get_current_user` in `deps.py` now accepts tokens via `?token=<jwt>` query parameters as well as `Authorization` headers.
   - `reportsApi.downloadReport` in `api.ts` performs authenticated blob retrieval to ensure smooth file downloads.

2. **Classification Alignment**:
   - Corrected `CLASS_NAMES` order to `["Glioma", "Meningioma", "No Tumor", "Pituitary"]` to match dataset folder alphabetical ordering, resolving class label index inversion bugs between `No Tumor` and `Pituitary`.

3. **Vivid Grad-CAM Saliency Maps**:
   - Fixed PyTorch backward hook tensor errors by replacing `register_full_backward_hook` with `output.register_hook(save_grad)`.
   - Enhanced heatmap rendering with `cv2.applyColorMap` (JET) and `cv2.INTER_CUBIC` interpolation to guarantee crisp, non-zero RGB heatmaps.

---

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Log in and receive JWT token | ❌ |
| `GET` | `/api/auth/me` | Fetch current user profile | ✅ |
| `POST` | `/api/analysis/predict` | Upload MRI scan for classification, segmentation & Grad-CAM | ✅ |
| `GET` | `/api/analysis/history` | Retrieve user's historical analysis records | ✅ |
| `GET` | `/api/analysis/{id}` | Get detailed metrics and visual asset URLs for an analysis | ✅ |
| `DELETE`| `/api/analysis/{id}` | Delete analysis record from database | ✅ |
| `GET` | `/api/reports/{id}/download`| Download PDF clinical analysis report | ✅ |

---

## 🐳 Docker Deployment

To launch the full containerized environment (FastAPI Backend + React Frontend + PostgreSQL):

```bash
docker-compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`

---

## ⚠️ Medical Disclaimer

> **NeuroScan AI** is designed for educational, analytical, and research purposes only. The outputs generated by the deep learning models (classifications, surface area segmentations, and Grad-CAM attention heatmaps) do not constitute a definitive medical diagnosis and should not replace evaluation by a licensed medical professional or radiologist.
=======
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
>>>>>>> c4f1a329d9bfd793a2470bbf635b2594a192851f
