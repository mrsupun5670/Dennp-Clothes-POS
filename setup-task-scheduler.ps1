# DennepPOS Task Scheduler Setup Script
# Run this with Administrator privileges

$ErrorActionPreference = "Stop"

Write-Host "Setting up DennepPOS Backend Auto-Start..." -ForegroundColor Cyan
Write-Host ""

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName "DennepPOS Backend" -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "DennepPOS Backend" -Confirm:$false
}

# Create the scheduled task
try {
    $Action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "C:\DennepPOS\start-backend-hidden.vbs"
    
    $Trigger = New-ScheduledTaskTrigger -AtLogOn
    
    $Principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest
    
    $Settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 1)
    
    Register-ScheduledTask `
        -TaskName "DennepPOS Backend" `
        -Action $Action `
        -Trigger $Trigger `
        -Principal $Principal `
        -Settings $Settings `
        -Description "Auto-start Dennep POS Backend Server on system login"
    
    Write-Host ""
    Write-Host "SUCCESS! Task Scheduler configured." -ForegroundColor Green
    Write-Host ""
    Write-Host "Testing task..." -ForegroundColor Cyan
    Start-ScheduledTask -TaskName "DennepPOS Backend"
    Start-Sleep -Seconds 5
    
    # Check if backend is running
    Write-Host "Checking backend status..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "Backend is running successfully!" -ForegroundColor Green
    } catch {
        Write-Host "WARNING: Backend might not be running. Check manually." -ForegroundColor Yellow
        Write-Host "Visit: http://localhost:3002/health" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to create scheduled task" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setup complete! Backend will auto-start on login." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
