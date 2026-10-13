"""
Test OCR extraction on a sample PDF
Run this to debug OCR output: python test_ocr.py <pdf_file>
"""
import sys
from pdf2image import convert_from_path
import pytesseract
import os

# Set Tesseract path
TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
]
for path in TESSERACT_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        print(f"✅ Using Tesseract: {path}")
        break

if len(sys.argv) < 2:
    print("Usage: python test_ocr.py <pdf_file>")
    sys.exit(1)

pdf_file = sys.argv[1]
print(f"\n📄 Processing: {pdf_file}")
print("=" * 60)

try:
    # Convert PDF to images
    poppler_path = r"C:\poppler\poppler-24.08.0\Library\bin"
    images = convert_from_path(pdf_file, dpi=300, poppler_path=poppler_path)
    print(f"✅ Converted to {len(images)} image(s)")
    
    # Extract text from first page
    print(f"\n🔍 Extracting text from page 1...")
    text = pytesseract.image_to_string(images[0], lang='eng', config='--psm 6')
    
    print("\n" + "=" * 60)
    print("RAW OCR OUTPUT:")
    print("=" * 60)
    print(text)
    print("=" * 60)
    
    # Try to find key fields
    print("\n🎯 Detected Fields:")
    print("-" * 60)
    
    import re
    
    # Name
    name = re.search(r'Name\s*[*:]\s*([A-Za-z\s]+?)(?:\s+OP|Gender|Sex|\d|$)', text, re.IGNORECASE)
    print(f"Name: {name.group(1) if name else 'NOT FOUND'}")
    
    # OP No
    op_no = re.search(r'OP\s*[Nn]o?\s*[*:]\s*([A-Z0-9/\-]+)', text, re.IGNORECASE)
    print(f"OP No: {op_no.group(1) if op_no else 'NOT FOUND'}")
    
    # Age
    age = re.search(r'Age\s*[*:]\s*(\d+)', text, re.IGNORECASE)
    print(f"Age: {age.group(1) if age else 'NOT FOUND'}")
    
    # Date
    date = re.search(r'Date\s*[*:]\s*([0-9/\-A-Za-z\s]+?)(?:\s+[A-Z]|$)', text, re.IGNORECASE)
    print(f"Date: {date.group(1).strip() if date else 'NOT FOUND'}")
    
    # Guardian
    guardian = re.search(r"(?:Parent|Guardian)(?:'s)?\s*(?:/\s*Guardian(?:'s)?)?\s*name\s*[*:]\s*([A-Za-z\s]+?)(?:\s+Address|$)", text, re.IGNORECASE)
    print(f"Guardian: {guardian.group(1) if guardian else 'NOT FOUND'}")
    
    print("-" * 60)
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
