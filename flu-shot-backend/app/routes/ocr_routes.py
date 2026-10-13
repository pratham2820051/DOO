import os
import io
import re
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from PIL import Image
import pytesseract
import cv2
import numpy as np

load_dotenv()

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

# Try to set Tesseract path for Windows
TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    r"C:\Users\PRATHAM\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
]
for path in TESSERACT_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break


def extract_text_from_image(image: Image.Image) -> str:
    """Extract text from image using Tesseract OCR with preprocessing."""
    try:
        import cv2
        import numpy as np
        
        # Convert PIL to OpenCV
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Resize for better OCR (if too small)
        height, width = img.shape[:2]
        if width < 2000:
            scale = 2000 / width
            img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply bilateral filter to reduce noise while keeping edges sharp
        gray = cv2.bilateralFilter(gray, 9, 75, 75)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Morphological operations to clean up
        kernel = np.ones((1, 1), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        
        # Try multiple OCR configs for better accuracy
        configs = [
            '--psm 6 --oem 3',  # Assume uniform block of text, LSTM engine
            '--psm 4 --oem 3',  # Assume single column of text
            '--psm 3 --oem 3',  # Fully automatic page segmentation
        ]
        
        best_text = ""
        max_length = 0
        
        for config in configs:
            try:
                text = pytesseract.image_to_string(thresh, lang='eng', config=config)
                if len(text) > max_length:
                    max_length = len(text)
                    best_text = text
            except:
                continue
        
        return best_text if best_text else pytesseract.image_to_string(thresh, lang='eng')
        
    except Exception as e:
        # Fallback to simple extraction
        try:
            return pytesseract.image_to_string(image, lang='eng', config='--psm 6')
        except:
            return ""


def parse_patient_data(text: str) -> dict:
    """Parse OCR text and extract patient fields using regex patterns."""
    
    # Helper to extract field with multiple patterns
    def find_multi(patterns, default=""):
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE | re.DOTALL)
            if match:
                result = match.group(1).strip()
                # Clean up common OCR errors
                result = result.replace('|', 'I').replace('0', 'O').strip()
                if len(result) > 1:  # Avoid single character matches
                    return result
        return default
    
    # Clean text - normalize spaces
    text_normalized = re.sub(r'\s+', ' ', text)
    
    # Extract NAME with multiple patterns
    name_patterns = [
        r'Name\s*[*:•]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # Arsifa
        r'Name\s*[*:•]\s*([A-Za-z\s]+?)(?:\s+OP\s|Gender|Sex|Age)',
        r'Name[:\s]+([A-Z][a-z]+)',
    ]
    name = find_multi(name_patterns, "")
    
    # Extract OP NUMBER with multiple patterns
    op_patterns = [
        r'OP\s*[Nn]o?\s*[*:•]\s*([CcGg][/\\]\d+[/\\]\d+)',  # C/18/557
        r'OP\s*number\s*[*:•]?\s*([A-Z0-9/\\-]+)',
        r'OP[:\s]+([A-Z0-9/\\-]+)',
    ]
    op_no = find_multi(op_patterns, "")
    
    # Extract DATE with multiple patterns
    date_patterns = [
        r'Date\s*[*:•]\s*(\d{1,2}\s*[/-]\s*[A-Za-z]{3,}\s*[/-]?\s*\d{0,4})',  # 18/Apr or 18/Apr/2024
        r'Date\s*[*:•]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'Date[:\s]+(\d{1,2}\s*/\s*\w+)',
    ]
    date = find_multi(date_patterns, "")
    
    # Extract AGE - look for numbers after Age
    age_patterns = [
        r'Age\s*[*:•]\s*(\d+)\s*(?:yrs|years|months|m|y|\s|$)',
        r'Age\s*[*:•]\s*(\d+)',
        r'(?:Age|age)[:\s]+(\d+)',
    ]
    age = find_multi(age_patterns, "")
    
    # Extract GENDER/SEX
    sex = ""
    if re.search(r'Sex\s*[*:•]\s*(?:M|Male)', text, re.IGNORECASE):
        sex = "Male"
    elif re.search(r'Sex\s*[*:•]\s*(?:F|Female)', text, re.IGNORECASE):
        sex = "Female"
    elif re.search(r'\bMale\b', text) and not re.search(r'\bFemale\b', text):
        sex = "Male"
    elif re.search(r'\bFemale\b', text):
        sex = "Female"
    
    # Extract GUARDIAN NAME - specific patterns for "Parent's / Guardian's name"
    guardian_patterns = [
        r"(?:Parent'?s?\s*/\s*Guardian'?s?\s*name|Guardian'?s?\s*name)\s*[*:•]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
        r"Guardian\s*[*:•]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
        r"Parent\s*[*:•]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
    ]
    guardian = find_multi(guardian_patterns, "")
    
    # Extract ADDRESS
    address_patterns = [
        r'Address\s*[*:•]\s*([A-Za-z0-9\s,.-]+?)(?:\n\n|Chief|Family|\Z)',
        r'Address[:\s]+([^\n]+)',
    ]
    address = find_multi(address_patterns, "")
    
    # Extract BIRTH WEIGHT
    birth_weight_patterns = [
        r'Birth\s*[Ww]eight\s*[*:•]?\s*(\d+)\s*(?:gms|grams|g)?',
        r'[Ww]eight\s*[*:•]?\s*(\d{3,4})',
    ]
    birth_weight = find_multi(birth_weight_patterns, "")
    
    # Extract GESTATION WEEKS
    gestation_patterns = [
        r'(?:Gestation|gestation)\s*[*:•]?\s*(\d+)\s*(?:weeks|wks|w)?',
        r'(\d+)\s*weeks',
    ]
    gestation_weeks = find_multi(gestation_patterns, "")
    
    # Check CHECKBOXES - look for Yes(1) or No(0) patterns
    def check_field(keywords):
        for keyword in keywords:
            # Look for "keyword ... Yes(1)" pattern
            if re.search(rf'{keyword}.*?Yes\s*\(\s*1\s*\)', text, re.IGNORECASE):
                return "1"
            # Look for checked boxes near keyword
            if re.search(rf'{keyword}.*?(?:\[x\]|\[X\]|☑|✓)', text, re.IGNORECASE):
                return "1"
        # Look for explicit No(0)
        for keyword in keywords:
            if re.search(rf'{keyword}.*?No\s*\(\s*0\s*\)', text, re.IGNORECASE):
                return "0"
        return ""
    
    # Extract CNS field
    cns_patterns = [
        r'(?:CNS|CP|GDD|AUTISM)[:\s/]+([A-Za-z\s/]+?)(?:\n|Birth|$)',
    ]
    cns = find_multi(cns_patterns, "")
    
    return {
        "name": name,
        "op_no": op_no,
        "date": date,
        "sex": sex,
        "age": age,
        "guardian_name": guardian,
        "address": address,
        "colour_perception": check_field(['Colour perception', 'Color perception']),
        "moving_objects": check_field(['moving objects', 'Better vision with moving']),
        "longer_time": check_field(['Longer time', 'time to find']),
        "gaze_preference": check_field(['Gaze preference', 'light gazing']),
        "looks_through": check_field(['Looks through people']),
        "squint": check_field(['Squint']),
        "seizures": check_field(['Seizures']),
        "stumbling": check_field(['Stumbling']),
        "gestation_weeks": gestation_weeks,
        "birth_weight": birth_weight,
        "cns": cns,
        # Initialize remaining fields
        "attention_span": "",
        "favourite_things": "",
        "difficulty_new": "",
        "fever_rashes": "",
        "pih": "",
        "others_antenatal": "",
        "gestation_type": "",
        "delivery": "",
        "cry": "",
        "oxygen_therapy": "",
        "jaundice": "",
        "convulsions": "",
        "hyperglycemia": "",
        "chorioamnionitis": "",
        "milestones": "",
        "consanguinity": "",
        "nutritional_status": "",
        "auditory_anomaly": "",
        "eom": "",
        "visual_axes": "",
        "binocular": "",
        "anterior_segment": "",
        "posterior_segment": "",
        "nystagmus": "",
    }


def pdf_to_images(pdf_bytes: bytes) -> list[Image.Image]:
    """Convert PDF bytes to list of PIL images."""
    try:
        from pdf2image import convert_from_bytes
        
        # Windows poppler path
        poppler_path = r"C:\poppler\poppler-24.08.0\Library\bin"
        if not os.path.exists(poppler_path):
            poppler_path = None
        
        images = convert_from_bytes(
            pdf_bytes, 
            dpi=300,  # High DPI for better OCR
            poppler_path=poppler_path
        )
        return images
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")


@router.post("/extract")
async def extract_patient_from_pdf(file: UploadFile = File(...)):
    """Upload a scanned patient PDF and extract data using OCR."""
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read uploaded PDF
    pdf_bytes = await file.read()
    if len(pdf_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="PDF too large. Max 20MB.")

    try:
        # Convert PDF to images
        images = pdf_to_images(pdf_bytes)
        if not images:
            raise HTTPException(status_code=400, detail="Could not extract pages from PDF")

        # Process first 2 pages with OCR
        all_text = ""
        for i, img in enumerate(images[:2]):
            try:
                text = extract_text_from_image(img)
                all_text += f"\n{text}\n"
            except Exception as ocr_error:
                # OCR failed, continue
                pass

        # Parse extracted text
        if all_text.strip():
            extracted_data = parse_patient_data(all_text)
            requires_manual = False
            message = "Data extracted successfully. Please review and correct any fields."
        else:
            # No OCR available, return empty template
            extracted_data = parse_patient_data("")
            requires_manual = True
            message = "OCR not available. Please fill the form manually while viewing the PDF."

        return {
            "success": True,
            "data": extracted_data,
            "pages_processed": min(len(images), 2),
            "message": message,
            "requires_manual_entry": requires_manual,
            "raw_ocr_text": all_text[:500] if all_text.strip() else None,  # First 500 chars for debugging
            "debug_extraction": {
                "name_found": bool(extracted_data.get("name")),
                "op_no_found": bool(extracted_data.get("op_no")),
                "age_found": bool(extracted_data.get("age")),
                "total_fields_extracted": sum(1 for v in extracted_data.values() if v)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")
