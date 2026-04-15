"""
visualize.py
------------
Helper functions for plotting:
  • a grid of generated images during / after training
  • Generator and Discriminator loss curves over epochs
"""

import os
import matplotlib.pyplot as plt
import numpy as np
import torch
import torchvision.utils as vutils


# ---------------------------------------------------------------------------
# Utility: denormalize [-1, 1] → [0, 1] for display
# ---------------------------------------------------------------------------
def denormalize(tensor: torch.Tensor) -> torch.Tensor:
    """Convert a tensor normalized with mean=0.5, std=0.5 back to [0,1]."""
    return (tensor * 0.5) + 0.5


# ---------------------------------------------------------------------------
# 1. Show / save a grid of generated images
# ---------------------------------------------------------------------------
def show_generated_images(images: torch.Tensor,
                           epoch: int,
                           save_dir: str = "outputs/generated_images",
                           nrow: int = 8):
    """
    Display and save a grid of generated images.

    Parameters
    ----------
    images : torch.Tensor  shape (N, 3, H, W)  in range [-1, 1]
    epoch  : int           Current training epoch (used in filename).
    save_dir : str         Directory where the PNG is saved.
    nrow   : int           Number of images per row in the grid.
    """
    os.makedirs(save_dir, exist_ok=True)

    # Move to CPU and denormalize
    images = denormalize(images.detach().cpu())

    # Build grid (returns a single 3×H×W tensor)
    grid = vutils.make_grid(images, nrow=nrow, padding=2, normalize=False)

    # Convert to numpy (H, W, 3) for matplotlib
    grid_np = grid.permute(1, 2, 0).numpy()
    grid_np = np.clip(grid_np, 0, 1)

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.imshow(grid_np)
    ax.axis("off")
    ax.set_title(f"Generated Tomato Disease Images — Epoch {epoch}",
                 fontsize=14)

    save_path = os.path.join(save_dir, f"epoch_{epoch:03d}.png")
    plt.savefig(save_path, bbox_inches="tight", dpi=100)
    plt.show()
    print(f"[Visualize] Grid saved → {save_path}")


# ---------------------------------------------------------------------------
# 2. Plot loss curves
# ---------------------------------------------------------------------------
def plot_losses(g_losses: list,
                d_losses: list,
                save_path: str = "outputs/loss_curve.png"):
    """
    Plot Generator and Discriminator losses vs. epoch.

    Parameters
    ----------
    g_losses  : list  Generator loss per epoch.
    d_losses  : list  Discriminator loss per epoch.
    save_path : str   Where to save the PNG.
    """
    os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)

    epochs = range(1, len(g_losses) + 1)

    fig, ax = plt.subplots(figsize=(10, 5))

    ax.plot(epochs, g_losses, label="Generator Loss",
            color="#e74c3c", linewidth=2, marker="o", markersize=3)
    ax.plot(epochs, d_losses, label="Discriminator Loss",
            color="#2980b9", linewidth=2, marker="s", markersize=3)

    ax.set_title("GAN Training Loss Curves", fontsize=15)
    ax.set_xlabel("Epoch", fontsize=12)
    ax.set_ylabel("Loss", fontsize=12)
    ax.legend(fontsize=12)
    ax.grid(True, linestyle="--", alpha=0.5)

    plt.tight_layout()
    plt.savefig(save_path, dpi=120)
    plt.show()
    print(f"[Visualize] Loss curve saved → {save_path}")
