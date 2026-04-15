"""
classifier.py
-------------
Disease classifier for the AI Crop Disease GAN system.

Uses a fine-tuned ResNet-18 (transfer learning from ImageNet) trained on
PlantVillage tomato disease classes.

If the trained classifier weights do not exist yet, `predict()` raises an
ImportError so the Flask API gracefully falls back to the heuristic mock.

Training:
    python backend/train_classifier.py
"""

import os
import sys
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np

# ─── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT  = Path(__file__).resolve().parent.parent
WEIGHTS_PATH  = PROJECT_ROOT / "outputs" / "saved_models" / "classifier_resnet18.pth"

# ─── Disease classes (same order as used during training) ────────────────────
CLASS_NAMES = [
    "Bacterial Spot",
    "Early Blight",
    "Healthy",
    "Late Blight",
    "Leaf Mold",
    "Mosaic Virus",
    "Septoria Leaf Spot",
    "Spider Mites",
    "Target Spot",
    "Yellow Leaf Curl Virus",
]

NUM_CLASSES = len(CLASS_NAMES)

# ─── Image transform (must match training-time preprocessing) ────────────────
_transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),   # ImageNet stats
])

# ─── Model singleton ─────────────────────────────────────────────────────────
_model  = None
_device = None


def _load_model():
    global _model, _device

    if not WEIGHTS_PATH.exists():
        raise FileNotFoundError(
            f"Classifier weights not found at {WEIGHTS_PATH}.\n"
            "Run  python backend/train_classifier.py  to train the classifier."
        )

    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Build ResNet-18 with the correct output head
    model = models.resnet18(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(in_features, NUM_CLASSES),
    )
    model.load_state_dict(
        torch.load(str(WEIGHTS_PATH), map_location=_device, weights_only=True)
    )
    model.to(_device).eval()
    _model = model
    print(f"[Classifier] ✓ ResNet-18 loaded from {WEIGHTS_PATH}")
    return _model, _device


def predict(img: Image.Image) -> dict:
    """
    Predict the disease class of a PIL Image.

    Parameters
    ----------
    img : PIL.Image.Image  (already loaded and converted to RGB)

    Returns
    -------
    dict with keys: prediction, confidence, all_scores, severity, treatment, cause, color
    """
    global _model, _device
    if _model is None:
        _load_model()

    tensor = _transform(img).unsqueeze(0).to(_device)   # (1, 3, 128, 128)

    with torch.no_grad():
        logits = _model(tensor)                          # (1, NUM_CLASSES)
        probs  = torch.softmax(logits, dim=1).squeeze()  # (NUM_CLASSES,)

    probs_np    = probs.cpu().numpy()
    top_idx     = int(np.argmax(probs_np))
    top_class   = CLASS_NAMES[top_idx]
    confidence  = float(probs_np[top_idx])

    # Build top-5 scores dict
    top5_idx   = np.argsort(probs_np)[::-1][:5]
    all_scores = {CLASS_NAMES[i]: round(float(probs_np[i]), 4) for i in top5_idx}

    # Inline disease info to avoid circular import with app.py
    _DISEASE_INFO = {
        "Early Blight":           {"severity": "Moderate", "treatment": "Apply copper-based fungicide. Remove infected leaves.", "cause": "Alternaria solani",         "color": "#f59e0b"},
        "Late Blight":            {"severity": "Severe",   "treatment": "Apply chlorothalonil fungicide. Destroy infected plants.", "cause": "Phytophthora infestans",  "color": "#ef4444"},
        "Leaf Mold":              {"severity": "Moderate", "treatment": "Improve air circulation. Apply mancozeb fungicide.", "cause": "Passalora fulva",              "color": "#f97316"},
        "Healthy":                {"severity": "None",     "treatment": "No treatment required. Continue regular monitoring.", "cause": "N/A",                          "color": "#22c55e"},
        "Bacterial Spot":         {"severity": "Moderate", "treatment": "Apply copper bactericide. Avoid overhead irrigation.", "cause": "Xanthomonas spp.",            "color": "#a855f7"},
        "Target Spot":            {"severity": "Moderate", "treatment": "Apply azoxystrobin fungicide. Improve ventilation.", "cause": "Corynespora cassiicola",        "color": "#ec4899"},
        "Yellow Leaf Curl Virus": {"severity": "Severe",   "treatment": "Remove infected plants. Control whitefly vectors.", "cause": "Begomovirus",                   "color": "#eab308"},
        "Mosaic Virus":           {"severity": "High",     "treatment": "Remove infected plants. Control aphid vectors.", "cause": "Tomato mosaic virus (ToMV)",        "color": "#14b8a6"},
        "Spider Mites":           {"severity": "Moderate", "treatment": "Apply miticide or neem oil. Increase humidity.", "cause": "Tetranychus urticae",               "color": "#6366f1"},
        "Septoria Leaf Spot":     {"severity": "Moderate", "treatment": "Apply mancozeb. Remove infected lower leaves.", "cause": "Septoria lycopersici",              "color": "#84cc16"},
    }
    info = _DISEASE_INFO.get(top_class, {})

    return {
        "prediction": top_class,
        "confidence": round(confidence, 4),
        "all_scores": all_scores,
        "severity":   info.get("severity",  "Unknown"),
        "treatment":  info.get("treatment", "Consult an agronomist."),
        "cause":      info.get("cause",     "Unknown"),
        "color":      info.get("color",     "#6b7280"),
        "is_mock":    False,
    }
