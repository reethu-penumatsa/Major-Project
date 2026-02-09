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
# Upload folder (shared constant)
# -------------------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
    Determines PCOS likelihood using:
    - LH/FSH ratio
    - Testosterone level (fallback)
    """

    lh = lab_values.get("LH")
    fsh = lab_values.get("FSH")
    testosterone = lab_values.get("Testosterone")

    # -------------------------
    # Case 1: LH and FSH present
    # -------------------------
    if lh and fsh:
        try:
            lh = float(lh)
            fsh = float(fsh)

            if fsh == 0:
                return "Insufficient hormone data to assess PCOS"

            ratio = lh / fsh

            if ratio > 2:
                return "Possible PCOS (Elevated LH/FSH ratio)"
            else:
                return "PCOS not indicated based on LH/FSH ratio"

        except ValueError:
            return "Invalid LH/FSH values detected"

    # -----------------------------------
    # Case 2: LH missing, Testosterone high
    # -----------------------------------
    if testosterone:
        try:
            testosterone = float(testosterone)

            # Typical PCOS threshold
            if testosterone > 70:
                return "Possible PCOS (Elevated Testosterone level)"
            else:
                return "PCOS not indicated (Testosterone within normal range)"

        except ValueError:
            return "Invalid Testosterone value detected"

    # -------------------------
    # Case 3: Not enough data
    # -------------------------
    return "Insufficient hormone data to assess PCOS"

# -------------------------------
# Main: Process all images in backend/uploads folder
# -------------------------------
