@echo off
REM DennepPOS Client Setup Script
REM Run this on the client PC after copying files to C:\DennepPOS\

echo ========================================
echo DennepPOS Backend - Automated Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo Node.js found: 
node --version
echo.

REM Check if we're in the correct directory
echo [2/5] Checking installation directory...
if not exist "C:\DennepPOS\backend" (
    echo ERROR: Backend folder not found in C:\DennepPOS\
    echo Please copy the backend folder to C:\DennepPOS\backend
    echo.
    pause
    exit /b 1
)
echo Installation directory verified.
echo.

REM Install backend dependencies
echo [3/5] Installing backend dependencies...
cd /d "C:\DennepPOS\backend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed successfully.
echo.

REM Test backend
echo [4/5] Testing backend startup...
timeout /t 2 /nobreak >nul
start /min cmd /c "cd /d C:\DennepPOS\backend && npm run dev"
timeout /t 10 /nobreak
echo Checking if backend is running...
curl http://localhost:3002/health >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Backend test failed. Please check manually.
) else (
    echo Backend test successful!
)
echo Stopping test backend...
powershell -Command "Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
timeout /t 2 /nobreak >nul
echo.

REM Create Task Scheduler entry
echo [5/5] Setting up Task Scheduler...
powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File C:\DennepPOS\setup-task-scheduler.ps1' -Verb RunAs"
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your computer
echo 2. Backend will auto-start on login
echo 3. Launch the Dennep POS app
echo.
echo To manually start backend:  wscript C:\DennepPOS\start-backend-hidden.vbs
echo To stop backend:             C:\DennepPOS\stop-backend.bat
echo.
pause
