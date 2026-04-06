import torch
from services.fusion_model import fusion_model
from services.explanation_service import generate_explanation

# def multimodal_fusion(symptom, ultrasound, lab):

#     input_tensor = torch.tensor([[
#         symptom["risk_score"],
#         symptom["confidence"],
#         ultrasound["risk_score"],
#         ultrasound["confidence"],
#         lab["risk_score"],
#         lab["confidence"]
#     ]], dtype=torch.float32)

#     with torch.no_grad():
#         final_prob = fusion_model(input_tensor).item()

#     final_risk = "HIGH" if final_prob >= 0.6 else "LOW"
#     explanation = generate_explanation(
#         symptom,
#         ultrasound,
#         lab,
#         final_risk,
#         round(final_prob, 2)
#     )

#     return {
#         "risk": final_risk,
#         "score": round(final_prob, 2),
#         "explanation": explanation,
#     }

def multimodal_fusion(symptom, ultrasound, lab):

    input_tensor = torch.tensor([[
        symptom["risk_score"],
        symptom["confidence"],
        ultrasound["risk_score"],
        ultrasound["confidence"],
        lab["risk_score"],
        lab["confidence"]
    ]], dtype=torch.float32)
    print("\nFUSION INPUT:")
    print("Symptom:", symptom)
    print("Ultrasound:", ultrasound)
    print("Lab:", lab)

    with torch.no_grad():
        final_prob = fusion_model(input_tensor).item()
    
    print("Initial Final prob:", final_prob)

        # ✅ Apply override FIRST
    if symptom["risk_score"] > 0.6 and ultrasound["risk_score"] > 0.7:
        final_prob = max(final_prob, 0.7)

    print("Adjusted Final prob:", final_prob)

# ✅ NOW decide risk
    final_risk = "HIGH" if final_prob >= 0.5 else "LOW"
    # ---- Intelligent XAI Explanation ----
    explanation = generate_explanation(
    symptom,
    ultrasound,
    lab,
    final_risk,
    final_prob
)

    
    # ---- Dynamic Next Steps ----
    if final_risk == "HIGH":
        next_steps = [
            "Consult a gynecologist immediately",
            "Complete detailed hormonal evaluation",
            "Lifestyle modifications including diet and exercise"
        ]
    else:
        next_steps = [
            "Monitor symptoms regularly",
            "Maintain healthy lifestyle",
            "Repeat evaluation if symptoms persist"
        ]

    return {
    "risk": final_risk,
    "score": round(final_prob, 2),
    "sections": explanation["sections"]
}