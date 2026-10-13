import os
import io
import json
import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

PROMPT = """
You are a medical data extraction assistant. This is a scanned CVI Clinic Proforma (Department of Ophthalmology).
Extract ALL visible patient data from this form and return it as a single flat JSON object.

Use EXACTLY these field names and value formats:

Basic Info:
- name: string (patient full name)
- op_no: string (OP number)
- date: string (date as YYYY-MM-DD if possible, else as written)
- sex: string ("Male" or "Female")
- age: string (age as written)
- guardian_name: string (parent/guardian name)
- address: string

Chief Complaints (use "1" for Yes, "0" for No, "" if not marked):
- colour_perception, moving_objects, longer_time, gaze_preference, looks_through
- attention_span: "limited" or "adequate" or ""
- squint, seizures, stumbling, favourite_things, difficulty_new

Birth History (use "1" for Yes/present, "0" for No/absent, "" if not marked):
- fever_rashes, pih, others_antenatal
- gestation_weeks: string number
- gestation_type: "preterm" or "term" or ""
- birth_weight: string (in grams)
- delivery: "0" for normal, "1" for forceps, "2" for CS, "" if not marked
- cry: "0" for immediate, "1" for delayed, "" if not marked

APGAR (use "1" for Yes/present, "0" for No/absent, "" if not marked):
- oxygen_therapy, jaundice, convulsions, hyperglycemia, chorioamnionitis
- milestones: "0" for normal, "1" for delayed, "" if not marked

Family History:
- consanguinity: "0" for absent, "1" for present, "" if not marked
- nutritional_status: string (free text)
- cns: string (free text after CP/GDD/AUTISM/)
- auditory_anomaly: "0" for absent, "1" for present, "" if not marked

Ocular Examination:
- eom: "0" for normal, "1" for restricted, "" if not marked
- visual_axes: "0" for parallel, "1" for unparallel, "" if not marked
- binocular: "0" for orthophoria, "1" for esotropia, "2" for exotropia, "" if not marked
- anterior_segment: "0" for normal, "1" for abnormal, "" if not marked
- posterior_segment: "0" for normal, "1" for abnormal, "" if not marked
- nystagmus: "0" for absent, "1" for present, "" if not marked

Return ONLY a valid JSON object with these fields. No explanation, no markdown, no code blocks. Just the raw JSON.
If a field is not visible or not filled, use empty string "".
"""


def pdf_to_images_bytes(pdf_bytes: bytes) -> list[bytes]:
    """Convert PDF bytes to list of PNG image bytes."""
    try:
        from pdf2image import convert_from_bytes
        
        # Windows poppler path - adjust if installed elsewhere
        poppler_path = r"C:\poppler\poppler-24.08.0\Library\bin"
        if not os.path.exists(poppler_path):
            poppler_path = None  # Let pdf2image search in PATH
        
        images = convert_from_bytes(
            pdf_bytes, 
            dpi=200, 
            fmt='PNG',
            poppler_path=poppler_path
        )
        result = []
        for img in images:
            buf = io.BytesIO()
            img.save(buf, format='PNG')
            result.append(buf.getvalue())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")


@router.post("/extract")
async def extract_patient_from_pdf(file: UploadFile = File(...)):
    """Upload a scanned patient PDF and extract data using Gemini Vision."""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read uploaded PDF
    pdf_bytes = await file.read()
    if len(pdf_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="PDF too large. Max 20MB.")

    # Convert PDF pages to images
    image_pages = pdf_to_images_bytes(pdf_bytes)
    if not image_pages:
        raise HTTPException(status_code=400, detail="Could not extract pages from PDF")

    # Use only first 2 pages (Basic Info is on page 1)
    pages_to_process = image_pages[:2]

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        # Build content parts: prompt + all page images
        parts = [PROMPT]
        for img_bytes in pages_to_process:
            parts.append(types.Part.from_bytes(data=img_bytes, mime_type="image/png"))

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=parts,
        )

        raw_text = response.text.strip()

        # Clean up response — remove markdown code blocks if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        raw_text = raw_text.strip()

        # Parse JSON
        extracted = json.loads(raw_text)

        return {
            "success": True,
            "data": extracted,
            "pages_processed": len(pages_to_process),
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Gemini returned non-JSON response. Try a clearer scan.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
