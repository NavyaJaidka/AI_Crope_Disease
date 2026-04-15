"""
save_images.py
--------------
Utility to save individual generated images to disk.
Used both during training (checkpoint grids) and by the
post-training generation script.
"""

import os
from PIL import Image
import torch
import torchvision.transforms.functional as TF


def tensor_to_pil(tensor: torch.Tensor) -> Image.Image:
    """
    Convert a single image tensor of shape (3, H, W) in range [-1, 1]
    to a PIL RGB image.
    """
    # De-normalize: [-1, 1] → [0, 1]
    tensor = (tensor * 0.5 + 0.5).clamp(0, 1)
    return TF.to_pil_image(tensor.cpu())


def save_image_batch(images: torch.Tensor,
                     save_dir: str,
                     prefix: str = "synthetic_leaf",
                     start_idx: int = 1):
    """
    Save every image in a batch individually.

    Parameters
    ----------
    images    : torch.Tensor  shape (N, 3, H, W)  values in [-1, 1]
    save_dir  : str           Destination folder (created if absent).
    prefix    : str           Filename prefix, e.g. 'synthetic_leaf'.
    start_idx : int           Starting integer suffix for filenames.

    Returns
    -------
    list[str]  Absolute paths of saved images.
    """
    os.makedirs(save_dir, exist_ok=True)
    saved_paths = []

    for i, img_tensor in enumerate(images):
        pil_img = tensor_to_pil(img_tensor)
        filename = f"{prefix}_{start_idx + i}.png"
        filepath = os.path.join(save_dir, filename)
        pil_img.save(filepath)
        saved_paths.append(filepath)

    print(f"[SaveImages] Saved {len(saved_paths)} image(s) to '{save_dir}'")
    return saved_paths
