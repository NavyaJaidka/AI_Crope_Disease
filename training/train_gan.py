"""
train_gan.py
------------
Main GAN training script for the AI Crop Disease Data Generator.
After training, saves loss history to outputs/training_losses.json
so the web dashboard can display real metrics.

This script:
  1. Loads Tomato disease images from PlantVillage.
  2. Instantiates the DCGAN Generator and Discriminator.
  3. Trains them adversarially for a specified number of epochs.
  4. Saves generated image grids every 5 epochs.
  5. Plots and saves the training loss curves at the end.

Usage (local):
    python training/train_gan.py

Usage (Google Colab):
    Copy this file and run it, after mounting Google Drive and
    updating DATASET_ROOT to your Drive path.
"""

import os
import sys
import json
import torch
import torch.nn as nn
import torch.optim as optim

# Add project root to sys.path so that relative imports work both
# locally and in Google Colab.
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

from models.generator import Generator
from models.discriminator import Discriminator
from utils.dataset_loader import get_dataloader
from utils.visualize import show_generated_images, plot_losses
from utils.save_images import save_image_batch

# =============================================================================
# CONFIGURATION — adjust these variables to match your environment
# =============================================================================

# Path to PlantVillage root folder (contains class sub-directories)
DATASET_ROOT = r"E:\Gen_AI Project\dataset\PlantVillage\PlantVillage"

# Training hyper-parameters (from the project spec)
NUM_EPOCHS   = 50
BATCH_SIZE   = 64
LEARNING_RATE = 0.0002
BETA1        = 0.5        # Adam β₁ (DCGAN paper recommendation)
LATENT_DIM   = 100        # Size of the noise vector

# Image & architecture settings
IMAGE_SIZE   = 128
FEATURE_MAPS = 64         # Base feature-map width for G and D

# Output directories
SAVE_DIR     = os.path.join(PROJECT_ROOT, "outputs", "generated_images")
MODEL_DIR    = os.path.join(PROJECT_ROOT, "outputs", "saved_models")
LOSS_PLOT    = os.path.join(PROJECT_ROOT, "outputs", "loss_curve.png")

# Save a sample grid every N epochs
SAVE_EVERY   = 5

# Number of noise vectors to use for fixed evaluation samples
NUM_EVAL_SAMPLES = 64

# =============================================================================


def train():
    # ------------------------------------------------------------------
    # 1. Device selection
    # ------------------------------------------------------------------
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n{'='*55}")
    print(f"  AI Crop Disease GAN — Training")
    print(f"{'='*55}")
    print(f"  Device      : {device}")
    print(f"  Epochs      : {NUM_EPOCHS}")
    print(f"  Batch size  : {BATCH_SIZE}")
    print(f"  Image size  : {IMAGE_SIZE}x{IMAGE_SIZE}")
    print(f"  Latent dim  : {LATENT_DIM}")
    print(f"{'='*55}\n")

    # ------------------------------------------------------------------
    # 2. Dataset & DataLoader
    # ------------------------------------------------------------------
    dataloader = get_dataloader(
        dataset_root=DATASET_ROOT,
        crop="Tomato",
        image_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        num_workers=0,   # Set to 0 to avoid Windows multiprocessing issues
    )

    # ------------------------------------------------------------------
    # 3. Instantiate Generator and Discriminator
    # ------------------------------------------------------------------
    generator     = Generator(latent_dim=LATENT_DIM,
                              feature_maps=FEATURE_MAPS).to(device)
    discriminator = Discriminator(feature_maps=FEATURE_MAPS).to(device)

    print(f"Generator parameters     : "
          f"{sum(p.numel() for p in generator.parameters()):,}")
    print(f"Discriminator parameters : "
          f"{sum(p.numel() for p in discriminator.parameters()):,}\n")

    # ------------------------------------------------------------------
    # 4. Loss function and Optimizers
    # ------------------------------------------------------------------
    # Binary Cross-Entropy loss — the standard GAN loss
    criterion = nn.BCELoss()

    # Separate Adam optimizers for G and D (DCGAN paper: β₁=0.5)
    optimizer_G = optim.Adam(generator.parameters(),
                             lr=LEARNING_RATE, betas=(BETA1, 0.999))
    optimizer_D = optim.Adam(discriminator.parameters(),
                             lr=LEARNING_RATE, betas=(BETA1, 0.999))

    # ------------------------------------------------------------------
    # 5. Fixed noise for visualising progress across epochs
    # ------------------------------------------------------------------
    fixed_noise = torch.randn(NUM_EVAL_SAMPLES, LATENT_DIM, device=device)

    # ------------------------------------------------------------------
    # 6. Training loop
    # ------------------------------------------------------------------
    g_losses = []   # Generator loss per epoch
    d_losses = []   # Discriminator loss per epoch

    os.makedirs(MODEL_DIR, exist_ok=True)

    for epoch in range(1, NUM_EPOCHS + 1):

        epoch_g_loss = 0.0
        epoch_d_loss = 0.0
        num_batches  = 0

        for batch_idx, (real_images, _) in enumerate(dataloader):

            real_images = real_images.to(device)
            current_batch_size = real_images.size(0)

            # -------------------------------------------------------
            # Step A — Train Discriminator
            #
            # Goal: maximise  log D(real) + log(1 - D(G(z)))
            # In practice we minimise  -[log D(real) + log(1-D(fake))]
            # which equals  BCELoss(D(real), 1) + BCELoss(D(fake), 0)
            # -------------------------------------------------------
            discriminator.zero_grad()

            # Real images → label 1 (real)
            real_labels = torch.ones(current_batch_size, 1, device=device)
            real_output = discriminator(real_images)
            d_loss_real = criterion(real_output, real_labels)

            # Fake images → label 0 (fake)
            noise       = torch.randn(current_batch_size, LATENT_DIM,
                                      device=device)
            fake_images = generator(noise)
            fake_labels = torch.zeros(current_batch_size, 1, device=device)
            fake_output = discriminator(fake_images.detach())  # detach: don't backprop into G
            d_loss_fake = criterion(fake_output, fake_labels)

            # Combined discriminator loss + update
            d_loss = d_loss_real + d_loss_fake
            d_loss.backward()
            optimizer_D.step()

            # -------------------------------------------------------
            # Step B — Train Generator
            #
            # Goal: fool the discriminator, i.e. D(G(z)) → 1
            # Minimise BCELoss(D(G(z)), 1)
            # -------------------------------------------------------
            generator.zero_grad()

            # Use real labels for fake images (we want D to think they are real)
            gen_output = discriminator(fake_images)
            g_loss     = criterion(gen_output, real_labels)

            g_loss.backward()
            optimizer_G.step()

            epoch_g_loss += g_loss.item()
            epoch_d_loss += d_loss.item()
            num_batches  += 1

        # Average epoch losses
        avg_g = epoch_g_loss / num_batches
        avg_d = epoch_d_loss / num_batches
        g_losses.append(avg_g)
        d_losses.append(avg_d)

        print(f"Epoch [{epoch:>3}/{NUM_EPOCHS}]  "
              f"G Loss: {avg_g:.4f}   D Loss: {avg_d:.4f}")

        # ---------------------------------------------------------------
        # Every SAVE_EVERY epochs — save a grid of generated images
        # ---------------------------------------------------------------
        if epoch % SAVE_EVERY == 0 or epoch == 1:
            generator.eval()
            with torch.no_grad():
                eval_images = generator(fixed_noise)
            show_generated_images(eval_images, epoch, save_dir=SAVE_DIR)
            generator.train()

    # ------------------------------------------------------------------
    # 7. Save trained model weights
    # ------------------------------------------------------------------
    torch.save(generator.state_dict(),
               os.path.join(MODEL_DIR, "generator_final.pth"))
    torch.save(discriminator.state_dict(),
               os.path.join(MODEL_DIR, "discriminator_final.pth"))
    print(f"\nModels saved to: {MODEL_DIR}")

    # ------------------------------------------------------------------
    # 8. Save loss curves (JSON for dashboard + PNG)
    # ------------------------------------------------------------------
    loss_json_path = os.path.join(PROJECT_ROOT, "outputs", "training_losses.json")
    loss_data = {
        "epochs":   list(range(1, NUM_EPOCHS + 1)),
        "g_losses": [round(v, 4) for v in g_losses],
        "d_losses": [round(v, 4) for v in d_losses],
    }
    with open(loss_json_path, "w") as f:
        json.dump(loss_data, f, indent=2)
    print(f"Loss data (JSON) : {loss_json_path}")

    plot_losses(g_losses, d_losses, save_path=LOSS_PLOT)

    print("\nTraining complete!")
    print(f"Generated images : {SAVE_DIR}")
    print(f"Loss curve       : {LOSS_PLOT}")


if __name__ == "__main__":
    train()
