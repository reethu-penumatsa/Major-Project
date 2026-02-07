from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from services.symptom_service import analyze_symptoms_with_bert
import os
import json
from PIL import Image
from flask import send_from_directory

app = Flask(__name__)
CORS(app)

from ultrasound_api import ultrasound_bp
app.register_blueprint(ultrasound_bp)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

HEATMAP_FOLDER = os.path.join(BASE_DIR, "backend", "heatmaps")

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


@app.route("/heatmaps/<filename>")
def serve_heatmap(filename):
    #heatmap_folder = os.path.join(BASE_DIR, "backend", "heatmaps")
    return send_from_directory("C:\\Users\\Reethu Penumatsa\\MajorProject\\Major-Project\\backend\\heatmaps", filename)

# ------------------------------------------------
# 🔬 ULTRASOUND ANALYSIS (SAMPLE)
# ------------------------------------------------
# TODO: Implement actual ultrasound image analysis using computer vision
# For now, this endpoint is reserved for future development

# ---------------- RUN APP ----------------

if __name__ == "__main__":
    app.run(debug=True)
