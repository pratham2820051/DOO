# Install Tesseract OCR for Windows
# Run this script to download and install Tesseract

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tesseract OCR - Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Download URL for Tesseract installer
$tesseractUrl = "https://digi.bib.uni-mannheim.de/tesseract/tesseract-ocr-w64-setup-5.5.1.20241212.exe"
$installerPath = "$env:TEMP\tesseract-installer.exe"

Write-Host "Downloading Tesseract OCR installer..." -ForegroundColor Green
try {
    Invoke-WebRequest -Uri $tesseractUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Downloaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual download:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Yellow
    Write-Host "2. Download tesseract-ocr-w64-setup.exe" -ForegroundColor Yellow
    Write-Host "3. Run the installer and install to: C:\Program Files\Tesseract-OCR" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Launching installer..." -ForegroundColor Green
Write-Host "IMPORTANT: Install to the default location:" -ForegroundColor Yellow
Write-Host "  C:\Program Files\Tesseract-OCR" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to launch installer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process -FilePath $installerPath -Wait

Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Green
if (Test-Path "C:\Program Files\Tesseract-OCR\tesseract.exe") {
    Write-Host "Installation successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tesseract installed at:" -ForegroundColor White
    Write-Host "  C:\Program Files\Tesseract-OCR\tesseract.exe" -ForegroundColor White
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. RESTART the FastAPI backend server" -ForegroundColor Yellow
    Write-Host "2. Try uploading a PDF again" -ForegroundColor Yellow
} else {
    Write-Host "Installation not found!" -ForegroundColor Red
    Write-Host "Please make sure you installed to: C:\Program Files\Tesseract-OCR" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Green
Remove-Item -Path $installerPath -Force -ErrorAction SilentlyContinue
Write-Host "Done!" -ForegroundColor Green
