import tensorflow as tf
import numpy as np
import cv2
import os

IMG_SIZE = 224
MODEL_PATH = "ml/ultrasound/pcos_cnn_model.h5"
OUTPUT_DIR = "backend/heatmaps"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ----------------------------
# Load model (Functional-safe)
# ----------------------------
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# Find last conv layer automatically
last_conv_layer = None
for layer in reversed(model.layers):
    if isinstance(layer, tf.keras.layers.Conv2D):
        last_conv_layer = layer.name
        break

print("Using last conv layer:", last_conv_layer)

grad_model = tf.keras.models.Model(
    inputs=model.inputs,
    outputs=[model.get_layer(last_conv_layer).output, model.output]
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

    # 🔥 Normalize & amplify
    heatmap = np.maximum(heatmap, 0)
    heatmap = heatmap / (np.max(heatmap) + 1e-8)

    # 🔥 Make affected areas POP
    heatmap = np.power(heatmap, 0.3)

    heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap_uint8 = np.uint8(255 * heatmap)

    # 🔥 Apply HOT colormap (much stronger than JET)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_HOT)

    # 🔥 Overlay with strong contrast
    overlay = cv2.addWeighted(img, 0.35, heatmap_color, 0.65, 0)

    # Save heatmap
    heatmap_path = os.path.join(OUTPUT_DIR, f"heatmap_{filename}")
    cv2.imwrite(heatmap_path, overlay)

    # Risk
    prob = float(prediction[0][0])
    risk = "HIGH" if prob >= 0.6 else "LOW"

    return {
        "risk": risk,
        "confidence": round(prob, 3),
        "heatmap_path": heatmap_path
    }
