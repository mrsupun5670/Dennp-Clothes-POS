@echo off
REM Backend Diagnostic Script
REM Run this to check if backend is running

echo ========================================
echo DennepPOS Backend - Diagnostics
echo ========================================
echo.

echo [1] Checking if Node.js is running...
tasklist | findstr /i "node.exe"
if %errorlevel% equ 0 (
    echo [OK] Node.js process is running
) else (
    echo [ERROR] Node.js is NOT running
)
echo.

echo [2] Checking port 3002...
netstat -ano | findstr :3002
if %errorlevel% equ 0 (
    echo [OK] Port 3002 is in use
) else (
    echo [ERROR] Port 3002 is NOT in use - backend not running
)
echo.

echo [3] Checking Task Scheduler...
schtasks /query /tn "DennepPOS Backend" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Task Scheduler entry exists
    schtasks /query /tn "DennepPOS Backend" /fo LIST /v | findstr "Status"
) else (
    echo [ERROR] Task Scheduler entry does NOT exist
)
echo.

echo [4] Checking backend files...
if exist "C:\Program Files\Dennep Clothes POS\backend" (
    echo [OK] Backend folder exists
) else (
    echo [ERROR] Backend folder NOT found
)

if exist "C:\Program Files\Dennep Clothes POS\start-backend-hidden.vbs" (
    echo [OK] VBS startup script exists
) else (
    echo [ERROR] VBS startup script NOT found
)
echo.

echo [5] Testing backend URL...
curl http://localhost:3002/health 2>nul
if %errorlevel% equ 0 (
    echo [OK] Backend is responding
) else (
    echo [ERROR] Backend is NOT responding
    echo Try accessing: http://localhost:3002/health in browser
)
echo.

echo ========================================
echo Diagnostic Complete
echo ========================================
echo.
echo If backend is NOT running, try:
echo 1. Run: "C:\Program Files\Dennep Clothes POS\start-backend.bat"
echo 2. Check logs in: "C:\Program Files\Dennep Clothes POS\backend\logs"
echo 3. Run Task Scheduler setup again
echo.
pause
