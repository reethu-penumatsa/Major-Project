from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import os
import json
from PIL import Image

from services.symptom_service import analyze_symptoms_with_bert
from services.ocr_service import (
    extract_text_from_image,
    extract_lab_values,
    check_pcos,
    UPLOAD_FOLDER
)
from services.multimodal_service import multimodal_fusion

from ultrasound_api import ultrasound_bp
from flask import send_from_directory
app = Flask(__name__)
CORS(app)

app.register_blueprint(ultrasound_bp)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ✅ GLOBAL STORAGE (Very Important)
analysis_store = {
    "symptom": None,
    "ultrasound": None,
    "lab": None
}

# ---------------- BASIC ROUTES ----------------

@app.route("/")
def home():
    return "PCOSight Backend is Running"

@app.route("/health")
def health():
    return {"status": "Backend working"}

# ------------------------------------------------
# 🔥 SYMPTOM CHECK (STREAM + STORE FINAL RESULT)
# ------------------------------------------------
@app.route("/symptom-check", methods=["POST"])
def symptom_check():
    data = request.get_json()
    symptoms = data.get("symptoms", "")

    def stream():
        for chunk in analyze_symptoms_with_bert(symptoms):

            if isinstance(chunk, str):
                yield f"data: {chunk}\n\n"
            elif isinstance(chunk, dict):

    # Store structured version for fusion
                risk_score = 0.8 if chunk.get("prediction", "").lower() == "high" else 0.2

                analysis_store["symptom"] = {
                    "risk_score": risk_score,
                    "confidence": chunk.get("confidence", 0.5),  
                    "prediction": chunk.get("prediction"),
                    "xai": chunk.get("xai", {})
                }

                # 🔥 Send original chunk to frontend
                yield "event: final\n"
                yield f"data: {json.dumps(chunk)}\n\n"


            # elif isinstance(chunk, dict):
            #     # ✅ STORE FINAL SYMPTOM RESULT
            #     analysis_store["symptom"] = chunk

            #     yield "event: final\n"
            #     yield f"data: {json.dumps(chunk)}\n\n"

    return Response(stream(), mimetype="text/event-stream")


# ------------------------------------------------
# 🔬 LAB REPORT ANALYSIS (STORE RESULT)
# ------------------------------------------------
@app.route("/upload-lab-report", methods=["POST"])
def upload_labreport():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]

    if image_file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image = Image.open(image_file)
    image.save(save_path)

    extracted_text = extract_text_from_image(save_path)
    lab_values = extract_lab_values(extracted_text)
    pcos_result = check_pcos(lab_values)

    # ✅ STORE LAB RESULT
    lab_structured = {
    "risk_score": 0.7 if pcos_result == "Positive" else 0.2,
    "confidence": 0.75, 
    "prediction": pcos_result,
    "xai": {"reason": "Based on hormone levels"}
}

    analysis_store["lab"] = lab_structured

    return jsonify({
        "message": "Lab report analyzed successfully",
        "lab_values": lab_values,
        "pcos_result": pcos_result
    })


# ------------------------------------------------
# 🔬 ULTRASOUND RESULT STORE
# ------------------------------------------------
@app.route("/store-ultrasound-result", methods=["POST"])
def store_ultrasound_result():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    prediction = data.get("prediction", "").lower()

    # Convert to risk score internally
    risk_score = 0.8 if prediction == "high" else 0.2
    confidence = data.get("confidence", 50) / 100

    analysis_store["ultrasound"] = {
        "risk_score": risk_score,
        "prediction": data.get("prediction"),
        "confidence": confidence,
        "xai": data.get("xai"),             
        "heatmap_url": data.get("heatmap_url")  
    }

    print("Stored ultrasound:", analysis_store["ultrasound"])

    return jsonify({"message": "Ultrasound stored successfully"})

# ------------------------------------------------
# 🧠 FINAL MULTIMODAL FUSION
# ------------------------------------------------
@app.route("/generate-final-result", methods=["POST"])
def generate_final_result():
    symptom = analysis_store.get("symptom")
    ultrasound = analysis_store.get("ultrasound")
    lab = analysis_store.get("lab")

    if not symptom or not ultrasound or not lab:
        return jsonify({"error": "Complete all three analyses first"}), 400

    final_result = multimodal_fusion(
        symptom,
        ultrasound,
        lab
    )

    print("final result:", final_result)

    return jsonify(final_result)

# 🔥 SERVE HEATMAP IMAGES


@app.route('/heatmaps/<filename>')
def serve_heatmap(filename):
    return send_from_directory("backend/heatmaps", filename)

# ---------------- RUN APP ----------------

if __name__ == "__main__":
    app.run(debug=True)
