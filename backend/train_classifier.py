"""
train_classifier.py
-------------------
Fine-tunes a ResNet-18 on the PlantVillage Tomato classes to produce
a disease classification model that complements the DCGAN.

This script:
  1. Loads the PlantVillage dataset (Tomato classes).
  2. Optionally augments with GAN-generated images from outputs/synthetic_leaves/.
  3. Fine-tunes a pretrained ResNet-18 for NUM_CLASSES disease classes.
  4. Saves weights to outputs/saved_models/classifier_resnet18.pth.

Usage:
    python backend/train_classifier.py

Requirements: PlantVillage dataset at DATASET_ROOT.
"""

import os
import sys
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split, ConcatDataset
from torchvision import datasets, models, transforms

# ─── Project root ─────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# =============================================================================
# CONFIG
# =============================================================================
DATASET_ROOT   = r"E:\Gen_AI Project\dataset\PlantVillage\PlantVillage"
SYNTHETIC_DIR  = PROJECT_ROOT / "outputs" / "synthetic_leaves"   # optional GAN images
SAVE_PATH      = PROJECT_ROOT / "outputs" / "saved_models" / "classifier_resnet18.pth"

CROP           = "Tomato"
NUM_EPOCHS     = 15
BATCH_SIZE     = 32
LEARNING_RATE  = 1e-4
WEIGHT_DECAY   = 1e-4
VAL_SPLIT      = 0.15
IMAGE_SIZE     = 128
NUM_WORKERS    = 0   # Set to 0 on Windows

# =============================================================================
# Transforms
# =============================================================================
train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def build_dataset():
    full_ds = datasets.ImageFolder(root=DATASET_ROOT, transform=train_transform)

    # Filter to  Tomato classes only
    crop_lower = CROP.lower()
    tomato_idx = [
        i for i, (_, label) in enumerate(full_ds.samples)
        if crop_lower in full_ds.classes[label].lower()
    ]
    tomato_ds = torch.utils.data.Subset(full_ds, tomato_idx)

    # Map original class indices to 0…N-1 for tomato classes
    tomato_classes = sorted({
        full_ds.classes[label]
        for _, label in [full_ds.samples[i] for i in tomato_idx]
    })
    
    # Create mapping from original label to new label (0..9)
    orig_to_new = {
        full_ds.classes.index(c): i for i, c in enumerate(tomato_classes)
    }

    class MappedDataset(torch.utils.data.Dataset):
        def __init__(self, subset, mapping):
            self.subset = subset
            self.mapping = mapping
        def __len__(self):
            return len(self.subset)
        def __getitem__(self, idx):
            x, y = self.subset[idx]
            return x, self.mapping[y]

    tomato_ds = MappedDataset(torch.utils.data.Subset(full_ds, tomato_idx), orig_to_new)

    print(f"[Classifier] {len(tomato_classes)} disease classes: {tomato_classes}")
    print(f"[Classifier] {len(tomato_ds)} training images")

    return tomato_ds, len(tomato_classes)


def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n{'='*55}")
    print("  Crop Disease Classifier — Training")
    print(f"{'='*55}")
    print(f"  Device: {device}\n")

    dataset, num_classes = build_dataset()

    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--fast", action="store_true", help="Quick fine-tuning for testing.")
    args = parser.parse_args()

    num_epochs = 2 if args.fast else NUM_EPOCHS
    lr = 5e-3 if args.fast else LEARNING_RATE

    dataset, num_classes = build_dataset()

    if args.fast:
        print("[Classifier] Fast mode enabled! Subsetting dataset for rapid CPU transfer learning...")
        # Get 100 images per class max
        indices = []
        counts = {i: 0 for i in range(num_classes)}
        # dataset is MappedDataset
        orig_ds = dataset.subset.dataset
        subset_idx = dataset.subset.indices
        mapping = dataset.mapping
        
        for i in range(len(dataset)):
            real_idx = subset_idx[i]
            orig_label = orig_ds.targets[real_idx]
            label = mapping[orig_label]
            
            if counts[label] < 100:
                indices.append(i)
                counts[label] += 1
            if all(c == 100 for c in counts.values()):
                break
        dataset = torch.utils.data.Subset(dataset, indices)

    val_size   = int(len(dataset) * VAL_SPLIT)
    train_size = len(dataset) - val_size
    train_ds, val_ds = random_split(
        dataset, [train_size, val_size],
        generator=torch.Generator().manual_seed(42)
    )

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                              num_workers=NUM_WORKERS, pin_memory=device.type == "cuda")
    val_loader   = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False,
                              num_workers=NUM_WORKERS, pin_memory=device.type == "cuda")

    # ── Model ──────────────────────────────────────────────────────────────────
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    in_features = model.fc.in_features
    
    # If fast mode, freeze the base network to speed up CPU training
    if args.fast:
        for param in model.parameters():
            param.requires_grad = False
    
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(in_features, num_classes),
    )
    model.to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs)

    best_val_acc = 0.0
    SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, num_epochs + 1):
        # ── Train ─────────────────────────────────────────────────────────────
        model.train()
        train_loss, train_correct, train_total = 0.0, 0, 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            train_loss    += loss.item()
            preds          = outputs.argmax(dim=1)
            train_correct += (preds == labels).sum().item()
            train_total   += labels.size(0)

        # ── Validate ──────────────────────────────────────────────────────────
        model.eval()
        val_correct, val_total = 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                preds       = model(images).argmax(dim=1)
                val_correct += (preds == labels).sum().item()
                val_total   += labels.size(0)

        val_acc   = val_correct / val_total
        train_acc = train_correct / train_total
        scheduler.step()

        print(f"Epoch [{epoch:>2}/{num_epochs}]  "
              f"Train Acc: {train_acc:.3f}  Val Acc: {val_acc:.3f}  "
              f"Loss: {train_loss/len(train_loader):.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), str(SAVE_PATH))
            print(f"  [+] Best model saved (val_acc={val_acc:.4f})")

    print(f"\nTraining complete! Best Val Acc: {best_val_acc:.4f}")
    print(f"Weights saved to: {SAVE_PATH}")


if __name__ == "__main__":
    train()
