import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.optimizers import Adam

X_train = np.load("ml/ultrasound/X_train.npy")
y_train = np.load("ml/ultrasound/y_train.npy")
X_test = np.load("ml/ultrasound/X_test.npy")
y_test = np.load("ml/ultrasound/y_test.npy")

model = Sequential([
    Input(shape=(224, 224, 3)),

    Conv2D(16, (3,3), activation="relu"),
    MaxPooling2D(2,2),

    Conv2D(32, (3,3), activation="relu"),
    MaxPooling2D(2,2),

    Flatten(),
    Dense(64, activation="relu"),
    Dense(1, activation="sigmoid")
])

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    X_train, y_train,
    epochs=5,          # 🔽 reduced
    batch_size=8,      # 🔽 reduced
    validation_split=0.2
)

loss, acc = model.evaluate(X_test, y_test)
print("Test Accuracy:", acc)

model.save("ml/ultrasound/pcos_cnn_model.h5")
print("✅ Model saved")
