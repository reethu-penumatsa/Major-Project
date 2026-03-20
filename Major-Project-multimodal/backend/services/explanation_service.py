from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load once
tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
model = AutoModelForCausalLM.from_pretrained("distilgpt2")
model.eval()

def generate_explanation(symptom, ultrasound, lab, final_risk, final_score):

    prompt = f"""
You are a clinical decision support assistant for PCOS risk evaluation.

Analyze the following multimodal results carefully and generate a concise,
safe, and medically appropriate explanation.

--- Patient Assessment Data ---
Symptom Model Prediction: {symptom['prediction']}
Symptom Confidence: {symptom['confidence']}

Ultrasound Prediction: {ultrasound['prediction']}
Ultrasound Confidence: {ultrasound['confidence']}

Lab Result: {lab['prediction']}
Lab Confidence: {lab['confidence']}

Final Combined Risk: {final_risk}
Final Probability Score: {final_score}

--- Instructions ---
1. Explain why the final risk is {final_risk}.
2. If models disagree, explain how confidence influenced the final decision.
3. Do NOT mention death or unrelated conditions.
4. Keep explanation under 120 words.
5. Provide 3 clear next-step recommendations based on the risk level.
6. Use calm and non-alarming language.

Output format:

Explanation:
<text>

Next Steps:
1.
2.
3.
"""


    inputs = tokenizer(prompt, return_tensors="pt", truncation=True)

    input_ids = inputs["input_ids"]
    attention_mask = inputs["attention_mask"]

    with torch.no_grad():
        output = model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            max_new_tokens=120,
            do_sample=True,                 # REQUIRED for temperature/top_p
            temperature=0.5,
            top_p=0.85,
            repetition_penalty=1.3,
            no_repeat_ngram_size=3,
            pad_token_id=tokenizer.eos_token_id
        )



    generated_text = tokenizer.decode(output[0], skip_special_tokens=True)

    # Remove prompt from output
    explanation = generated_text[len(prompt):].strip()

    # Remove weird numbered continuation
    if "7." in explanation:
        explanation = explanation.split("7.")[0]

    # Safety fallback
    if len(explanation) < 40:
        explanation = "Based on combined findings, the overall PCOS risk appears low. Clinical monitoring is recommended."

    return explanation
