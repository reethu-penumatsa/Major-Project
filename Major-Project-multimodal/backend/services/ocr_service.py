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
    gray = cv2.resize(gray, None, fx=1.5, fy=1.5)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    # Apply thresholding to improve OCR accuracy
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

    # Extract text using pytesseract
    text = pytesseract.image_to_string(thresh, config="--psm 6")
    
    print("\n================ OCR TEXT ================\n")
    print(text)
    print("\n==========================================\n")
    return text

# -------------------------------
# Function: Extract lab test values
# -------------------------------
def extract_lab_values(text):
    lab_data = {}
    if not text:
        return lab_data
    text = text.replace(",", "")

    patterns = {
        # Capture LH value followed by IU (avoid ratio)
        "LH": r"L\s*H\s*(?:\([^\)]*\))?[^0-9]*([\d.]+)\s*IU",
        "FSH": r"F\s*S\s*H\s*(?:\([^\)]*\))?[^0-9]*([\d.]+)\s*IU",
        "Testosterone": r"Testosterone[^0-9]*([\d.]+)",
        "Prolactin": r"Prolactin[^0-9]*([\d.]+)",
        "Estradiol": r"(?:Estradiol|E2)[^0-9]*([\d.]+)"
    }

    for test, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            lab_data[test] = match.group(1)

    print("\nExtracted Lab Values:", lab_data)  # DEBUG
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
    if lh is not None and fsh is not None:
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
    if testosterone is not None:
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
def analyze_lab_report(image_path):
    text = extract_text_from_image(image_path)
    lab_values = extract_lab_values(text)
    assessment = check_pcos(lab_values)

    # Risk scoring logic
    risk_score = 0.4
    if "Possible PCOS" in assessment:
        risk_score = 0.75

    return {
        "lab_values": lab_values,
        "pcos_result": assessment,
        "risk_score": risk_score,
        "risk_level": "High" if risk_score >= 0.6 else "Low",
        "confidence": round(risk_score, 2),
        "explanation": assessment,
        "xai": {
            "lab_values": lab_values,
            "logic": "LH/FSH ratio and testosterone threshold"
        }
    }
