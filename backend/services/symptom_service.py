from transformers import BertTokenizer, BertModel, AutoTokenizer, AutoModelForCausalLM
import torch
import torch.nn as nn
import time
import os
import warnings

# Suppress HuggingFace warnings
warnings.filterwarnings("ignore", category=UserWarning, module="huggingface_hub")
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# Use absolute path for model file
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "pcos_classifier.pth")

# ------------------ LOAD BERT ------------------
print("Loading BERT model...")
bert_tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
bert_model = BertModel.from_pretrained("bert-base-uncased")
bert_model.eval()

# ------------------ CLASSIFIER ------------------
class PCOSClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(768, 2)  # Low / High

    def forward(self, x):
        return self.fc(x)

classifier = PCOSClassifier()
if os.path.exists(MODEL_PATH):
    classifier.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    print("✅ PCOS classifier loaded successfully")
else:
    print("⚠️  Warning: pcos_classifier.pth not found. Run 'python train_classifier.py' first.")
classifier.eval()

# ------------------ LANGUAGE MODEL ------------------
print("Loading medical language model...")
gen_tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
gen_model = AutoModelForCausalLM.from_pretrained("distilgpt2")
gen_model.eval()
print("✅ Medical language model loaded successfully")

# ------------------ MAIN FUNCTION ------------------
def analyze_symptoms_with_bert(symptoms):
    """
    Streams real-time text (chat-like)
    Emits final JSON for next step
    """

    # ---- Step 1: Encode input ----
    inputs = bert_tokenizer(
        symptoms,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    # ---- Step 2: BERT embeddings + classification ----
    with torch.no_grad():
        bert_outputs = bert_model(**inputs)
        cls_embedding = bert_outputs.last_hidden_state[:, 0, :]

        logits = classifier(cls_embedding)
        probabilities = torch.softmax(logits, dim=1)

        prediction = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0][prediction].item()

    time.sleep(0.3)

    # ---- Step 3: Personalized medical explanation based on actual symptoms ----
    risk_level = "High" if prediction == 1 else "Low"
    
    # Create personalized response based on input and risk level
    personalized_intro = (
        f"Based on your reported symptoms: {symptoms[:100]}{'...' if len(symptoms) > 100 else ''}. "
    )
    
    if prediction == 1:
        main_explanation = (
            f"The assessment indicates a HIGH PCOS risk profile. "
            f"Your symptom description aligns with common PCOS presentations. "
            f"The next step is crucial: please upload your ovarian ultrasound image for detailed analysis. "
            f"Ultrasound imaging is the gold standard for PCOS diagnosis and will help confirm the assessment. "
            f"You can upload your ultrasound scan in the section below to proceed with visual confirmation."
        )
    else:
        main_explanation = (
            f"The assessment indicates a LOW PCOS risk profile based on your symptoms. "
            f"Your current symptom pattern shows fewer typical PCOS indicators. "
            f"Continue monitoring your health and maintain a healthy lifestyle with regular exercise and balanced nutrition. "
            f"If you have an ultrasound image available, you can still upload it for additional confirmation. "
            f"This assessment is for informational purposes and not a medical diagnosis."
        )
    
    full_text = personalized_intro + main_explanation
    
    # Stream word by word for real-time effect
    words = full_text.split(" ")
    current_sentence = ""
    for word in words:
        current_sentence += word + " "
        if "." in word:
            yield current_sentence.strip() + "\n"
            current_sentence = ""
            time.sleep(0.15)
    
    if current_sentence.strip():
        yield current_sentence.strip() + ".\n"

    # ---- Step 5: FINAL STRUCTURED OUTPUT (FOR NEXT STEP) ----
    yield {
        "pcos_risk_class": int(prediction),
        "confidence": round(confidence * 100, 2),
        "next_step": "ultrasound_analysis",
    }
