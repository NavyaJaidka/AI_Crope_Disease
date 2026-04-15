# AI Crop Disease GAN — AgriGAN

> **DCGAN-powered synthetic crop disease image generator + live AI disease detector.**
> Built with PyTorch, Flask, React + Vite, and the PlantVillage dataset representing a complete solution for dataset augmentation in agricultural AI.

---

## 🌿 Project Overview

In precision agriculture, deep learning models are used to detect crop diseases from leaf images. However, a major challenge is **data scarcity**—certain plant diseases have very few training images, leading to poor model generalisation. 

**AgriGAN** actively solves this issue by deploying a Generative Adversarial Network (DCGAN) to generate synthetic crop disease images, effectively augmenting agricultural datasets. Additionally, the project features a fully functional ResNet-18 Disease Classifier to demonstrate real-world detection capabilities using the augmented data.

### Expected Output & Use Cases
- Synthesise highly realistic imagery of conditions like *Tomato Blight* or *Leaf Mold*.
- Serve as dataset augmentation for training better crop disease detection systems.
- Aid in smart agriculture and global food security.

---

## 🚀 Quick Start

### 1. Install Dependencies
Ensure you are using Python 3.9+ and run:
```bash
pip install -r requirements.txt
```

### 2. Start the Backend API (Flask)
The backend acts as the bridge for running PyTorch models and serves the frontend. 
```bash
python backend/app.py
```
*(Runs on `http://localhost:5000`)*

### 3. Start the Frontend Application (React UI)
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 📂 Comprehensive Project Architecture

### 1. Generative AI Subsystem (GAN)
We use a **Deep Convolutional GAN (DCGAN)** architecture consisting of two competing neural networks:
- **Generator (`models/generator.py`)**: Takes a 100-dimensional noise vector and uses `ConvTranspose2d` layers to upsample it into a realistic $3 \times 128 \times 128$ image of a diseased leaf. It contains ~11.2 Million parameters.
- **Discriminator (`models/discriminator.py`)**: A Convolutional Neural Network that classifies whether an image is Real (from PlantVillage) or Fake (from the Generator). 

### 2. Disease Classifier (`backend/classifier.py`)
A **ResNet-18** classification model fine-tuned using transfer learning on the PlantVillage dataset. The classifier takes any user-uploaded image, normalises it according to ImageNet standards, and outputs a confidence score for the detected disease, alongside treatment recommendations.

### 3. Backend REST API (`backend/app.py`)
A Flask API that exposes four main endpoints:
- `GET /api/health` — Checks the server status and whether the PyTorch model files exist.
- `POST /api/generate` — Invokes the Generator to create $N$ synthetic images (Base64 encoded) with an optional mathematical noise seed for reproducibility.
- `POST /api/detect` — Accepts multipart form-data image uploads, resizes them to 128x128, and passes them through the ResNet-18 model for diagnosis.
- `GET /api/training-metrics` — Reads `training_losses.json` and streams historical Generator/Discriminator loss curves and FID scores back to the UI.

### 4. Interactive UI (`frontend/src/components`)
A meticulously crafted React, Vite, and Tailwind v4 single-page application containing:
- **Dashboard (`Dashboard.jsx`)**: The interactive controller that fetches real DCGAN images from the backend. Includes SVG-based loss charts and generation controls (batch sizing, random seeding).
- **DiseaseDetector (`DiseaseDetector.jsx`)**: A drag-and-drop diagnostic tool that calls the classifier API, displaying confidence score bars, severity ratings, and actionable treatment methodologies.
- **GanPipeline (`GanPipeline.jsx`)**: A live, animated architecture diagram demonstrating step-by-step how the noise vector passes through the networks.
- **DatasetGallery (`DatasetGallery.jsx`)**: An educational gallery showing sample diseases from PlantVillage (e.g. *Alternaria solani*, *Phytophthora infestans*).
- **StatsRow (`StatsRow.jsx`)**: Animated counting statistics showing global project capabilities.

---

## ⚙️ Model Training Operations

### Train the DCGAN (Synthetic Generator)
```bash
python training/train_gan.py
```
**Process:** The script executes adversarial training using Binary Cross Entropy (BCE) loss and Adam optimisers (lr=0.0002). After training, it saves:
- Generator and Discriminator weight states to `outputs/saved_models/`
- JSON metric history to `outputs/training_losses.json` (Consumed by the UI Dashboard)

### Train the Classifier (ResNet-18)
If you wish to train the real disease classifier locally over your PlantVillage dataset:
```bash
python backend/train_classifier.py
```

#### Rapid Transfer Learning for CPUs (`--fast` mode)
We specifically implemented a `--fast` transfer-learning mode designed for machines lacking dedicated NVIDIA GPUs. Running:
```bash
python backend/train_classifier.py --fast
```
This isolates the dataset down to 1,000 stratified samples, freezes the heavy base layers of the ResNet-18 model, and trains the final connected layer using an aggressive learning rate (`5e-3`). **This generates a functional, testable PyTorch checkpoint in under 2 minutes with ~60% accuracy.**

---

## 📊 Dataset Context
The project heavily leverages the open-source **PlantVillage Dataset**.  
For faster execution and training constraints, the current implementation filters specifically for **Tomato crop diseases**.

**Classes Monitored:**
- Tomato Bacterial Spot
- Tomato Early Blight
- Tomato Late Blight
- Tomato Leaf Mold
- Tomato Septoria Leaf Spot
- Tomato Spider Mites
- Tomato Target Spot
- Tomato Yellow Leaf Curl Virus
- Tomato Mosaic Virus
- Tomato Healthy

---

## 🎨 UI Design System & Tech Stack
- **Frontend Core**: React 18 / Vite / JavaScript
- **Styling**: Tailwind CSS v4 / Vanilla CSS Variables
- **Animations**: Framer Motion (Scroll triggers, spring physics, and animated visualisations)
- **Feature Details**: Includes robust Dark/Light mode support managed via `localStorage`, premium typography (`Outfit` & `Inter`), and interactive glass-morphism panels.

---

## 🌟 Future Improvements
1. Implement higher-resolution synthesis (256x256 or 512x512) leveraging advanced architectures like **StyleGAN** or **Diffusion Models**.
2. Dynamically plug generated fake images directly back into the ResNet-18 classifier's DataLoader memory to immediately boost its validation accuracy.
3. Automatically expand the taxonomy to include all 14 crop species (Potato, Apple, Corn, etc.).

---

## 📚 References
- Radford, A. et al. (2015). *Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks* — [arXiv:1511.06434](https://arxiv.org/abs/1511.06434)
- Hughes, D. P. & Salathé, M. (2015). *An open access repository of images on plant health to enable the development of mobile disease diagnostics* — PlantVillage
- He, K. et al. (2016). *Deep Residual Learning for Image Recognition* — [arXiv:1512.03385](https://arxiv.org/abs/1512.03385)
