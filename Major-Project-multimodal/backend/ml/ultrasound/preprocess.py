import os
import cv2
import numpy as np
from tqdm import tqdm

IMG_SIZE = 224
BASE_DIR = "ml/ultrasound/data"

def load_data(split):
    X, y = [], []
    for label, category in enumerate(["normal", "pcos"]):
        folder = os.path.join(BASE_DIR, split, category)

        for img_name in tqdm(os.listdir(folder), desc=f"{split}-{category}"):
            img_path = os.path.join(folder, img_name)

            # Read image
            img = cv2.imread(img_path)

            # ❌ If image is not read properly, skip it
            if img is None:
                print(f"⚠️ Skipping unreadable file: {img_path}")
                continue

            try:
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                img = img / 255.0
                X.append(img)
                y.append(label)
            except Exception as e:
                print(f"⚠️ Error processing {img_path}: {e}")

    return np.array(X), np.array(y)


if __name__ == "__main__":
    X_train, y_train = load_data("train")
    X_test, y_test = load_data("test")

    np.save("ml/ultrasound/X_train.npy", X_train)
    np.save("ml/ultrasound/y_train.npy", y_train)
    np.save("ml/ultrasound/X_test.npy", X_test)
    np.save("ml/ultrasound/y_test.npy", y_test)

    print("✅ Preprocessing completed")
    print("Train:", X_train.shape, y_train.shape)
    print("Test:", X_test.shape, y_test.shape)
