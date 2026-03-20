"""
Training script to create and save the PCOS classifier model
This generates synthetic training data and trains the classifier
"""

import torch
import torch.nn as nn
from torch.optim import Adam
from transformers import BertTokenizer, BertModel
import numpy as np

# Load BERT components
print("Loading BERT model...")
bert_tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased")
bert_model.eval()

# Define classifier architecture (matching the one in symptom_service.py)
class PCOSClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(768, 2)  # Low (0) / High (1)

    def forward(self, x):
        return self.fc(x)

# Synthetic training data with PCOS symptoms
high_risk_symptoms = [
    "irregular periods missed cycle amenorrhea",
    "unexplained weight gain obesity difficulty losing weight",
    "acne oily skin persistent breakouts",
    "excess facial hair hirsutism unwanted hair growth",
    "male pattern baldness hair loss androgenetic alopecia",
    "infertility difficulty conceiving reproductive issues",
    "insulin resistance prediabetes high blood sugar",
    "dark skin patches acanthosis nigricans discoloration",
    "mood swings depression anxiety emotional changes",
    "fatigue tiredness exhaustion low energy",
    "pelvic pain chronic pelvic pain discomfort",
    "heavy periods heavy bleeding menorrhagia",
]

low_risk_symptoms = [
    "regular menstrual cycle normal periods",
    "stable weight maintained weight",
    "clear skin healthy complexion",
    "normal hair growth",
    "normal fertility easy conception",
    "normal blood sugar levels",
    "good energy levels good mood",
    "light to moderate periods normal flow",
    "no significant health concerns",
    "healthy weight bmi in range",
    "no irregular bleeding",
    "no hormonal imbalances",
]

# Generate training data
print("Generating training data...")
X_train = []
y_train = []

# Add high-risk samples (label 1)
for _ in range(50):
    # Randomly combine symptoms
    num_symptoms = np.random.randint(2, 5)
    sample = " ".join(np.random.choice(high_risk_symptoms, num_symptoms, replace=False))
    X_train.append(sample)
    y_train.append(1)

# Add low-risk samples (label 0)
for _ in range(50):
    # Randomly combine symptoms
    num_symptoms = np.random.randint(2, 5)
    sample = " ".join(np.random.choice(low_risk_symptoms, num_symptoms, replace=False))
    X_train.append(sample)
    y_train.append(0)

# Convert to tensors
print(f"Training with {len(X_train)} samples...")

# Initialize model and optimizer
device = torch.device("cpu")
classifier = PCOSClassifier().to(device)
optimizer = Adam(classifier.parameters(), lr=0.0001)
loss_fn = nn.CrossEntropyLoss()

# Training loop
print("Training classifier...")
num_epochs = 10

for epoch in range(num_epochs):
    total_loss = 0
    
    for symptom_text, label in zip(X_train, y_train):
        # Tokenize input
        inputs = bert_tokenizer(
            symptom_text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=128
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Get BERT embeddings
        with torch.no_grad():
            bert_outputs = bert_model(**inputs)
            cls_embedding = bert_outputs.last_hidden_state[:, 0, :]
        
        # Forward pass through classifier
        logits = classifier(cls_embedding)
        loss = loss_fn(logits, torch.tensor([label]).to(device))
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    avg_loss = total_loss / len(X_train)
    print(f"Epoch {epoch + 1}/{num_epochs}, Loss: {avg_loss:.4f}")

# Save the trained model
print("\nSaving model...")
torch.save(classifier.state_dict(), "pcos_classifier.pth")
print("✅ Model saved as 'pcos_classifier.pth'")
print("\nTraining complete! You can now run the Flask app.")
