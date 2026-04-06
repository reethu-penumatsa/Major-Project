from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import os
import json
from PIL import Image
from routes.auth import auth_bp
from routes.progress import progress_bp
from routes.users import users_bp

from services.symptom_service import analyze_symptoms_with_bert
from services.ocr_service import (
    extract_text_from_image,
    extract_lab_values,
    check_pcos,
    UPLOAD_FOLDER
)
from services.multimodal_service import multimodal_fusion

from ultrasound_api import ultrasound_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(ultrasound_bp)
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(progress_bp, url_prefix="/api/progress")
app.register_blueprint(users_bp, url_prefix="/api/users")

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

                # ✅ Only handle final result
                if chunk.get("type") == "final_result":

                    final_data = chunk["data"]

                    prediction = final_data["result"]["pcos_risk"]
                    confidence = final_data["result"]["confidence"] / 100

                    risk_score = confidence 

                    analysis_store["symptom"] = {
                        "risk_score": risk_score,
                        "confidence": confidence,
                        "prediction": prediction,
                        "xai": {
                            "symptoms": final_data.get("extracted_symptoms", [])
                        }
                    }

                # 🔥 Always stream chunk
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
        "xai": {
        "reason": data.get("xai", {}).get("explanation", "Ultrasound analysis completed")
    },            
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
@app.route("/heatmaps/<filename>")
def serve_heatmap(filename):
    return send_from_directory(
        os.path.join(BASE_DIR, "heatmaps"),
        filename
    )

# ---------------- RUN APP ----------------

if __name__ == "__main__":
    app.run(debug=True)
