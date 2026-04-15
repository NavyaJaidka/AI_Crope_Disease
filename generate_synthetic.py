"""
generate_synthetic.py
---------------------
Post-training script: loads the trained Generator and produces
50 synthetic crop disease images, saving them as individual PNG files.

Usage:
    python generate_synthetic.py

Output files:
    outputs/synthetic_leaves/synthetic_leaf_1.png
    outputs/synthetic_leaves/synthetic_leaf_2.png
    ...
    outputs/synthetic_leaves/synthetic_leaf_50.png
"""

import os
import sys
import torch

# Resolve project root
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, PROJECT_ROOT)

from models.generator import Generator
from utils.save_images import save_image_batch
from utils.visualize import show_generated_images

# =============================================================================
# CONFIGURATION
# =============================================================================
MODEL_PATH    = os.path.join(PROJECT_ROOT, "outputs", "saved_models",
                             "generator_final.pth")
OUTPUT_DIR    = os.path.join(PROJECT_ROOT, "outputs", "synthetic_leaves")
NUM_IMAGES    = 50          # Number of synthetic images to generate
LATENT_DIM    = 100
IMAGE_SIZE    = 128
BATCH_SIZE    = 25          # Generate in batches to avoid memory issues
# =============================================================================


def generate():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n{'='*55}")
    print(f"  Synthetic Crop Disease Image Generator")
    print(f"{'='*55}")
    print(f"  Device       : {device}")
    print(f"  Model path   : {MODEL_PATH}")
    print(f"  Output dir   : {OUTPUT_DIR}")
    print(f"  Images to gen: {NUM_IMAGES}")
    print(f"{'='*55}\n")

    # ------------------------------------------------------------------
    # 1. Load the trained Generator
    # ------------------------------------------------------------------
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Trained model not found at '{MODEL_PATH}'.\n"
            "Please run  training/train_gan.py  first."
        )

    generator = Generator(latent_dim=LATENT_DIM).to(device)
    generator.load_state_dict(
        torch.load(MODEL_PATH, map_location=device)
    )
    generator.eval()   # Switch to inference mode
    print("[Generator] Model loaded successfully.\n")

    # ------------------------------------------------------------------
    # 2. Generate images in batches
    # ------------------------------------------------------------------
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_images  = []
    saved_total = 0

    remaining = NUM_IMAGES
    while remaining > 0:
        current_batch = min(BATCH_SIZE, remaining)

        # Sample random noise vectors
        noise = torch.randn(current_batch, LATENT_DIM, device=device)

        with torch.no_grad():
            fake_images = generator(noise)   # (B, 3, 128, 128) in [-1, 1]

        # Save individual images
        save_image_batch(
            images=fake_images,
            save_dir=OUTPUT_DIR,
            prefix="synthetic_leaf",
            start_idx=saved_total + 1,
        )

        all_images.append(fake_images.cpu())
        saved_total += current_batch
        remaining   -= current_batch

    print(f"\n✓ Generated {saved_total} synthetic images → '{OUTPUT_DIR}'")

    # ------------------------------------------------------------------
    # 3. Display a preview grid of all generated images
    # ------------------------------------------------------------------
    import torch as _torch
    all_tensor = _torch.cat(all_images, dim=0)[:NUM_IMAGES]
    show_generated_images(
        images=all_tensor,
        epoch=0,          # Epoch 0 signals post-training generation
        save_dir=OUTPUT_DIR,
        nrow=10,
    )


if __name__ == "__main__":
    generate()
