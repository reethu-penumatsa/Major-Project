from transformers import BertTokenizer, BertModel, AutoTokenizer, AutoModelForCausalLM
import torch
import torch.nn as nn
import time
import os
import warnings
import re

# Suppress HuggingFace warnings
warnings.filterwarnings("ignore", category=UserWarning, module="huggingface_hub")
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# Use absolute path for model file
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "pcos_classifier.pth")

# --------- SYMPTOM KEYWORDS DATABASE ---------
PCOS_SYMPTOMS = {
    "irregular periods": ["irregular period", "irregular periods", "irregular menstruation", "irregular cycle", "unpredictable cycle", "skipped period", "missed period"],
    "acne": ["acne", "pimple", "breakout", "skin breakout", "facial acne", "body acne"],
    "weight gain": ["weight gain", "unexplained weight gain", "sudden weight gain", "hard to lose weight", "unable to lose weight"],
    "hair growth": ["excessive hair", "unwanted hair", "facial hair", "body hair", "hirsutism"],
    "hair loss": ["hair loss", "hair fall", "hair thinning", "thinning hair", "bald patch"],
    "fatigue": ["fatigue", "tired", "exhaustion", "low energy", "constant fatigue"],
    "infertility": ["infertility", "unable to get pregnant", "struggling to conceive", "difficulty conceiving"],
    "pelvic pain": ["pelvic pain", "abdominal pain", "lower abdominal pain"],
    "dark skin patches": ["dark patches", "dark skin", "skin darkening", "acanthosis nigricans"],
    "insulin resistance": ["insulin resistance", "high insulin", "blood sugar issues"],
    "mood changes": ["mood changes", "depression", "anxiety", "mood swings"],
    "irregular bleeding": ["irregular bleeding", "heavy bleeding", "abnormal bleeding"],
}

# --------- SYMPTOM RISK WEIGHTS ---------
# Primary/High-Risk PCOS symptoms get higher weights
SYMPTOM_RISK_WEIGHTS = {
    "irregular periods": 0.35,        # Primary PCOS symptom - very high weight
    "irregular bleeding": 0.30,       # Related to irregular periods
    "infertility": 0.30,              # Primary PCOS symptom
    "acne": 0.20,                     # Common but secondary symptom
    "hair growth": 0.25,              # High-risk hormonal symptom
    "hair loss": 0.20,                # Hormonal imbalance symptom
    "weight gain": 0.25,              # Very common in PCOS
    "fatigue": 0.15,                  # Common but less specific
    "pelvic pain": 0.20,              # Pain during menstruation
    "dark skin patches": 0.22,        # Sign of insulin resistance
    "insulin resistance": 0.28,       # Strong PCOS indicator
    "mood changes": 0.15,             # Less specific symptom
}

# --------- SYMPTOM-BASED RISK ASSESSMENT ---------
def calculate_symptom_based_risk(extracted_symptoms):
    """
    Calculates risk score based on symptom weights.
    Returns a risk score between 0 and 1, and adjusted prediction.
    
    Primary PCOS symptoms (irregular periods, infertility) have highest weights.
    """
    if not extracted_symptoms or extracted_symptoms == ["other"]:
        return 0.5, None  # Neutral if no recognized symptoms
    
    total_risk = 0.0
    symptom_count = len(extracted_symptoms)
    
    for symptom in extracted_symptoms:
        risk_weight = SYMPTOM_RISK_WEIGHTS.get(symptom, 0.10)
        total_risk += risk_weight
    
    # Average risk across symptoms, normalized
    symptom_risk_score = min(total_risk / max(symptom_count, 1), 1.0)
    
    print(f"\n{'='*60}")
    print("🔍 SYMPTOM-BASED RISK ASSESSMENT")
    print(f"{'='*60}")
    print(f"Extracted Symptoms: {extracted_symptoms}")
    for symptom in extracted_symptoms:
        weight = SYMPTOM_RISK_WEIGHTS.get(symptom, 0.10)
        print(f"  - {symptom}: {weight} risk weight")
    print(f"Symptom Risk Score: {symptom_risk_score:.2f} (0=Low, 1=High)")
    print(f"{'='*60}\n")
    
    # If primary PCOS symptoms detected, boost confidence
    primary_symptoms = ["irregular periods", "irregular bleeding", "infertility"]
    has_primary_symptom = any(s in primary_symptoms for s in extracted_symptoms)
    
    # Adjust prediction if primary symptoms present
    adjusted_prediction = None
    if has_primary_symptom and symptom_risk_score >= 0.25:
        adjusted_prediction = 1  # HIGH RISK
    elif symptom_risk_score >= 0.35:
        adjusted_prediction = 1  # HIGH RISK
    
    return symptom_risk_score, adjusted_prediction

# --------- LOAD BERT ------------------

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

# --------- SYMPTOM EXTRACTION FUNCTION ---------
def extract_symptoms_from_input(user_input):
    """
    Intelligently extracts PCOS symptoms from conversational input.
    Handles natural language queries like "I have irregular periods and acne"
    
    Returns:
    - extracted_symptoms: List of recognized symptom names
    - symptom_text: Clean text with only symptom mentions
    """
    user_input_lower = user_input.lower()
    extracted_symptoms = []
    found_symptom_keywords = []
    
    # Search through symptom database
    for primary_symptom, keywords in PCOS_SYMPTOMS.items():
        for keyword in keywords:
            # Use word boundary matching to avoid partial matches
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, user_input_lower):
                if primary_symptom not in extracted_symptoms:
                    extracted_symptoms.append(primary_symptom)
                    found_symptom_keywords.append(keyword)
                break
    
    # Create clean symptom text
    if extracted_symptoms:
        symptom_text = ", ".join(extracted_symptoms)
    else:
        # If no symptoms found, use original input
        symptom_text = user_input
        extracted_symptoms = ["other"]
    
    return extracted_symptoms, symptom_text

# --------- MAIN FUNCTION ---------
def analyze_symptoms_with_bert(symptoms):
    """
    Streams real-time text (chat-like)
    Emits final JSON for next step
    Intelligently extracts symptoms from conversational input
    """
    
    # ---- Step 0: Extract symptoms from conversational input ----
    extracted_symptoms, clean_symptoms_text = extract_symptoms_from_input(symptoms)
    
    print(f"\n{'='*60}")
    print("📋 SYMPTOM EXTRACTION")
    print(f"{'='*60}")
    print(f"Original Input: {symptoms[:100]}{'...' if len(symptoms) > 100 else ''}")
    print(f"Extracted Symptoms: {', '.join(extracted_symptoms)}")
    print(f"Clean Text for Analysis: {clean_symptoms_text}")
    print(f"{'='*60}\n")

    # ---- Step 1: Encode clean symptoms input ----
    inputs = bert_tokenizer(
        clean_symptoms_text,
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

    # ---- Step 3: Calculate symptom-based risk score ----
    symptom_risk_score, adjusted_prediction = calculate_symptom_based_risk(extracted_symptoms)
    
    # ---- Step 4: Combine BERT model prediction with symptom-based assessment ----
    # Use adjusted prediction if symptom analysis suggests high risk
    if adjusted_prediction is not None:
        final_prediction = adjusted_prediction
        # Boost confidence if primary symptoms detected
        if adjusted_prediction == 1:
            confidence = max(confidence, 0.75)  # At least 75% confidence for primary symptoms
    else:
        final_prediction = prediction
    
    risk_level = "High" if final_prediction == 1 else "Low"
    
    print(f"\n{'='*60}")
    print("🎯 FINAL PREDICTION")
    print(f"{'='*60}")
    print(f"BERT Model Prediction: {'HIGH' if prediction == 1 else 'LOW'} (Confidence: {confidence*100:.1f}%)")
    print(f"Symptom-Based Assessment: {'HIGH' if adjusted_prediction == 1 else 'Neutral' if adjusted_prediction is None else 'LOW'}")
    print(f"Final Prediction: {risk_level} (Confidence: {confidence*100:.1f}%)")
    print(f"{'='*60}\n")
    
    # Create personalized response based on extracted symptoms
    symptoms_str = ", ".join(extracted_symptoms) if extracted_symptoms != ["other"] else "your symptoms"
    
    personalized_intro = (
        f"Based on your reported symptoms ({symptoms_str}), "
    )
    
    if final_prediction == 1:
        main_explanation = (
            f"the assessment indicates a HIGH PCOS risk profile. "
            f"The combination of your symptoms aligns with common PCOS presentations. "
            f"The next step is crucial: please upload your ovarian ultrasound image for detailed analysis. "
            f"Ultrasound imaging is the gold standard for PCOS diagnosis and will help confirm the assessment. "
            f"You can upload your ultrasound scan in the section below to proceed with visual confirmation."
        )
    else:
        main_explanation = (
            f"the assessment indicates a LOW PCOS risk profile. "
            f"Your current symptom pattern shows fewer typical PCOS indicators. "
            f"Continue monitoring your health and maintain a healthy lifestyle with regular exercise and balanced nutrition. "
            f"If you have an ultrasound image available, you can still upload it for additional confirmation. "
            f"This assessment is for informational purposes and not a medical diagnosis."
        )
    
    # ---- Step 4: Stream response in interactive chunks ----
    # Section 1: Symptom Analysis
    symptom_intro = f"Based on your reported symptoms ({symptoms_str}), I'm analyzing your PCOS risk profile..."
    yield {
        "type": "section_header",
        "content": "📋 Symptom Analysis"
    }
    time.sleep(0.3)
    yield {
        "type": "text",
        "content": symptom_intro
    }
    time.sleep(0.8)
    
    # Section 2: Risk Assessment
    yield {
        "type": "section_header",
        "content": "⚕️ Risk Assessment"
    }
    time.sleep(0.3)
    
    if final_prediction == 1:
        assessment = (
            f"The assessment indicates a HIGH PCOS risk profile based on your symptoms. "
            f"The combination of {symptoms_str} aligns with common PCOS presentations and requires further investigation."
        )
    else:
        assessment = (
            f"The assessment indicates a LOW PCOS risk profile based on your symptoms. "
            f"Your current symptom pattern shows fewer typical PCOS indicators."
        )
    
    yield {
        "type": "text",
        "content": assessment
    }
    time.sleep(0.8)
    
    # Section 3: Next Steps
    yield {
        "type": "section_header",
        "content": "🔍 Next Steps"
    }
    time.sleep(0.3)
    
    if final_prediction == 1:
        next_steps = (
            f"The next step is crucial: please upload your ovarian ultrasound image for detailed analysis. "
            f"Ultrasound imaging is the gold standard for PCOS diagnosis and will help confirm this assessment. "
            f"Upload your ultrasound scan below to proceed with visual confirmation."
        )
    else:
        next_steps = (
            f"Continue monitoring your health with regular exercise and balanced nutrition. "
            f"If you have an ultrasound image available, you can upload it for additional confirmation. "
            f"Feel free to reach out if symptoms change or worsen."
        )
    
    yield {
        "type": "text",
        "content": next_steps
    }
    time.sleep(0.5)

    # ---- Step 5: FINAL STRUCTURED OUTPUT (FOR NEXT STEP) ----
    recommendation = (
        "Ultrasound scan suggested for further evaluation."
        if final_prediction == 1
        else "Continue monitoring your health. Consult with a doctor if symptoms persist."
    )
    
    yield {
        "type": "final_result",
        "data": {
            "extracted_symptoms": extracted_symptoms,
            "result": {
                "pcos_risk": risk_level,
                "confidence": round(confidence * 100, 2),
                "recommendation": recommendation,
                "next_step": "ultrasound_analysis" if final_prediction == 1 else "lab_analysis"
            },
            "pcos_risk_class": int(final_prediction),
            "next_step": "ultrasound_analysis",
        }
    }
