import tensorflow as tf
import numpy as np
import cv2
import os

IMG_SIZE = 224

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "pcos_cnn_model.h5")
OUTPUT_DIR = os.path.join(BASE_DIR, "backend/heatmaps")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load model
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# Force build
dummy = tf.zeros((1, IMG_SIZE, IMG_SIZE, 3))
model(dummy)

# Find last conv layer
last_conv_layer = None
for layer in reversed(model.layers):
    if isinstance(layer, tf.keras.layers.Conv2D):
        last_conv_layer = layer.name
        break

print("Using conv layer:", last_conv_layer)

# ✅ FIXED HERE
grad_model = tf.keras.models.Model(
    inputs=model.inputs,
    outputs=[
        model.get_layer(last_conv_layer).output,
        model.outputs[0]
    ]
)

def generate_gradcam(image_path, filename):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    img_norm = img_rgb / 255.0
    img_tensor = np.expand_dims(img_norm, axis=0)
    img_tensor = tf.convert_to_tensor(img_tensor, dtype=tf.float32)

    with tf.GradientTape() as tape:
        img_tensor = tf.convert_to_tensor(img_tensor)
        conv_output, prediction = grad_model(img_tensor, training=False)

        loss = tf.reduce_mean(prediction)
    prob = float(prediction[0][0])

    grads = tape.gradient(loss, conv_output)
    if grads is None:
        print("❌ Gradients are None — fallback used")

        return {
            "risk_score": prob,
            "confidence": prob,
            "risk_level": "High" if prob >= 0.6 else "Low",
            "explanation": "Prediction available, but heatmap could not be generated.",
            "xai": {
            "heatmap_path": None
        }
    }

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_output = conv_output[0]

    heatmap = tf.reduce_sum(conv_output * pooled_grads, axis=-1)

    heatmap = np.maximum(heatmap, 0)
    heatmap = heatmap / (np.max(heatmap) + 1e-8)

    heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap = np.uint8(255 * heatmap)

    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img, 0.4, heatmap_color, 0.6, 0)

    heatmap_path = os.path.join(OUTPUT_DIR, filename)
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