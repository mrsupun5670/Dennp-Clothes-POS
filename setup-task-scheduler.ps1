# Task Scheduler Setup Script for Dennp POS Backend
# Run this as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Dennp POS - Task Scheduler Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Configuration
$taskName = "Dennp POS Backend"
$backendPath = "C:\Program Files\Dennp-POS\backend"
$batchFile = "$backendPath\start-backend-reliable.bat"

Write-Host "Checking backend files..." -ForegroundColor Yellow

# Check if backend folder exists
if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: Backend folder not found at: $backendPath" -ForegroundColor Red
    Write-Host "Please install the backend first!" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if batch file exists
if (-not (Test-Path $batchFile)) {
    Write-Host "ERROR: Startup script not found at: $batchFile" -ForegroundColor Red
    Write-Host "Please ensure start-backend-reliable.bat is in the backend folder!" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Backend files found!" -ForegroundColor Green
Write-Host ""

# Delete existing task if it exists
Write-Host "Checking for existing task..." -ForegroundColor Yellow
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Existing task removed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creating new scheduled task..." -ForegroundColor Yellow

# Create task action (what to run)
$action = New-ScheduledTaskAction -Execute $batchFile -WorkingDirectory $backendPath

# Create task trigger (when to run)
$trigger = New-ScheduledTaskTrigger -AtStartup
$trigger.Delay = "PT30S"  # 30 second delay

# Create task settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0)  # No time limit

# Create task principal (run with highest privileges)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Register the task
try {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description "Auto-start backend server for Dennp POS system" `
        -Force | Out-Null
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Task created successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Details:" -ForegroundColor Cyan
    Write-Host "  Name: $taskName" -ForegroundColor White
    Write-Host "  Trigger: At system startup (30 second delay)" -ForegroundColor White
    Write-Host "  Action: $batchFile" -ForegroundColor White
    Write-Host "  Runs as: SYSTEM (highest privileges)" -ForegroundColor White
    Write-Host "  Auto-restart: Yes (3 times, every 1 minute)" -ForegroundColor White
    Write-Host ""
    
    # Test the task
    Write-Host "Testing task..." -ForegroundColor Yellow
    Start-ScheduledTask -TaskName $taskName
    Write-Host "Task started! Waiting 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Check if backend is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "BACKEND IS RUNNING!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Setup complete! Backend will auto-start on system boot." -ForegroundColor Green
        }
    } catch {
        Write-Host ""
        Write-Host "WARNING: Backend may not be running yet." -ForegroundColor Yellow
        Write-Host "Check logs at: $backendPath\logs\startup.log" -ForegroundColor Yellow
        Write-Host "Wait a minute and try: http://localhost:3002/api/health" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to create task!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
pause
