from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from services.symptom_service import analyze_symptoms_with_bert
from routes.auth import auth_bp
from routes.progress import progress_bp


# -------------------------
# CREATE APP FIRST
# -------------------------
app = Flask(__name__)
CORS(app)

# -------------------------
# REGISTER BLUEPRINTS
# -------------------------
from ultrasound_api import ultrasound_bp
app.register_blueprint(ultrasound_bp)

# -------------------------
# BASIC ROUTES
# -------------------------
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(progress_bp, url_prefix="/api/progress")
@app.route("/")
def home():
    return "PCOSight Backend is Running"

@app.route("/health")
def health():
    return {"status": "Backend working"}

# -------------------------
# SYMPTOM CHECK (BERT)
# -------------------------
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

# -------------------------
# SERVE HEATMAP IMAGES
# -------------------------
@app.route("/heatmaps/<filename>")
def serve_heatmap(filename):
    return send_from_directory("heatmaps", filename)

# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
