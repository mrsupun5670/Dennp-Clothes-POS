# Quick Build Script for Dennep Clothes POS
# Run this to build the production executable

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Dennep Clothes POS - Production Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "[1/2] Building Frontend..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Build Tauri App
Write-Host "[2/2] Building Tauri Application..." -ForegroundColor Yellow
npm run tauri build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tauri build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Installer Location:" -ForegroundColor Cyan
Write-Host "   src-tauri\target\release\bundle\msi\" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Executable Location:" -ForegroundColor Cyan
Write-Host "   src-tauri\target\release\dennep-clothes-pos.exe" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Find the .msi installer in the bundle folder" -ForegroundColor White
Write-Host "2. Copy to client PC" -ForegroundColor White
Write-Host "3. Install and run!" -ForegroundColor White
Write-Host ""

# Return to root directory
Set-Location -Path ".."
