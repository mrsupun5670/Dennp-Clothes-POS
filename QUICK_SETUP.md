# Quick Setup for Program Files Installation

## Your Files Are In:
```
C:\Program Files\Dennep Clothes POS\
├── backend\
├── start-backend.bat
├── start-backend-hidden.vbs
└── stop-backend.bat
```

## Step 1: Install Backend Dependencies

Open PowerShell **as Administrator**:
```powershell
cd "C:\Program Files\Dennep Clothes POS\backend"
npm install
```

## Step 2: Test Backend

Test if it starts:
```powershell
cd "C:\Program Files\Dennep Clothes POS"
.\start-backend.bat
```

Check in browser: http://localhost:3002/health

If working, press `Ctrl+C` to stop, then test hidden mode:
```powershell
wscript "C:\Program Files\Dennep Clothes POS\start-backend-hidden.vbs"
```

## Step 3: Set Up Task Scheduler (Auto-Start)

### Quick Method - PowerShell:
Run PowerShell **as Administrator**, then paste:
```powershell
$Action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"C:\Program Files\Dennep Clothes POS\start-backend-hidden.vbs`""

$Trigger = New-ScheduledTaskTrigger -AtLogOn

$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest

$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "DennepPOS Backend" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Auto-start Dennep POS Backend Server"
```

## Step 4: Test

Right-click the task in Task Scheduler → "Run"

Check: http://localhost:3002/health

## Done! ✅

Backend will now auto-start every time you log in.
