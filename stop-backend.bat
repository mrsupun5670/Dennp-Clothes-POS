@echo off
REM Stop Dennep POS Backend Server
echo Stopping Dennep POS Backend...
powershell -Command "Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
echo Backend stopped.
timeout /t 2 /nobreak >nul
