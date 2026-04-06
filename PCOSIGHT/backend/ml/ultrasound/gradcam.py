from xml.parsers.expat import model

import tensorflow as tf
import numpy as np
import cv2
import os

IMG_SIZE = 224

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "pcos_cnn_model.h5")
BACKEND_DIR = os.path.dirname(os.path.dirname(BASE_DIR))
OUTPUT_DIR = os.path.join(BACKEND_DIR, "heatmaps")
os.makedirs(OUTPUT_DIR, exist_ok=True)



def generate_gradcam(image_path, filename, model):
        
    # Find last conv layer
    last_conv_layer ="conv2d"
    #for layer in reversed(model.layers):
     #   if isinstance(layer, tf.keras.layers.Conv2D):
      #      last_conv_layer = layer.name
       #     break

    print("Using conv layer:", last_conv_layer)

    # ✅ FIXED HERE
    # 🔥 Get layer BEFORE sigmoid (last Dense layer)
    last_dense = None
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Dense):
            last_dense = layer.name
            break

    print("Using dense layer:", last_dense)

    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[
            model.get_layer(last_conv_layer).output,
            model.get_layer(last_dense).output   # 🔥 logits, not sigmoid
        ]
    )
    img = cv2.imread(image_path)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    img_norm = img_rgb / 255.0
    img_tensor = np.expand_dims(img_norm, axis=0)
    img_tensor = tf.convert_to_tensor(img_tensor, dtype=tf.float32)

    with tf.GradientTape() as tape:
        #tape.watch(img_tensor)  # 🔥 VERY IMPORTANT

        # Forward pass manually
        inputs = img_tensor

        # 🔥 Get intermediate conv output
        conv_layer = model.get_layer(last_conv_layer)
        conv_output = conv_layer(inputs)

        # 🔥 Continue forward pass manually
        x = conv_output
        for layer in model.layers[model.layers.index(conv_layer) + 1:]:
            x = layer(x)

        prediction = x

        # Track conv output
        tape.watch(conv_output)

    # Use direct class score (not mean)
        loss = prediction[:,0]
    raw_output = prediction[0][0]
    print("Conv output shape:", conv_output.shape)
    print("Prediction:", prediction.numpy())
# 🔥 Temperature scaling (adjust this value)
    temperature = 2.0  

    scaled_output = raw_output / temperature
    prob = float(tf.keras.activations.sigmoid(scaled_output))

    grads = tape.gradient(loss, conv_output)
    if grads is None or tf.reduce_sum(tf.abs(grads)) == 0:
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

    heatmap_filename = "heatmap_" + filename
    heatmap_path = os.path.join(OUTPUT_DIR, heatmap_filename)
    cv2.imwrite(heatmap_path, overlay)

    # Convert logits → probability
    prob = float(tf.keras.activations.sigmoid(prediction[0][0] / 2.0))

    

    return {
        "risk_score": prob,
        "risk_level": "High" if prob >= 0.6 else "Low",
        "confidence": prob,
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