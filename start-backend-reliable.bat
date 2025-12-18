@echo off
REM ============================================
REM Dennp POS Backend - Reliable Startup Script
REM ============================================
REM This script ensures backend starts reliably
REM with health verification and retry logic
REM ============================================

SET BACKEND_PATH=C:\Program Files\Dennp-POS\backend
SET LOG_FILE=C:\Program Files\Dennp-POS\logs\startup.log
SET MAX_RETRIES=3

REM Create logs directory if it doesn't exist
if not exist "C:\Program Files\Dennp-POS\logs" mkdir "C:\Program Files\Dennp-POS\logs"

echo [%date% %time%] ========================================== >> "%LOG_FILE%"
echo [%date% %time%] Starting Dennp POS Backend >> "%LOG_FILE%"
echo [%date% %time%] ========================================== >> "%LOG_FILE%"

REM Wait for system to be fully ready (Windows services, network, etc.)
echo [%date% %time%] Waiting 30 seconds for system to be ready... >> "%LOG_FILE%"
timeout /t 30 /nobreak > nul

REM Kill any existing hung processes
echo [%date% %time%] Cleaning up any existing processes... >> "%LOG_FILE%"
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 /nobreak > nul

REM Try to start backend with retries
FOR /L %%i IN (1,1,%MAX_RETRIES%) DO (
    echo [%date% %time%] Starting backend (Attempt %%i/%MAX_RETRIES%)... >> "%LOG_FILE%"
    
    REM Start backend
    cd /d "%BACKEND_PATH%"
    start /B npm run start
    
    REM Wait for backend to initialize
    echo [%date% %time%] Waiting 10 seconds for backend to initialize... >> "%LOG_FILE%"
    timeout /t 10 /nobreak > nul
    
    REM Check if backend is healthy
    curl -s -f http://localhost:3000/api/health > nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [%date% %time%] SUCCESS: Backend started and health check passed! >> "%LOG_FILE%"
        echo [%date% %time%] ========================================== >> "%LOG_FILE%"
        exit /b 0
    ) else (
        echo [%date% %time%] WARNING: Health check failed on attempt %%i >> "%LOG_FILE%"
        
        REM Kill and retry if not last attempt
        if %%i LSS %MAX_RETRIES% (
            echo [%date% %time%] Killing processes and retrying... >> "%LOG_FILE%"
            taskkill /F /IM node.exe > nul 2>&1
            timeout /t 5 /nobreak > nul
        )
    )
)

REM All attempts failed
echo [%date% %time%] ERROR: Backend startup failed after %MAX_RETRIES% attempts >> "%LOG_FILE%"
echo [%date% %time%] Frontend will attempt auto-recovery when POS app starts >> "%LOG_FILE%"
echo [%date% %time%] ========================================== >> "%LOG_FILE%"
exit /b 1
