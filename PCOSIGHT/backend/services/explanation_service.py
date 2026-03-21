from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
model = AutoModelForCausalLM.from_pretrained("distilgpt2")
model.eval()


# def generate_explanation(symptom, ultrasound, lab, final_risk, final_score):

#     prompt = f"""
# You are a medical AI assistant analyzing PCOS risk.

# Patient data:

# Symptoms: {symptom.get('symptom_list')}
# Symptom risk: {symptom['prediction']} ({symptom['confidence']})

# Ultrasound interpretation:
# {ultrasound.get('xai')}
# Ultrasound risk: {ultrasound['prediction']} ({ultrasound['confidence']})

# Lab findings:
# {lab.get('xai')}
# Lab risk: {lab['prediction']} ({lab['confidence']})

# Final fused risk: {final_risk}
# Probability: {final_score}

# You are a clinical reasoning assistant.

# Explain the PCOS risk decision using:
# - symptoms
# - ultrasound findings
# - hormone levels

# Be concise, medically grounded, and under 80 words.

# Then list exactly 3 recommended next steps.
# """



#     inputs = tokenizer(prompt, return_tensors="pt", truncation=True)

#     input_ids = inputs["input_ids"]
#     attention_mask = inputs["attention_mask"]

#     with torch.no_grad():
#         output = model.generate(
#             input_ids=input_ids,
#             attention_mask=attention_mask,
#             max_new_tokens=120,
#             do_sample=True,                 # REQUIRED for temperature/top_p
#             temperature=0.5,
#             top_p=0.85,
#             repetition_penalty=1.3,
#             no_repeat_ngram_size=3,
#             pad_token_id=tokenizer.eos_token_id
#         )



#     generated_text = tokenizer.decode(output[0], skip_special_tokens=True)

#     # Remove prompt from output
#     explanation = generated_text[len(prompt):].strip()

#     # Remove weird numbered continuation
#     if "7." in explanation:
#         explanation = explanation.split("7.")[0]

#     # Safety fallback
#     if len(explanation) < 40:
#         explanation = "Based on combined findings, the overall PCOS risk appears low. Clinical monitoring is recommended."

#     return explanation
def generate_explanation(symptom, ultrasound, lab, final_risk, final_score):

    # ---------------- CLEAN DATA ----------------
# -----------------------------
# SYMPTOMS (FIXED)
# -----------------------------
    symptom_list = symptom.get("xai", {}).get("symptoms", [])

    if not symptom_list or symptom_list == ["other"]:
        symptom_text = "No significant symptoms detected"
    else:
        symptom_text = ", ".join(symptom_list)

    symptom_risk = symptom.get("risk_level", "Low")
    symptom_conf = round(float(symptom.get("confidence", 0)) * 100, 2)
    #us_conf = round(ultrasound.get("confidence", 0) * 100, 2)
    #lab_conf = round(lab.get("confidence", 0) * 100, 2)
    

        # -----------------------------
    # ULTRASOUND (FIXED)
    # -----------------------------
    us_risk = ultrasound.get("risk_level", "Low")
    us_conf = round(float(ultrasound.get("confidence", 0)) * 100, 2)

    if ultrasound.get("prediction") is None:
        us_text = "No significant ovarian abnormalities detected"
    else:
        us_text = ultrasound.get("xai", {}).get("reason", "Ultrasound analysis completed")
        lab_xai = lab.get("xai", "Hormone levels within normal range")
   # -----------------------------
    # LAB (FIXED)
    # -----------------------------
    lab_risk = lab.get("risk_level", "Low")
    lab_conf = round(float(lab.get("confidence", 0)) * 100, 2)
    lab_text = lab.get("xai", {}).get("reason", "Hormone levels within normal range")
    final_conf = round(final_score * 100, 2)
    # ---------------- SECTION 1 ----------------
    analysis_text = (
        f"Symptoms: {symptom_text}. "
        f"Ultrasound: {us_text}. "
        f"Lab findings: {lab_xai}."
    )

    # ---------------- SECTION 2 ----------------
    risk_text = (
        f"The combined analysis indicates a {final_risk} PCOS risk "
        f"with a confidence of {final_conf}%."
    )

    # ---------------- SECTION 3 ----------------
    if final_risk == "HIGH":
        next_steps = [
            "Consult a gynecologist for further evaluation",
            "Perform detailed hormonal testing",
            "Adopt lifestyle changes (diet & exercise)"
        ]
    else:
        next_steps = [
            "Monitor symptoms regularly",
            "Maintain a healthy lifestyle",
            "Consult a doctor if symptoms persist"
        ]

    return {
        "sections" : [
    {
        "title": "📋 Multimodal Analysis",
        "content": f"Symptoms: {symptom_text}. Ultrasound: {us_text}. Lab findings: {lab_text}."
    },
    {
        "title": "⚕️ Risk Assessment",
        "content": f"The combined analysis indicates a {final_risk} PCOS risk with a confidence of {final_conf}%."
    },
    {
        "title": "🔍 Next Steps",
        "content": next_steps
    }
]
    }