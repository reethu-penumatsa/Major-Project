from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from services.symptom_service import analyze_symptoms_with_bert
import os
import json
from PIL import Image

app = Flask(__name__)
CORS(app)

# ---------------- BASIC ROUTES ----------------

@app.route("/")
def home():
    return "PCOSight Backend is Running"


@app.route("/health")
def health():
    return {"status": "Backend working"}

# ------------------------------------------------
# 🔥 REAL-TIME SYMPTOM CHECK (TEXT STREAM + FINAL JSON)
# ------------------------------------------------
@app.route("/symptom-check", methods=["POST"])
def symptom_check():
    data = request.get_json()
    symptoms = data.get("symptoms", "")

    def stream():
        """
        - Streams text chunks for chat UI
        - Sends final JSON for next pipeline step
        """

        for chunk in analyze_symptoms_with_bert(symptoms):

            # 1️⃣ Plain text → user (chat-like)
            if isinstance(chunk, str):
                yield f"data: {chunk}\n\n"

            # 2️⃣ Final structured JSON → system
            elif isinstance(chunk, dict):
                yield "event: final\n"
                yield f"data: {json.dumps(chunk)}\n\n"

    return Response(stream(), mimetype="text/event-stream")

# ------------------------------------------------
# 🖼️ ULTRASOUND UPLOAD (WITH SYMPTOM DATA)
# ------------------------------------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload-ultrasound", methods=["POST"])
def upload_ultrasound():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]

    if image_file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Get PCOS risk data from the request
    pcos_risk_class = request.form.get("pcos_risk_class", "unknown")
    confidence = request.form.get("confidence", "unknown")

    # Log the received data for testing
    print(f"\n{'='*60}")
    print("📊 UPLOAD ENDPOINT - DATA RECEIVED FROM SYMPTOM SERVICE")
    print(f"{'='*60}")
    print(f"📁 Image Filename: {image_file.filename}")
    print(f"🔴 PCOS Risk Class: {pcos_risk_class}")
    print(f"📈 Confidence: {confidence}%")
    print(f"{'='*60}\n")

    save_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image = Image.open(image_file)
    image.save(save_path)

    return jsonify({
        "message": "Ultrasound image uploaded successfully",
        "filename": image_file.filename,
        "pcos_risk_class": pcos_risk_class,
        "confidence": confidence,
        "next_step": "ultrasound_analysis"
    })

# ------------------------------------------------
# 🔬 ULTRASOUND ANALYSIS (SAMPLE)
# ------------------------------------------------
# TODO: Implement actual ultrasound image analysis using computer vision
# For now, this endpoint is reserved for future development

# ---------------- RUN APP ----------------

if __name__ == "__main__":
    app.run(debug=True)
