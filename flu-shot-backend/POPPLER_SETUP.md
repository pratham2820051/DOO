# Poppler Installation Guide for Windows

## What is Poppler?

Poppler is required for the PDF OCR feature to convert PDF files into images before sending them to Gemini Vision API.

## Quick Installation (Already Done ✅)

Poppler has been installed to: `C:\poppler\poppler-24.08.0\`

The OCR endpoint (`app/routes/ocr_routes.py`) is configured to use this path automatically.

## Verify Installation

```powershell
Test-Path "C:\poppler\poppler-24.08.0\Library\bin\pdftoppm.exe"
# Should return: True
```

## Manual Installation (If Needed)

If you need to reinstall or install on a different machine:

### Option 1: Automated Download
```powershell
$url = "https://github.com/oschwartz10612/poppler-windows/releases/download/v24.08.0-0/Release-24.08.0-0.zip"
$zip = "$env:TEMP\poppler.zip"
$dest = "C:\poppler"
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
Expand-Archive -Path $zip -DestinationPath $dest -Force
Remove-Item $zip
```

### Option 2: Manual Download
1. Go to: https://github.com/oschwartz10612/poppler-windows/releases
2. Download latest `Release-XX.zip`
3. Extract to `C:\poppler`

## Adding to System PATH (Optional)

To use poppler system-wide:

1. Open **System Properties** → **Environment Variables**
2. Edit **System Path** variable
3. Add: `C:\poppler\poppler-24.08.0\Library\bin`
4. Restart terminal/IDE

## Testing

After installation, restart the backend and test PDF upload:
```bash
curl -X POST http://127.0.0.1:8000/api/ocr/extract \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample.pdf"
```

## Troubleshooting

### Error: "Unable to get page count. Is poppler installed?"
- **Cause**: Poppler not found or wrong path
- **Solution**: 
  1. Verify installation: `Test-Path "C:\poppler\poppler-24.08.0\Library\bin\pdftoppm.exe"`
  2. Check path in `ocr_routes.py` line ~35
  3. Restart backend server

### Error: "PDF conversion failed: ..."
- **Cause**: PDF file corrupted or unsupported format
- **Solution**: Try a different PDF or re-scan at higher quality

## Alternative: Using Chocolatey

If you have Chocolatey package manager:
```powershell
choco install poppler
```

Then remove the hardcoded path in `ocr_routes.py` (set `poppler_path = None`).
