import tensorflow as tf
import numpy as np
import cv2
import os

IMG_SIZE = 224
MODEL_PATH = "ml/ultrasound/pcos_cnn_model.h5"
OUTPUT_DIR = "backend/heatmaps"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ----------------------------
# Load model
# ----------------------------
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# 🔧 FORCE BUILD (CRITICAL FIX)
dummy_input = tf.zeros((1, IMG_SIZE, IMG_SIZE, 3))
model(dummy_input)

# ----------------------------
# Find last conv layer
# ----------------------------
last_conv_layer = None
for layer in reversed(model.layers):
    if isinstance(layer, tf.keras.layers.Conv2D):
        last_conv_layer = layer.name
        break

print("Using last conv layer:", last_conv_layer)

# ----------------------------
# Grad-CAM model
# ----------------------------
grad_model = tf.keras.models.Model(
    inputs=model.inputs,
    outputs=[model.get_layer(last_conv_layer).output, model.outputs[0]]

)

# ----------------------------
# Grad-CAM Generator
# ----------------------------
def generate_gradcam(image_path, filename):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    img_norm = img_rgb / 255.0
    img_tensor = np.expand_dims(img_norm, axis=0)

    with tf.GradientTape() as tape:
        conv_output, prediction = grad_model(img_tensor)
        loss = prediction[:, 0]

    grads = tape.gradient(loss, conv_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_output = conv_output[0]
    heatmap = tf.reduce_sum(conv_output * pooled_grads, axis=-1)

    # Normalize & amplify
    heatmap = np.maximum(heatmap, 0)
    heatmap = heatmap / (np.max(heatmap) + 1e-8)
    heatmap = np.power(heatmap, 0.3)

    heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap_uint8 = np.uint8(255 * heatmap)

    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_HOT)
    overlay = cv2.addWeighted(img, 0.35, heatmap_color, 0.65, 0)

    heatmap_path = os.path.join(OUTPUT_DIR, f"heatmap_{filename}")
    cv2.imwrite(heatmap_path, overlay)

    prob = float(prediction[0][0])

    return {
        "risk_score": round(prob, 2),
        "risk_level": "High" if prob >= 0.6 else "Low",
        "confidence": round(prob, 2),
        "explanation": (
            "Ultrasound shows ovarian morphology patterns commonly associated with PCOS."
            if prob >= 0.6 else
            "Ultrasound does not show strong PCOS indicators."
        ),
        "xai": {
            "heatmap_path": heatmap_path,
            "highlighted_regions": "Follicle dense regions"
        }
    }
