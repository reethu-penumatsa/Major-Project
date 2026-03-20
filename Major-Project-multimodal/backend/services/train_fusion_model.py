import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from fusion_model import ConfidenceAwareFusion

model = ConfidenceAwareFusion()
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Generate synthetic training data
X = []
y = []

for _ in range(5000):

    s_risk = np.random.uniform(0, 1)
    s_conf = np.random.uniform(0.5, 1)

    u_risk = np.random.uniform(0, 1)
    u_conf = np.random.uniform(0.5, 1)

    l_risk = np.random.uniform(0, 1)
    l_conf = np.random.uniform(0.5, 1)

    # Intelligent rule (pseudo ground truth)
    weighted_score = (
        s_risk * s_conf * 0.3 +
        u_risk * u_conf * 0.4 +
        l_risk * l_conf * 0.3
    )

    label = 1 if weighted_score > 0.6 else 0

    X.append([s_risk, s_conf, u_risk, u_conf, l_risk, l_conf])
    y.append([label])

X = torch.tensor(X, dtype=torch.float32)
y = torch.tensor(y, dtype=torch.float32)

# Training
for epoch in range(200):
    optimizer.zero_grad()
    outputs = model(X)
    loss = criterion(outputs, y)
    loss.backward()
    optimizer.step()

    if epoch % 20 == 0:
        print(f"Epoch {epoch}, Loss: {loss.item():.4f}")

# Save model
torch.save(model.state_dict(), "backend/services/fusion_model.pth")
print("✅ Fusion model trained and saved")
