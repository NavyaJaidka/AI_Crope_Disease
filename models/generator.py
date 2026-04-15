"""
generator.py
------------
DCGAN Generator for the AI Crop Disease Image Generator.

Architecture overview:
  Noise Vector (100-d)
      → Linear projection → reshape to (512 x 4 x 4)
      → ConvTranspose2d blocks (upscale 4→8→16→32→64→128)
      → Conv2d (refine)
      → Tanh activation
  Output: 3 × 128 × 128 RGB image
"""

import torch
import torch.nn as nn


class Generator(nn.Module):
    """
    DCGAN Generator.

    Takes a random latent noise vector of size `latent_dim` and
    progressively upsamples it into a 3 × 128 × 128 colour image.
    """

    def __init__(self, latent_dim: int = 100, feature_maps: int = 64):
        """
        Parameters
        ----------
        latent_dim  : int  Size of the input noise vector (default 100).
        feature_maps: int  Base number of feature maps (channels).
        """
        super(Generator, self).__init__()

        self.latent_dim = latent_dim

        # ------------------------------------------------------------------
        # Step 1 – Project noise vector to a 4x4 spatial feature map
        # ------------------------------------------------------------------
        self.project = nn.Sequential(
            nn.Linear(latent_dim, 512 * 4 * 4, bias=False),
            nn.BatchNorm1d(512 * 4 * 4),
            nn.ReLU(inplace=True),
        )

        # ------------------------------------------------------------------
        # Step 2 – Transposed convolutions: progressively double spatial size
        #   4×4 → 8×8 → 16×16 → 32×32 → 64×64 → 128×128
        # ------------------------------------------------------------------
        self.main = nn.Sequential(
            # Block 1: 4 → 8
            nn.ConvTranspose2d(512, feature_maps * 8,
                               kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps * 8),
            nn.ReLU(inplace=True),

            # Block 2: 8 → 16
            nn.ConvTranspose2d(feature_maps * 8, feature_maps * 4,
                               kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps * 4),
            nn.ReLU(inplace=True),

            # Block 3: 16 → 32
            nn.ConvTranspose2d(feature_maps * 4, feature_maps * 2,
                               kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps * 2),
            nn.ReLU(inplace=True),

            # Block 4: 32 → 64
            nn.ConvTranspose2d(feature_maps * 2, feature_maps,
                               kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps),
            nn.ReLU(inplace=True),

            # Block 5: 64 → 128  (output layer)
            nn.ConvTranspose2d(feature_maps, 3,
                               kernel_size=4, stride=2, padding=1, bias=False),
            nn.Tanh(),   # Output in range [-1, 1]
        )

        # Weight initialization (DCGAN paper recommendation)
        self._initialize_weights()

    # ------------------------------------------------------------------
    # Forward pass
    # ------------------------------------------------------------------
    def forward(self, z: torch.Tensor) -> torch.Tensor:
        """
        Parameters
        ----------
        z : torch.Tensor  shape (batch_size, latent_dim)

        Returns
        -------
        torch.Tensor  shape (batch_size, 3, 128, 128)  values in [-1, 1]
        """
        # Project noise to 4×4 feature map
        x = self.project(z)              # (B, 512*4*4)
        x = x.view(x.size(0), 512, 4, 4)  # (B, 512, 4, 4)

        # Upsample through transposed convolutions
        x = self.main(x)                 # (B, 3, 128, 128)
        return x

    # ------------------------------------------------------------------
    # Weight initialization
    # ------------------------------------------------------------------
    def _initialize_weights(self):
        """
        Initialize Conv and BatchNorm layers following the DCGAN paper:
        Conv weights ~ N(0, 0.02), BatchNorm weights ~ N(1, 0.02), bias=0.
        """
        for module in self.modules():
            if isinstance(module, (nn.ConvTranspose2d, nn.Conv2d)):
                nn.init.normal_(module.weight.data, 0.0, 0.02)
            elif isinstance(module, nn.BatchNorm2d):
                nn.init.normal_(module.weight.data, 1.0, 0.02)
                nn.init.constant_(module.bias.data, 0)


# ---------------------------------------------------------------------------
# Quick sanity check
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    gen = Generator(latent_dim=100)
    noise = torch.randn(4, 100)          # batch of 4 noise vectors
    out = gen(noise)
    print(f"Generator output shape: {out.shape}")   # Expected: (4, 3, 128, 128)
    print(f"Value range: [{out.min():.2f}, {out.max():.2f}]")
