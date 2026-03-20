import torch
import torch.nn as nn

class ConfidenceAwareFusion(nn.Module):
    def __init__(self):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(6, 16),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.model(x)


# Initialize model
fusion_model = ConfidenceAwareFusion()

# Load trained weights if available
MODEL_PATH = "backend/services/fusion_model.pth"

try:
    fusion_model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    fusion_model.eval()
    print("✅ Fusion model loaded")
except:
    print("⚠️ Fusion model not trained yet")
