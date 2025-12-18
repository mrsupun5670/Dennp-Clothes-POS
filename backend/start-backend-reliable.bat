@echo off
REM Silent Backend Startup Script
REM This runs the Node.js backend without showing a command window

REM Change to backend directory
cd /d "%~dp0"

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Start Node.js server silently using VBScript
cscript //nologo start-backend-silent.vbs

exit
