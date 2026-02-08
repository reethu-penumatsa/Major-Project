# backend/services/ocr_service.py

import pytesseract
from PIL import Image
import cv2
import re
import os

# -------------------------------
# Specify Tesseract path (Windows)
# -------------------------------
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# -------------------------------
# Function: Extract text from image
# -------------------------------
def extract_text_from_image(image_path):
    """
    Takes a path to an image and returns extracted text using OCR.
    """
    img = cv2.imread(image_path)
    if img is None:
        return "Error: Image not found."

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Apply thresholding to improve OCR accuracy
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

    # Extract text using pytesseract
    text = pytesseract.image_to_string(thresh)
    return text

# -------------------------------
# Function: Extract lab test values
# -------------------------------
def extract_lab_values(text):
    """
    Extracts common hormone lab tests using regex.
    Returns a dictionary of test names and values.
    """
    lab_data = {}

    # Clean text to reduce OCR errors
    text = text.replace(",", "").replace("l", "1")

    # Updated regex patterns with flexible parentheses handling
    patterns = {
        "LH": r"LH\s*(?:\([^\)]*\))?\s*[-:]?\s*(\d+\.?\d*)",
        "FSH": r"FSH\s*(?:\([^\)]*\))?\s*[-:]?\s*(\d+\.?\d*)",
        "Testosterone": r"Testosterone\s*[-:]?\s*(\d+\.?\d*)",
        "Prolactin": r"Prolactin\s*[-:]?\s*(\d+\.?\d*)",
        "Estradiol": r"(Estradiol|E2)\s*[-:]?\s*(\d+\.?\d*)"
    }

    for test, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            lab_data[test] = match.group(1)

    return lab_data

# -------------------------------
# Function: Check PCOS
# -------------------------------
def check_pcos(lab_values):
    """
    Uses LH/FSH ratio to suggest PCOS.
    """
    try:
        lh = float(lab_values.get("LH", 0))
        fsh = float(lab_values.get("FSH", 1))  # avoid division by 0
        ratio = lh / fsh
        if ratio > 2:
            return "Possible PCOS (LH/FSH ratio > 2)"
        else:
            return "PCOS not indicated based on LH/FSH"
    except Exception as e:
        return "Insufficient data to determine PCOS"

# -------------------------------
# Main: Process all images in backend/uploads folder
# -------------------------------
if __name__ == "__main__":
    uploads_folder = r"C:\Users\prath\OneDrive\Desktop\Major-Project-main\backend\uploads"

    if not os.path.exists(uploads_folder):
        print(f"Uploads folder not found! Checked path:\n{uploads_folder}")
        exit()

    image_files = [f for f in os.listdir(uploads_folder) if f.lower().endswith((".png", ".jpg", ".jpeg"))]

    if not image_files:
        print(f"No images found in uploads folder!\nChecked path: {uploads_folder}")
        exit()

    for image_name in image_files:
        image_path = os.path.join(uploads_folder, image_name)
        print(f"\n--- Processing {image_name} ---")

        extracted_text = extract_text_from_image(image_path)
        print("Full extracted text:\n", extracted_text)

        lab_values = extract_lab_values(extracted_text)
        print("Detected lab values:", lab_values)

        pcos_result = check_pcos(lab_values)
        print("PCOS Check:", pcos_result)
