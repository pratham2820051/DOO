import os
import io
import re
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


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
            dpi=300,  # Higher DPI
            poppler_path=poppler_path
        )
        return images
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")


@router.post("/extract")
async def extract_patient_from_pdf(file: UploadFile = File(...)):
    """
    Upload a scanned patient PDF.
    Returns empty template for manual data entry.
    Direct OCR extraction requires manual review of scanned forms.
    """
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read uploaded PDF
    pdf_bytes = await file.read()
    if len(pdf_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="PDF too large. Max 20MB.")

    try:
        # Convert PDF to images to verify it's readable
        images = pdf_to_images(pdf_bytes)
        if not images:
            raise HTTPException(status_code=400, detail="Could not extract pages from PDF")

        # Return empty template - user will fill manually while viewing PDF
        empty_template = {
            "name": "",
            "op_no": "",
            "date": "",
            "sex": "",
            "age": "",
            "guardian_name": "",
            "address": "",
            "colour_perception": "",
            "moving_objects": "",
            "longer_time": "",
            "gaze_preference": "",
            "looks_through": "",
            "attention_span": "",
            "squint": "",
            "seizures": "",
            "stumbling": "",
            "favourite_things": "",
            "difficulty_new": "",
            "fever_rashes": "",
            "pih": "",
            "others_antenatal": "",
            "gestation_weeks": "",
            "gestation_type": "",
            "birth_weight": "",
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

        return {
            "success": True,
            "data": empty_template,
            "pages_processed": len(images),
            "message": "PDF uploaded successfully. Please review the PDF and fill the form manually.",
            "requires_manual_entry": True
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {str(e)}")
