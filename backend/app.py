from flask import Flask, request, jsonify
from flask_cors import CORS
from services.symptom_service import analyze_symptoms_with_bert
import os
from PIL import Image



app = Flask(__name__)
CORS(app)   # 👈 add this line

@app.route("/")
def home():
    return "PCOSight Backend is Running"

@app.route("/health")
def health():
    return {"status": "Backend working"}

@app.route("/symptom-check", methods=["POST"])
def symptom_check():
    data = request.get_json()
    symptoms = data.get("symptoms", "")

    risk = analyze_symptoms_with_bert(symptoms)

    return jsonify({
        "symptoms_received": symptoms,
        "pcos_risk": risk,
        "model_used": "BERT (pretrained)"
    })
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload-ultrasound", methods=["POST"])
def upload_ultrasound():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]

    if image_file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image = Image.open(image_file)
    image.save(save_path)

    return jsonify({
        "message": "Ultrasound image uploaded successfully",
        "filename": image_file.filename
    })


if __name__ == "__main__":
    app.run(debug=True)
