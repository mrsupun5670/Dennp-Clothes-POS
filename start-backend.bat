@echo off
REM Dennep POS Backend Auto-Start Script with Port Cleanup
REM This script kills any process using port 3002 and then starts the backend

echo ========================================
echo Dennep POS Backend Auto-Start
echo ========================================
echo.

REM Step 1: Kill any process using port 3002
echo [1/3] Checking and killing any processes on port 3002...
powershell -Command "Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
echo Port 3002 is now free.
echo.

REM Step 2: Wait a moment for port to be released
echo [2/3] Waiting for port to be released...
timeout /t 2 /nobreak >nul
echo.

REM Step 3: Change to backend directory and start server
echo [3/3] Starting Dennep POS Backend Server...
cd /d "C:\Program Files\Dennep Clothes POS\backend"

REM Start the backend server
npm run dev

REM Keep window open if there's an error
if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Backend server failed to start!
    echo ========================================
    echo Press any key to close...
    pause > nul
)
