from transformers import BertTokenizer, BertModel
import torch

# Load pretrained BERT model and tokenizer (only once)
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertModel.from_pretrained("bert-base-uncased")
model.eval()

def analyze_symptoms_with_bert(symptoms):
    """
    Analyze symptoms text using BERT.
    Currently uses simple rule-based logic on top of BERT.
    """

    # Tokenize input text
    inputs = tokenizer(
        symptoms,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    # Get BERT embeddings
    with torch.no_grad():
        outputs = model(**inputs)

    # Temporary decision logic (replace later)
    text = symptoms.lower()
    if "irregular" in text or "acne" in text or "hair growth" in text:
        return "High"
    else:
        return "Low"
