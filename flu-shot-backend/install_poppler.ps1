# Install Poppler for Windows - PDF to Image conversion
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Poppler for Windows - Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "Some steps may fail. Consider right-click → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
}

# Download URL for latest Poppler
$popplerUrl = "https://github.com/oschwartz10612/poppler-windows/releases/download/v24.08.0-0/Release-24.08.0-0.zip"
$downloadPath = "$env:TEMP\poppler.zip"
$extractPath = "C:\Program Files\poppler"
$binPath = "$extractPath\poppler-24.08.0\Library\bin"

Write-Host "📥 Step 1: Downloading Poppler..." -ForegroundColor Green
try {
    Invoke-WebRequest -Uri $popplerUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "✅ Downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual download instructions:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/oschwartz10612/poppler-windows/releases" -ForegroundColor Yellow
    Write-Host "2. Download the latest Release-XX.zip" -ForegroundColor Yellow
    Write-Host "3. Extract to: C:\Program Files\poppler" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Step 2: Extracting to $extractPath..." -ForegroundColor Green
try {
    if (Test-Path $extractPath) {
        Write-Host "⚠️  $extractPath already exists, removing..." -ForegroundColor Yellow
        Remove-Item -Path $extractPath -Recurse -Force
    }
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    Write-Host "✅ Extracted successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Extraction failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Step 3: Adding to System PATH..." -ForegroundColor Green
try {
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    # Check if already in PATH
    if ($currentPath -like "*$binPath*") {
        Write-Host "⚠️  Already in PATH, skipping..." -ForegroundColor Yellow
    } else {
        # Add to PATH
        $newPath = "$currentPath;$binPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        Write-Host "✅ Added to System PATH" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANT: Restart your terminal/IDE for changes to take effect" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to modify PATH: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual PATH setup:" -ForegroundColor Yellow
    Write-Host "1. Open System Properties → Environment Variables" -ForegroundColor Yellow
    Write-Host "2. Edit 'Path' in System variables" -ForegroundColor Yellow
    Write-Host "3. Add: $binPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧹 Step 4: Cleaning up..." -ForegroundColor Green
Remove-Item -Path $downloadPath -Force
Write-Host "✅ Cleanup complete" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Poppler installed at: $extractPath" -ForegroundColor White
Write-Host "📍 Binaries location: $binPath" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. RESTART your PowerShell terminal" -ForegroundColor Yellow
Write-Host "2. RESTART VS Code / Kiro IDE" -ForegroundColor Yellow
Write-Host "3. RESTART the FastAPI backend server" -ForegroundColor Yellow
Write-Host "4. Test with: where.exe pdftoppm" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then try the PDF upload again!" -ForegroundColor Green
