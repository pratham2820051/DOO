import os
import io
import re
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from PIL import Image
import pytesseract

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
    """Extract text from image using Tesseract OCR."""
    try:
        # Try Tesseract OCR
        text = pytesseract.image_to_string(image, lang='eng', config='--psm 6')
        return text
    except Exception as e:
        # Tesseract not available, return empty
        return ""


def parse_patient_data(text: str) -> dict:
    """Parse OCR text and extract patient fields using regex patterns."""
    
    # Helper to extract field
    def find(pattern, default=""):
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE | re.DOTALL)
        return match.group(1).strip() if match else default
    
    # Extract name (look for "Name:" followed by text)
    name = find(r'Name[:\s]+([A-Za-z\s\.]+?)(?:\s+OP|Gender|$)', "")
    if not name:
        name = find(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', "")
    
    # Extract OP number
    op_no = find(r'OP\s*[Nn]umber[:\s]+([A-Z0-9\-/]+)', "")
    if not op_no:
        op_no = find(r'OP[:\s]+([A-Z0-9\-/]+)', "")
    
    # Extract date (various formats)
    date = find(r'Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})', "")
    
    # Extract age
    age = find(r'Age[:\s]+(\d+)', "")
    if not age:
        age = find(r'(\d+)\s*(?:yrs|years|y|months|m)', "")
    
    # Extract gender/sex
    sex = ""
    if re.search(r'\bMale\b', text, re.IGNORECASE):
        sex = "Male"
    elif re.search(r'\bFemale\b', text, re.IGNORECASE):
        sex = "Female"
    elif re.search(r'\bM\b', text):
        sex = "Male"
    elif re.search(r'\bF\b', text):
        sex = "Female"
    
    # Extract guardian/parent name
    guardian = find(r'(?:Guardian|Parent|Father|Mother)[:\s]+([A-Za-z\s\.]+?)(?:\n|Address|$)', "")
    
    # Extract address
    address = find(r'Address[:\s]+(.+?)(?:\n\n|Chief|$)', "")
    
    # Extract birth weight
    birth_weight = find(r'Birth\s*[Ww]eight[:\s]+(\d+)', "")
    
    # Extract gestation weeks
    gestation_weeks = find(r'(?:Gestation|Weeks)[:\s]+(\d+)', "")
    
    # Check for various conditions in Chief Complaints
    chief_complaints = {
        "colour_perception": "1" if re.search(r'(?:Colour|Color)\s*perception.*?Yes', text, re.IGNORECASE) else "0",
        "moving_objects": "1" if re.search(r'moving\s*objects.*?Yes', text, re.IGNORECASE) else "0",
        "longer_time": "1" if re.search(r'Longer\s*time.*?Yes', text, re.IGNORECASE) else "0",
        "gaze_preference": "1" if re.search(r'Gaze\s*preference.*?Yes', text, re.IGNORECASE) else "0",
        "squint": "1" if re.search(r'Squint.*?Yes', text, re.IGNORECASE) else "0",
    }
    
    return {
        "name": name,
        "op_no": op_no,
        "date": date,
        "sex": sex,
        "age": age,
        "guardian_name": guardian,
        "address": address,
        **chief_complaints,
        "gestation_weeks": gestation_weeks,
        "birth_weight": birth_weight,
        # Initialize remaining fields as empty
        "looks_through": "",
        "attention_span": "",
        "seizures": "",
        "stumbling": "",
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
        "cns": "",
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
            "raw_ocr_text": all_text if all_text.strip() else None,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")
