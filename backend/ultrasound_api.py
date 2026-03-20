import os
import cv2
import numpy as np
import tensorflow as tf
from flask import Blueprint, request, jsonify

ultrasound_bp = Blueprint("ultrasound", __name__)
from ml.ultrasound.gradcam import generate_gradcam

# ===============================
# PATH SETUP (VERY IMPORTANT)
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

MODEL_PATH = os.path.join(
    BASE_DIR, "ml", "ultrasound", "pcos_cnn_model.h5"
)

print("Model path:", MODEL_PATH)
print("Exists:", os.path.exists(MODEL_PATH))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "backend", "uploads")
HEATMAP_FOLDER = os.path.join(BASE_DIR, "backend", "heatmaps")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(HEATMAP_FOLDER, exist_ok=True)

IMG_SIZE = 224

print("Loading ultrasound model from:", MODEL_PATH)

# ===============================
# REBUILD MODEL (FUNCTIONAL API)
# ===============================
# inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))

# x = tf.keras.layers.Conv2D(16, (3,3), activation="relu", name="conv1")(inputs)
# x = tf.keras.layers.MaxPooling2D()(x)

# x = tf.keras.layers.Conv2D(32, (3,3), activation="relu", name="conv2")(x)
# x = tf.keras.layers.MaxPooling2D()(x)

# x = tf.keras.layers.Flatten()(x)
# x = tf.keras.layers.Dense(64, activation="relu")(x)
# outputs = tf.keras.layers.Dense(1, activation="sigmoid")(x)

# model = tf.keras.Model(inputs, outputs)
#model.load_weights(MODEL_PATH)
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# 🔥 Build model
dummy = tf.zeros((1, 224, 224, 3))
model(dummy)

# Grad-CAM model
# 🔍 Find last conv layer automatically
# last_conv_layer = None
# for layer in reversed(model.layers):
#     if isinstance(layer, tf.keras.layers.Conv2D):
#         last_conv_layer = layer.name
#         break

# print("Using last conv layer:", last_conv_layer)

# # ✅ Correct Grad-CAM model
# grad_model = tf.keras.models.Model(
#     inputs=model.inputs,
#     outputs=[model.get_layer(last_conv_layer).output, model.output]
# )
# ===============================
# API ENDPOINT
# ===============================
@ultrasound_bp.route("/ultrasound-check", methods=["POST"])
def ultrasound_check():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    filename = file.filename

    img_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(img_path)

    # -----------------------
    # PREPROCESS IMAGE
    # -----------------------
    img = cv2.imread(img_path)
    if img is None:
        return jsonify({"error": "Invalid image"}), 400
    img_resized = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img_color = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  
    img_norm = img_resized / 255.0
    img_tensor = np.expand_dims(img_norm, axis=0)
    result = generate_gradcam(img_path, filename)

    if isinstance(result, tuple):  # error case
        return result

    prob = result["risk_score"]
    risk = "HIGH" if prob >= 0.6 else "LOW"
    # -----------------------
# EXPLANATION LOGIC
# -----------------------
    if risk == "HIGH":
        explanation = (
            "The heatmap highlights regions with dense follicular patterns. "
            "Such peripheral follicle distribution and increased stromal activity "
            "are commonly associated with Polycystic Ovary Syndrome (PCOS)."
        )
    else:
        explanation = (
            "The ultrasound image shows a more uniform ovarian structure. "
            "No significant follicular clustering is observed, which is "
            "typically indicative of normal ovarian morphology."
        )
    os.remove(img_path)
    return jsonify({
    "risk": risk,
    "confidence":  round(result["confidence"] * 100, 2),
    "explanation": explanation,
    "heatmap_url": f"http://127.0.0.1:5000/heatmaps/{filename}"
})

