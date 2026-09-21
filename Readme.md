# 🧠 NeuroScan AI — Brain Tumor Segmentation, Classification & Explainability Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-orange.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **Clinical-grade, multi-modal Brain MRI Analysis Platform combining Deep Learning (Xception + UNet), Explainable AI (Grad-CAM), an Autoencoder-based MRI Gatekeeper, Interactive Visualizers, and Publication-Grade PDF Report Generation.**

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Deep Learning Pipeline & Models](#-deep-learning-pipeline--models)
- [MRI Gatekeeper (Autoencoder Anomaly Detection)](#-mri-gatekeeper-autoencoder-anomaly-detection)
- [No-Tumor Segmentation Override](#-no-tumor-segmentation-override)
- [Directory Structure](#-directory-structure)
- [Installation & Quick Start](#-installation--quick-start)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [API Reference](#-api-reference)
- [U-Net Segmentation Research Details](#-u-net-segmentation-research-details)
- [Docker Deployment](#-docker-deployment)
- [Medical Disclaimer](#-medical-disclaimer)

---

## 🔬 Overview

**NeuroScan AI** is an end-to-end, medical AI platform designed for researchers, radiologists, and clinicians to analyze Brain Magnetic Resonance Imaging (MRI) scans. The system automatically performs:

1. **MRI Scan Validation (Gatekeeper)** using a trained Convolutional Autoencoder for anomaly detection — rejects non-MRI images before analysis begins.
2. **Multi-Class Tumor Classification** (Glioma, Meningioma, No Tumor, Pituitary) using a fine-tuned **Xception** deep neural network.
3. **Lesion Boundary Segmentation** using a high-precision **U-Net** architecture, with an intelligent override that produces a blank mask when the classifier predicts "No Tumor".
4. **Model Explainability & Saliency** using **Grad-CAM** (Gradient-weighted Class Activation Mapping) to highlight feature regions influencing prediction scores.
5. **Publication-Grade PDF Clinical Reports** complete with analysis metrics, patient details, and high-resolution 4-panel image previews.

---

## ✨ Key Features

- 🛡️ **MRI Gatekeeper (Autoencoder-Based Input Validation)**:
  - Validates uploaded images are genuine brain MRI scans before tumor analysis begins.
  - **Stage 1 (Heuristics)**: Rapid checks for excessive color spread, zero contrast, and low resolution.
  - **Stage 2 (Autoencoder Anomaly Detection)**: Computes reconstruction error (MSE) and compares against a calibrated threshold (`0.001505`).
  - Non-MRI images are flagged as **"Un-validated"** and tumor analysis is blocked in both UI and API.
- 🎯 **4-Class Brain Tumor Classifier**:
  - Classifies MRI scans into **Glioma**, **Meningioma**, **No Tumor**, or **Pituitary**.
  - Provides full class probability distributions and confidence scores.
- 📐 **U-Net Tumor Segmentation with No-Tumor Override**:
  - Automatically isolates tumor pixel contours.
  - Computes tumor surface area percentage, pixel count, Dice similarity coefficient, and IoU score.
  - **When classification predicts "No Tumor"**, the segmentation pipeline is overridden: a blank black mask is produced, `tumor_pixels` is set to `0`, `area_percentage` to `0%`, and `tumor_detected` to `false`. This ensures consistency between classification and segmentation outputs.
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
│ + Gatekeeper │      └─────────────────┘  └────────────────┘
└──────────────┘
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

### 4. MRI Gatekeeper Autoencoder
- **Architecture**: 3-layer Convolutional Autoencoder (Encoder → Bottleneck → Decoder).
- **Weights File**: `backend/trained_models/gatekeeper/mri_autoencoder.pt`
- **Threshold File**: `backend/trained_models/gatekeeper/mri_threshold.txt` (calibrated value: `0.001505`)
- **Training Script**: `Train_mri_autoencoder.py` — trains on MRI images only (unsupervised, one-class).
- **Inference Script**: `Gatekeeper_inference.py` — standalone inference utility.

---

## 🛡️ MRI Gatekeeper (Autoencoder Anomaly Detection)

The Gatekeeper is a **one-class anomaly detection** system that validates whether an uploaded image is a genuine brain MRI scan **before** any tumor analysis is performed.

### How It Works

1. **Stage 1 — Heuristic Fast-Filter**:
   - Rejects images with excessive color spread (e.g., colorful photographs).
   - Rejects images with zero contrast (blank/uniform files).
   - Rejects images below minimum resolution (64×64 pixels).

2. **Stage 2 — Autoencoder Reconstruction Error**:
   - Converts the image to grayscale and resizes to 128×128.
   - Passes through the trained Convolutional Autoencoder.
   - Computes Mean Squared Error (MSE) between input and reconstruction.
   - **If MSE ≤ threshold (0.001505)**: Image is a valid MRI → ✅ `"Verified MRI Scan"`
   - **If MSE > threshold**: Image is not a valid MRI → ❌ `"Un-validated (Non-MRI)"`

### Training the Gatekeeper

The autoencoder is trained exclusively on genuine brain MRI images (all 4 tumor classes used as positive data — class labels are ignored since this is unsupervised training):

```bash
python Train_mri_autoencoder.py
```

This generates:
- `mri_autoencoder.pt` — Model weights
- `mri_threshold.txt` — Calibrated threshold from held-out test set

### Frontend Behavior

- **Validating**: Animated spinner `"Validating MRI..."` appears when a file is selected.
- **Verified**: Green badge `"✓ Verified MRI Scan"` with reconstruction MSE telemetry. Analysis button is enabled.
- **Un-validated**: Red badge `"✕ Un-validated (Non-MRI)"` with a warning explaining the rejection reason. The `"Run AI Analysis"` button is **disabled**, preventing tumor detection on non-MRI images.

---

## 🔄 No-Tumor Segmentation Override

### Problem

The U-Net segmentation model can sometimes hallucinate tumor regions even on MRI scans that the classification model correctly identifies as **"No Tumor"**. This leads to contradictory results where the classifier says "No Tumor" but the segmentation mask shows colored tumor regions.

### Solution

When the classification model predicts `"No Tumor"`, the backend **overrides the U-Net segmentation** output:

- **Segmentation mask**: A blank black image (all zeros) is generated instead of running U-Net inference.
- **`tumor_detected`**: Set to `false`.
- **`tumor_pixels`**: Set to `0 px`.
- **`area_percentage`**: Set to `0.00%`.
- **Dice / IoU scores**: Set to `N/A` (no ground truth applicable).

This ensures **complete consistency** between the classification and segmentation results displayed to the user. The combined overlay also correctly shows no tumor highlighting.

### Implementation

The override is implemented in `backend/app/api/analysis.py` within the `/api/analysis/predict` endpoint:

```python
# After classification
if predicted_class == "No Tumor":
    binary_mask = np.zeros((orig_h, orig_w), dtype=np.uint8)
    tumor_detected = False
    tumor_pixels = 0
    area_percentage = 0.0
    dice_score = None
    iou_score = None
else:
    binary_mask, tumor_detected, tumor_pixels, area_percentage, dice_score, iou_score = segmentation_service.predict(rgb_numpy)
```

---

## 📁 Directory Structure

```text
Brain-Tumor-Segmentation/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI Endpoint Routers (auth, analysis, reports, models)
│   │   ├── core/            # Configuration & JWT Security settings
│   │   ├── database/        # Database session and base model setup
│   │   ├── ml/              # PyTorch Model Adapters & Loaders
│   │   │   ├── classification_model.py
│   │   │   ├── segmentation_model.py
│   │   │   ├── gatekeeper_model.py    # ConvAutoencoder MRI Gatekeeper
│   │   │   └── model_loader.py
│   │   ├── models/          # SQLAlchemy Database Models (User, Analysis, Contact)
│   │   ├── schemas/         # Pydantic Request/Response validation schemas
│   │   ├── services/        # Preprocessing, Classification, UNet, Grad-CAM, Gatekeeper, PDF
│   │   │   ├── classification_service.py
│   │   │   ├── segmentation_service.py
│   │   │   ├── gradcam_service.py
│   │   │   ├── gatekeeper_service.py  # 2-stage MRI validation service
│   │   │   ├── report_service.py
│   │   │   └── preprocessing_service.py
│   │   ├── utils/           # Contour Cutout, DICOM Reader & Overlay generator
│   │   └── main.py          # Application entrypoint & lifespan model initialization
│   ├── trained_models/      # Directory containing model weight checkpoints
│   │   ├── classification/  # brain_tumor_model-2.pth
│   │   ├── segmentation/    # best_brisc_unet.pth
│   │   └── gatekeeper/      # mri_autoencoder.pt + mri_threshold.txt
│   ├── uploads/             # Storage for uploaded MRI scans
│   ├── outputs/             # Storage for generated masks & overlays
│   ├── reports/             # Storage for generated PDF reports
│   ├── requirements.txt     # Python backend dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # Modular UI components (UploadZone, VisualizationGrid, etc.)
│   │   ├── context/         # AuthContext state management
│   │   ├── pages/           # Landing, Analysis, History, Models, About, Documentation pages
│   │   ├── services/        # Frontend API client (authApi, analysisApi, reportsApi)
│   │   ├── types/           # TypeScript interface declarations
│   │   ├── App.tsx          # Main routing table
│   │   └── main.tsx         # React root mounting
│   ├── public/samples/      # Sample MRI images for demo (glioma, meningioma, notumor, invalid)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── Gatekeeper_inference.py  # Standalone MRI Gatekeeper inference script
├── Train_mri_autoencoder.py # Autoencoder training script (one-class MRI learning)
├── mri_autoencoder.pt       # Root-level copy of trained gatekeeper weights
├── mri_threshold.txt        # Root-level copy of calibrated threshold
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

   The backend will automatically initialize the database and load all PyTorch model weights (Classification, Segmentation, Gatekeeper) into memory. API will be live at:
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
GATEKEEPER_MODEL_PATH=trained_models/gatekeeper/mri_autoencoder.pt
GATEKEEPER_THRESHOLD_PATH=trained_models/gatekeeper/mri_threshold.txt
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

## 📡 API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Log in and receive JWT token | ❌ |
| `GET` | `/api/auth/me` | Fetch current user profile | ✅ |
| `POST` | `/api/analysis/validate` | **Gatekeeper**: Validate if uploaded image is a genuine MRI scan | ❌ |
| `POST` | `/api/analysis/predict` | Upload MRI scan for classification, segmentation & Grad-CAM | ✅ |
| `GET` | `/api/analysis/history` | Retrieve user's historical analysis records | ✅ |
| `GET` | `/api/analysis/{id}` | Get detailed metrics and visual asset URLs for an analysis | ✅ |
| `DELETE`| `/api/analysis/{id}` | Delete analysis record from database | ✅ |
| `GET` | `/api/reports/{id}/download`| Download PDF clinical analysis report | ✅ |
| `GET` | `/api/models` | Get metadata for all loaded AI models | ❌ |

### Validate Endpoint Details (`POST /api/analysis/validate`)

**Request**: `multipart/form-data` with a single `file` field.

**Response** (`MriValidationResponse`):
```json
{
  "is_mri": true,
  "stage": "autoencoder",
  "reason": null,
  "recon_error": 0.00068,
  "threshold": 0.001505,
  "message": "Image passed MRI gatekeeper validation."
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `is_mri` | `boolean` | Whether the image passed MRI validation |
| `stage` | `string` | Which stage made the decision (`heuristic`, `autoencoder`, `format_error`, `exception`) |
| `reason` | `string?` | Human-readable rejection reason (null if passed) |
| `recon_error` | `float?` | Autoencoder reconstruction MSE (null if rejected at heuristic stage) |
| `threshold` | `float` | Calibrated MSE threshold |
| `message` | `string` | User-friendly status message |

---

## 🛠️ Recent Bug Fixes & Improvements

1. **PDF Report Download Fix**:
   - Resolved `401 Unauthorized` redirect when clicking "Download Report PDF".
   - `get_current_user` in `deps.py` now accepts tokens via `?token=<jwt>` query parameters as well as `Authorization` headers.

2. **Classification Alignment**:
   - Corrected `CLASS_NAMES` order to `["Glioma", "Meningioma", "No Tumor", "Pituitary"]` to match dataset folder alphabetical ordering.

3. **Vivid Grad-CAM Saliency Maps**:
   - Fixed PyTorch backward hook tensor errors by replacing `register_full_backward_hook` with `output.register_hook(save_grad)`.
   - Enhanced heatmap rendering with `cv2.applyColorMap` (JET) and `cv2.INTER_CUBIC` interpolation.

4. **MRI Gatekeeper Integration**:
   - Added ConvAutoencoder-based input validation to reject non-MRI images before analysis.
   - Frontend shows real-time validation status badges (Validating → Verified/Un-validated).
   - Backend enforces validation at both `/validate` and `/predict` endpoints.

5. **No-Tumor Segmentation Override**:
   - When classification predicts "No Tumor", the U-Net segmentation is bypassed and a blank black mask is generated.
   - Prevents contradictory results where the classifier says "No Tumor" but the segmentation shows a tumor region.
   - Surface area is set to `0 px`, slice coverage to `0.00%`.

---

## 🔬 U-Net Segmentation Research Details

### Dataset

The U-Net segmentation model was trained on the **BRISC2025** dataset:

| Split      |    Images |     Masks |
| ---------- | --------: | --------: |
| Training   |     3,933 |     3,933 |
| Validation |       590 |       590 |
| Testing    |       860 |       860 |
| **Total**  | **5,383** | **5,383** |

### U-Net Architecture

```text
Input MRI (256×256×3)
    │
    ▼
Encoder: 3→64→128→256→512
    │
    ▼
Bottleneck: 512→1024
    │
    ▼
Decoder: 1024→512→256→128→64
    │
    ▼
1×1 Convolution → Binary Tumor Mask
```

### Training Configuration

| Parameter               |             Value |
| ----------------------- | ----------------: |
| Framework               |           PyTorch |
| Image Size              |         256 × 256 |
| Batch Size              |                16 |
| Maximum Epochs          |                30 |
| Learning Rate           |            0.0001 |
| Optimizer               |             AdamW |
| Loss                    |   BCE + Dice Loss |
| LR Scheduler            | ReduceLROnPlateau |
| Early Stopping Patience |                 5 |
| Prediction Threshold    |               0.5 |

### Test Set Results (BRISC2025, 860 images)

| Metric             |      Score |
| ------------------ | ---------: |
| **Dice Score**     | **0.8765** |
| **IoU Score**      | **0.7887** |
| **Precision**      | **0.9117** |
| **Recall**         | **0.8642** |
| **F1 Score**       | **0.8873** |
| **Pixel Accuracy** | **0.9958** |

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

> **NeuroScan AI** is designed for educational, analytical, and research purposes only. The outputs generated by the deep learning models (classifications, surface area segmentations, Grad-CAM attention heatmaps, and MRI gatekeeper validations) do not constitute a definitive medical diagnosis and should not replace evaluation by a licensed medical professional or radiologist.

---

## ⚠️ Limitations

- The project performs **binary tumor segmentation**, not multi-class tumor-type segmentation.
- Input images are resized during preprocessing, which may reduce fine spatial details.
- The MRI Gatekeeper uses reconstruction error thresholding, which may not catch all adversarial non-MRI inputs.
- Pixel accuracy alone is not sufficient for judging segmentation quality because background pixels dominate many MRI images.
- The models have been evaluated on specific datasets and should not be interpreted as clinically validated.

---

## 🔮 Future Improvements

- Use a pretrained encoder (ResNet/EfficientNet) for segmentation.
- Experiment with Attention U-Net or U-Net++.
- Add boundary-aware or focal segmentation losses.
- Perform extensive hyperparameter tuning and cross-validation.
- Add multi-class tumor segmentation (separate masks per tumor type).
- Improve Gatekeeper with contrastive learning or variational autoencoder approaches.
- Add external-dataset evaluation and benchmarking.
