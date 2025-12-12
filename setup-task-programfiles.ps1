# DennepPOS Backend - Task Scheduler Setup
# Run this as Administrator

Write-Host "Setting up Task Scheduler for DennepPOS Backend..." -ForegroundColor Cyan

# Define the path
$vbsPath = "C:\Program Files\Dennep Clothes POS\start-backend-hidden.vbs"

# Check if VBS file exists
if (-not (Test-Path $vbsPath)) {
    Write-Host "ERROR: VBS file not found at: $vbsPath" -ForegroundColor Red
    pause
    exit 1
}

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName "DennepPOS Backend" -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "DennepPOS Backend" -Confirm:$false
}

# Create the task
$Action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument $vbsPath
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "DennepPOS Backend" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Auto-start Dennep POS Backend Server"

Write-Host ""
Write-Host "SUCCESS! Task created." -ForegroundColor Green
Write-Host ""
Write-Host "Testing task..." -ForegroundColor Cyan
Start-ScheduledTask -TaskName "DennepPOS Backend"
Start-Sleep -Seconds 3

Write-Host "Done! Backend will auto-start on login." -ForegroundColor Green
Write-Host ""
pause
