"""
app.py
------
Flask REST API backend for the AI Crop Disease GAN system.

Endpoints:
  GET  /api/health             — Health check + model status
  POST /api/generate           — Generate synthetic leaf images using DCGAN
  POST /api/detect             — Classify an uploaded leaf image
  GET  /api/training-metrics   — Return GAN training loss history

Usage:
  python backend/app.py
"""

import os
import sys
import io
import json
import base64
import traceback
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import numpy as np

# ─── Project root setup ──────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from models.generator import Generator

# ─── App setup ───────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Config ──────────────────────────────────────────────────────────────────
LATENT_DIM = 100
IMAGE_SIZE  = 128
MODEL_PATH  = PROJECT_ROOT / "outputs" / "saved_models" / "generator_final.pth"

# Disease classes (PlantVillage Tomato)
DISEASE_INFO = {
    "Early Blight": {
        "severity":  "Moderate",
        "treatment": "Apply copper-based fungicide. Remove infected leaves immediately.",
        "cause":     "Alternaria solani fungus",
        "color":     "#f59e0b",
    },
    "Late Blight": {
        "severity":  "Severe",
        "treatment": "Apply chlorothalonil fungicide immediately. Destroy infected plants.",
        "cause":     "Phytophthora infestans oomycete",
        "color":     "#ef4444",
    },
    "Leaf Mold": {
        "severity":  "Moderate",
        "treatment": "Improve air circulation. Apply mancozeb fungicide.",
        "cause":     "Passalora fulva fungus",
        "color":     "#f97316",
    },
    "Healthy": {
        "severity":  "None",
        "treatment": "No treatment required. Continue regular monitoring.",
        "cause":     "N/A",
        "color":     "#22c55e",
    },
    "Bacterial Spot": {
        "severity":  "Moderate",
        "treatment": "Apply copper bactericide. Avoid overhead irrigation.",
        "cause":     "Xanthomonas spp. bacteria",
        "color":     "#a855f7",
    },
    "Target Spot": {
        "severity":  "Moderate",
        "treatment": "Apply azoxystrobin fungicide. Improve ventilation.",
        "cause":     "Corynespora cassiicola fungus",
        "color":     "#ec4899",
    },
    "Yellow Leaf Curl Virus": {
        "severity":  "Severe",
        "treatment": "Remove and destroy infected plants. Control whitefly vectors.",
        "cause":     "Begomovirus (via whitefly)",
        "color":     "#eab308",
    },
    "Mosaic Virus": {
        "severity":  "High",
        "treatment": "Remove infected plants. Control aphid vectors with insecticide.",
        "cause":     "Tomato mosaic virus (ToMV)",
        "color":     "#14b8a6",
    },
    "Spider Mites": {
        "severity":  "Moderate",
        "treatment": "Apply miticide or neem oil. Increase ambient humidity.",
        "cause":     "Tetranychus urticae mite",
        "color":     "#6366f1",
    },
    "Septoria Leaf Spot": {
        "severity":  "Moderate",
        "treatment": "Apply mancozeb fungicide. Remove infected lower leaves.",
        "cause":     "Septoria lycopersici fungus",
        "color":     "#84cc16",
    },
}

# ─── Generator singleton ─────────────────────────────────────────────────────
_generator = None
_device    = None


def get_generator():
    """Lazily load (and cache) the DCGAN Generator."""
    global _generator, _device
    if _generator is not None:
        return _generator, _device

    _device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _generator = Generator(latent_dim=LATENT_DIM).to(_device)

    if MODEL_PATH.exists():
        _generator.load_state_dict(
            torch.load(str(MODEL_PATH), map_location=_device, weights_only=True)
        )
        print(f"[Generator] ✓ Loaded trained weights from {MODEL_PATH}")
    else:
        print(f"[Generator] ⚠  No trained model found at {MODEL_PATH}")
        print(f"[Generator]    Using randomly-initialized weights.")
        print(f"[Generator]    Run  python training/train_gan.py  to train.")

    _generator.eval()
    return _generator, _device


def tensor_to_b64(tensor_img: torch.Tensor) -> str:
    """Convert a (C, H, W) tensor with values in [-1, 1] to a base64 PNG string."""
    img_np = tensor_img.detach().cpu().numpy()
    img_np = ((img_np + 1.0) / 2.0 * 255.0).clip(0, 255).astype(np.uint8)
    img_np = img_np.transpose(1, 2, 0)          # (C,H,W) → (H,W,C)
    pil_img = Image.fromarray(img_np, mode="RGB")
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")


# ─── Simulated realistic training metrics ────────────────────────────────────
def get_simulated_metrics():
    """Return realistic GAN training loss curves (50 epochs, seeded)."""
    import math
    rng = np.random.default_rng(42)
    epochs = list(range(1, 51))

    # D loss stabilises around 0.65–0.70 after initial instability
    d_losses = [
        round(0.35 + 0.35 * (1 - math.exp(-i / 10)) + rng.normal(0, 0.02), 4)
        for i in range(50)
    ]

    # G loss starts ~6.4 and converges to ~2.0 as generator improves
    g_losses = [
        round(max(1.5, 2.0 + 4.5 * math.exp(-i / 15) + rng.normal(0, 0.08)), 4)
        for i in range(50)
    ]

    # FID score: starts ~320, converges to ~42
    fid_scores = [
        round(max(38, 42 + 280 * math.exp(-i / 12) + rng.normal(0, 3)), 1)
        for i in range(50)
    ]

    return {"epochs": epochs, "g_losses": g_losses,
            "d_losses": d_losses, "fid_scores": fid_scores}


# ─── Mock disease classifier (colour-statistics heuristic) ───────────────────
def _mock_classify(img: Image.Image) -> dict:
    """
    Colour-statistics heuristic for demo purposes.
    Replaced by the real ResNet-18 classifier when available.
    """
    img_np  = np.array(img).astype(float) / 255.0
    r_mean  = img_np[:, :, 0].mean()
    g_mean  = img_np[:, :, 1].mean()
    b_mean  = img_np[:, :, 2].mean()

    green_lead = g_mean - (r_mean + b_mean) / 2

    if green_lead > 0.06:
        top = "Healthy"
        scores = {"Healthy": 0.84, "Early Blight": 0.07, "Leaf Mold": 0.05,
                  "Late Blight": 0.02, "Bacterial Spot": 0.02}
    elif r_mean > g_mean and r_mean > b_mean:
        top = "Early Blight"
        scores = {"Early Blight": 0.72, "Target Spot": 0.12,
                  "Septoria Leaf Spot": 0.09, "Healthy": 0.04, "Late Blight": 0.03}
    elif b_mean > r_mean:
        top = "Late Blight"
        scores = {"Late Blight": 0.69, "Leaf Mold": 0.14, "Bacterial Spot": 0.10,
                  "Early Blight": 0.05, "Healthy": 0.02}
    else:
        top = "Leaf Mold"
        scores = {"Leaf Mold": 0.66, "Early Blight": 0.17, "Target Spot": 0.10,
                  "Healthy": 0.04, "Late Blight": 0.03}

    info = DISEASE_INFO.get(top, {})
    return {
        "prediction":  top,
        "confidence":  scores[top],
        "all_scores":  scores,
        "severity":    info.get("severity",  "Unknown"),
        "treatment":   info.get("treatment", "Consult an agronomist."),
        "cause":       info.get("cause",     "Unknown"),
        "color":       info.get("color",     "#6b7280"),
        "is_mock":     True,
    }


# ─── API Routes ───────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":        "ok",
        "model_trained": MODEL_PATH.exists(),
        "device":        "cuda" if torch.cuda.is_available() else "cpu",
        "classes":       list(DISEASE_INFO.keys()),
    })


@app.route("/api/generate", methods=["POST"])
def generate():
    """
    Generate synthetic leaf images via the DCGAN Generator.

    JSON body:
      num_images : int  (1–16, default 4)
      seed       : int  (optional, for reproducible outputs)
    """
    try:
        data       = request.get_json(silent=True) or {}
        num_images = max(1, min(int(data.get("num_images", 4)), 16))
        seed       = data.get("seed", None)

        gen, device = get_generator()

        if seed is not None:
            torch.manual_seed(int(seed))

        with torch.no_grad():
            noise       = torch.randn(num_images, LATENT_DIM, device=device)
            fake_images = gen(noise)                # (N, 3, 128, 128)

        images_b64 = [tensor_to_b64(img) for img in fake_images]

        return jsonify({
            "success":       True,
            "images":        images_b64,
            "count":         num_images,
            "model_trained": MODEL_PATH.exists(),
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/detect", methods=["POST"])
def detect():
    """
    Classify an uploaded leaf image for disease diagnosis.

    Form data:
      file : image file (JPG / PNG)
    """
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"success": False, "error": "Empty filename"}), 400

        img = Image.open(file.stream).convert("RGB")
        img_resized = img.resize((IMAGE_SIZE, IMAGE_SIZE))

        # Try the real trained classifier first, fall back to mock
        try:
            from backend.classifier import predict
            result = predict(img_resized)
        except Exception:
            result = _mock_classify(img_resized)

        return jsonify({"success": True, **result})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/training-metrics", methods=["GET"])
def training_metrics():
    """Return GAN training history (real JSON if available, simulated otherwise)."""
    loss_json = PROJECT_ROOT / "outputs" / "training_losses.json"
    if loss_json.exists():
        with open(loss_json) as f:
            data = json.load(f)
        data["is_real"] = True
        return jsonify(data)

    data = get_simulated_metrics()
    data["is_real"] = False
    return jsonify(data)


# ─── Entry point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("  AI Crop Disease GAN — Backend API")
    print("=" * 55)
    print(f"  Model path  : {MODEL_PATH}")
    print(f"  Trained     : {'YES ✓' if MODEL_PATH.exists() else 'NO — using random weights'}")
    print(f"  Serving on  : http://localhost:5000")
    print("=" * 55 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
