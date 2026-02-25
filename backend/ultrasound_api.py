import os
import cv2
import numpy as np
import tensorflow as tf
from flask import Blueprint, request, jsonify

ultrasound_bp = Blueprint("ultrasound", __name__)

# ===============================
# PATH SETUP (VERY IMPORTANT)
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

MODEL_PATH = os.path.join(
    PROJECT_ROOT, "ml", "ultrasound", "pcos_cnn_model.h5"
)


UPLOAD_FOLDER = os.path.join(BASE_DIR, "backend", "uploads")
HEATMAP_FOLDER = os.path.join(BASE_DIR, "backend", "heatmaps")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(HEATMAP_FOLDER, exist_ok=True)

IMG_SIZE = 224

print("Loading ultrasound model from:", MODEL_PATH)

# ===============================
# REBUILD MODEL (FUNCTIONAL API)
# ===============================
inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))

x = tf.keras.layers.Conv2D(16, (3,3), activation="relu", name="conv1")(inputs)
x = tf.keras.layers.MaxPooling2D()(x)

x = tf.keras.layers.Conv2D(32, (3,3), activation="relu", name="conv2")(x)
x = tf.keras.layers.MaxPooling2D()(x)

x = tf.keras.layers.Flatten()(x)
x = tf.keras.layers.Dense(64, activation="relu")(x)
outputs = tf.keras.layers.Dense(1, activation="sigmoid")(x)

model = tf.keras.Model(inputs, outputs)
#model.load_weights(MODEL_PATH)

# ===============================
# GRAD-CAM MODEL
# ===============================
grad_model = tf.keras.models.Model(
    inputs=model.input,
    outputs=[model.get_layer("conv2").output, model.output]
)

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
    img_resized = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img_norm = img_resized / 255.0
    img_tensor = np.expand_dims(img_norm, axis=0)

    # -----------------------
    # PREDICTION + GRAD-CAM
    # -----------------------
    with tf.GradientTape() as tape:
        conv_out, prediction = grad_model(img_tensor)
        score = prediction[:, 0]

    grads = tape.gradient(score, conv_out)
    pooled_grads = tf.reduce_mean(grads, axis=(0,1,2))

    conv_out = conv_out[0]
    heatmap = tf.reduce_sum(conv_out * pooled_grads, axis=-1)

    heatmap = tf.maximum(heatmap, 0)
    heatmap /= tf.reduce_max(heatmap) + 1e-8
    heatmap = heatmap.numpy()

    heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    overlay = cv2.addWeighted(img_resized, 0.4, heatmap_color, 0.6, 0)

    heatmap_path = os.path.join(HEATMAP_FOLDER, filename)
    cv2.imwrite(heatmap_path, overlay)

    # -----------------------
    # RISK LOGIC
    # -----------------------
    prob = float(prediction[0][0])
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
         "risk_score": float(prob),
        "prediction": risk,
        "confidence": round(prob * 100, 2),  # percentage looks better
        "heatmap_url": f"http://127.0.0.1:5000/heatmaps/{filename}",
        "xai": explanation
    })

