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
    
    # Clean up text - remove extra spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Extract name - look for pattern "Name * <text>"
    name = find(r'Name\s*[*:]\s*([A-Za-z\s]+?)(?:\s+OP|Gender|Sex|\d|$)', "")
    if not name or len(name) < 2:
        # Try alternative: first capitalized word after "Name"
        name = find(r'Name[^A-Z]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', "")
    
    # Extract OP number - various formats
    op_no = find(r'OP\s*[Nn]o?\s*[*:]\s*([A-Z0-9/\-]+)', "")
    if not op_no:
        op_no = find(r'OP[:\s]+([A-Z0-9/\-]+)', "")
    
    # Extract date - multiple formats
    date = find(r'Date\s*[*:]\s*(\d{1,2}[-/]\s*[A-Za-z]{3,}[-/]\s*\d{2,4})', "")
    if not date:
        date = find(r'Date\s*[*:]\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', "")
    
    # Extract age - look for digits near "Age"
    age = find(r'Age\s*[*:]\s*(\d+)', "")
    if not age:
        age = find(r'(\d+)\s*(?:yrs|years|y|months|m)\b', "")
    
    # Extract gender/sex - multiple patterns
    sex = ""
    # Check for explicit Male/Female
    if re.search(r'\bMale\b', text, re.IGNORECASE) and not re.search(r'\bFemale\b', text, re.IGNORECASE):
        sex = "Male"
    elif re.search(r'\bFemale\b', text, re.IGNORECASE):
        sex = "Female"
    # Check for M/F with boundaries
    elif re.search(r'Sex\s*[*:]\s*M\b', text):
        sex = "Male"
    elif re.search(r'Sex\s*[*:]\s*F\b', text):
        sex = "Female"
    
    # Extract guardian/parent name
    guardian = find(r"(?:Parent|Guardian|Father|Mother)(?:'s)?\s*(?:/\s*Guardian(?:'s)?)?\s*name\s*[*:]\s*([A-Za-z\s]+?)(?:\s+Address|$)", "")
    if not guardian:
        guardian = find(r"Guardian\s*[*:]\s*([A-Za-z\s]+?)(?:\n|Address|$)", "")
    
    # Extract address
    address = find(r'Address\s*[*:]\s*([A-Za-z0-9\s,.-]+?)(?:\n\n|Chief|Family|$)', "")
    
    # Extract birth weight
    birth_weight = find(r'Birth\s*[Ww]eight\s*[*:]?\s*(\d+)', "")
    
    # Extract gestation weeks
    gestation_weeks = find(r'(?:Gestation|Weeks)\s*[*:]?\s*(\d+)', "")
    
    # Check for various conditions - look for Yes(1) or checked boxes
    def check_yes(keyword):
        # Look for pattern like "keyword ... Yes(1)" or "keyword ... No(0)"
        if re.search(rf'{keyword}.*?Yes\s*\(1\)', text, re.IGNORECASE):
            return "1"
        elif re.search(rf'{keyword}.*?No\s*\(0\)', text, re.IGNORECASE):
            return "0"
        return ""
    
    chief_complaints = {
        "colour_perception": check_yes(r'Colour\s*perception'),
        "moving_objects": check_yes(r'moving\s*objects'),
        "longer_time": check_yes(r'Longer\s*time'),
        "gaze_preference": check_yes(r'Gaze\s*preference'),
        "looks_through": check_yes(r'Looks\s*through'),
        "squint": check_yes(r'Squint'),
        "seizures": check_yes(r'Seizures'),
        "stumbling": check_yes(r'Stumbling'),
    }
    
    # Extract CNS field
    cns = find(r'(?:CNS|CP|GDD|AUTISM)[:\s/]+([A-Za-z\s/]+?)(?:\n|Birth|$)', "")
    
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
        "cns": cns,
        # Initialize remaining fields as empty
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
            "raw_ocr_text": all_text if all_text.strip() else None,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")
