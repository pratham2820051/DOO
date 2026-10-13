"""
Quick test to see what OCR extracts from a PDF
Usage: python test_direct_ocr.py path/to/pdf
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.routes.ocr_routes import pdf_to_images, extract_text_from_image, parse_patient_data

if len(sys.argv) < 2:
    print("Usage: python test_direct_ocr.py <pdf_file>")
    sys.exit(1)

pdf_path = sys.argv[1]
print(f"Testing OCR on: {pdf_path}\n")

# Read PDF
with open(pdf_path, 'rb') as f:
    pdf_bytes = f.read()

# Convert to images
print("Converting PDF to images...")
images = pdf_to_images(pdf_bytes)
print(f"✅ Got {len(images)} image(s)\n")

# Extract text from first page
print("Extracting text with Tesseract...")
text = extract_text_from_image(images[0])
print(f"✅ Extracted {len(text)} characters\n")

# Show first 1000 chars
print("=" * 60)
print("RAW OCR TEXT (first 1000 chars):")
print("=" * 60)
print(text[:1000])
print("=" * 60)

# Parse data
print("\nParsing patient data...")
data = parse_patient_data(text)

print("\n" + "=" * 60)
print("EXTRACTED DATA:")
print("=" * 60)
for key, value in data.items():
    if value:  # Only show non-empty fields
        print(f"{key}: {value}")
print("=" * 60)

print(f"\nTotal fields extracted: {sum(1 for v in data.values() if v)}")
