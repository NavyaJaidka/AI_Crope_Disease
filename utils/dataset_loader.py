"""
dataset_loader.py
-----------------
Loads the PlantVillage dataset (Tomato classes only) using PyTorch's
ImageFolder and DataLoader.

Images are resized to 128x128 and normalized to [-1, 1] so they are
compatible with a DCGAN that uses Tanh as its output activation.
"""

import os
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms


def get_dataloader(dataset_root: str,
                   crop: str = "Tomato",
                   image_size: int = 128,
                   batch_size: int = 64,
                   num_workers: int = 2) -> DataLoader:
    """
    Build a DataLoader that serves images from all sub-folders whose
    name starts with *crop* (default: "Tomato").

    Parameters
    ----------
    dataset_root : str
        Path to the PlantVillage root folder that contains the class
        sub-directories (e.g. 'Tomato___Early_blight', 'Tomato___Healthy').
    crop : str
        Only load classes whose folder name contains this string.
    image_size : int
        Both height and width to resize every image to.
    batch_size : int
        Number of images per batch.
    num_workers : int
        Sub-processes used for data loading (set to 0 on Windows if
        you hit multiprocessing errors).

    Returns
    -------
    DataLoader
    """

    # ------------------------------------------------------------------
    # Step 1 – Define image transforms
    #   • Resize  → 128 x 128
    #   • ToTensor converts PIL [0,255] → float [0,1]
    #   • Normalize maps [0,1] → [-1,1]  (mean=0.5, std=0.5 per channel)
    # ------------------------------------------------------------------
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=(0.5, 0.5, 0.5),
                             std=(0.5, 0.5, 0.5)),
    ])

    # ------------------------------------------------------------------
    # Step 2 – Load the full dataset with ImageFolder
    #   ImageFolder expects:  root/class_name/image.jpg
    # ------------------------------------------------------------------
    full_dataset = datasets.ImageFolder(root=dataset_root,
                                        transform=transform)

    # ------------------------------------------------------------------
    # Step 3 – Filter to keep only the chosen crop's classes
    # ------------------------------------------------------------------
    crop_lower = crop.lower()

    # Collect indices where the class name starts with the crop name
    filtered_indices = [
        idx for idx, (_, label) in enumerate(full_dataset.samples)
        if crop_lower in full_dataset.classes[label].lower()
    ]

    if len(filtered_indices) == 0:
        raise ValueError(
            f"No classes found for crop='{crop}' in '{dataset_root}'.\n"
            f"Available classes: {full_dataset.classes}"
        )

    print(f"[DataLoader] Crop      : {crop}")
    print(f"[DataLoader] Images    : {len(filtered_indices)}")

    # Subset the dataset
    crop_dataset = torch.utils.data.Subset(full_dataset, filtered_indices)

    # ------------------------------------------------------------------
    # Step 4 – Wrap in a DataLoader
    # ------------------------------------------------------------------
    loader = DataLoader(
        crop_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        drop_last=True,        # keep every batch the same size
        pin_memory=torch.cuda.is_available(),
    )

    print(f"[DataLoader] Batches   : {len(loader)}")
    return loader
