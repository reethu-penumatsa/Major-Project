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

    with torch.no_grad():
        final_prob = fusion_model(input_tensor).item()

    final_risk = "HIGH" if final_prob >= 0.6 else "LOW"

    # ---- Intelligent XAI Explanation ----
    explanation_parts = []

    if symptom["risk_score"] > 0.5:
        explanation_parts.append(
            "Reported symptoms suggest possible hormonal imbalance."
        )

    if ultrasound["risk_score"] > 0.5:
        explanation_parts.append(
            "Ultrasound findings show ovarian morphology associated with PCOS."
        )
    else:
        explanation_parts.append(
            "Ultrasound does not show strong PCOS indicators."
        )

    if lab["risk_score"] > 0.5:
        explanation_parts.append(
            "Hormone levels are outside normal range."
        )
    else:
        explanation_parts.append(
            "Hormone levels appear within normal range."
        )

    explanation_parts.append(
        f"Overall combined risk assessment is {final_risk} with probability {round(final_prob,2)}."
    )

    explanation = " ".join(explanation_parts)

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
        "explanation": explanation,
        "next_steps": next_steps
    }
