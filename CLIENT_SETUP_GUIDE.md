# Task Scheduler Setup Guide for Client PC

## Prerequisites
- Node.js installed
- Backend folder copied to client PC
- All startup scripts in place

## Step-by-Step Setup

### Step 1: Choose Installation Directory
Recommended location (consistent across all PCs):
```
C:\DennepPOS\
```

### Step 2: Copy Files to Client PC
```
C:\DennepPOS\
├── backend\              (entire backend folder)
├── start-backend.bat
├── start-backend-hidden.vbs
└── stop-backend.bat
```

### Step 3: Update Paths in Files

#### A. Edit `start-backend.bat` (line 27)
Change this line:
```batch
cd /d "C:\Users\LENOVO\Documents\ElectronProjects\Dennp-Clothes-POS\backend"
```
To:
```batch
cd /d "C:\DennepPOS\backend"
```

#### B. Edit `start-backend-hidden.vbs` (line 2)
Change this line:
```vbscript
WshShell.Run "cmd /c ""C:\Users\LENOVO\Documents\ElectronProjects\Dennp-Clothes-POS\start-backend.bat""", 0, False
```
To:
```vbscript
WshShell.Run "cmd /c ""C:\DennepPOS\start-backend.bat""", 0, False
```

### Step 4: Install Backend Dependencies
Open PowerShell/CMD in `C:\DennepPOS\backend`:
```powershell
cd C:\DennepPOS\backend
npm install
```

### Step 5: Test Backend Manually
Test if backend starts:
```powershell
# Test visible window
C:\DennepPOS\start-backend.bat

# Test hidden mode
wscript C:\DennepPOS\start-backend-hidden.vbs
```

Check if backend is running:
- Open browser: http://localhost:3002/health
- Should see: `{"success":true,"message":"Server is running"}`

### Step 6: Set Up Task Scheduler

#### Method A: Using PowerShell (Easiest)
Run PowerShell as Administrator:
```powershell
$Action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "C:\DennepPOS\start-backend-hidden.vbs"
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive -RunLevel Highest
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "DennepPOS Backend" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Auto-start Dennep POS Backend Server"
```

#### Method B: Using GUI (Manual)
1. Press `Win + R`, type `taskschd.msc`, press Enter
2. Click "Create Task" (right panel)
3. **General Tab:**
   - Name: `DennepPOS Backend`
   - Description: `Auto-start Dennep POS Backend Server`
   - ✅ Run whether user is logged on or not
   - ✅ Run with highest privileges
   - Configure for: Windows 10

4. **Triggers Tab:**
   - Click "New..."
   - Begin the task: `At log on`
   - Settings: `Any user`
   - ✅ Enabled
   - Click OK

5. **Actions Tab:**
   - Click "New..."
   - Action: `Start a program`
   - Program/script: `wscript.exe`
   - Add arguments: `C:\DennepPOS\start-backend-hidden.vbs`
   - Click OK

6. **Conditions Tab:**
   - ✅ Uncheck "Start the task only if the computer is on AC power"

7. **Settings Tab:**
   - ✅ Allow task to be run on demand
   - ✅ Run task as soon as possible after a scheduled start is missed
   - ✅ If the task fails, restart every: 1 minute (3 times)

8. Click OK, enter admin password if prompted

### Step 7: Test Task Scheduler
Right-click the task → "Run"

Check if backend started:
- Open Task Manager (Ctrl+Shift+Esc)
- Look for `node.exe` process
- Or check: http://localhost:3002/health

### Step 8: Restart PC and Verify
Restart the computer and verify backend auto-starts.

## Troubleshooting

### Issue: VBS file not working
**Check:**
1. Are paths correct in the VBS file?
2. Run manually: `wscript C:\DennepPOS\start-backend-hidden.vbs`
3. Check Windows Event Viewer for errors

### Issue: Backend not starting
**Check:**
1. Is Node.js installed? `node --version`
2. Are npm packages installed? Check `C:\DennepPOS\backend\node_modules`
3. Check logs: `C:\DennepPOS\backend\logs\`
4. Run BAT file directly to see errors: `C:\DennepPOS\start-backend.bat`

### Issue: Task Scheduler task shows "Running" but backend not accessible
**Check:**
1. Task Scheduler → Right-click task → History
2. Look for error messages
3. Ensure user has permissions to run the script

### Issue: Port 3002 already in use
**Fix:**
Run this to kill any existing process:
```powershell
Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Quick Reference Commands

### Start Backend (Hidden)
```
wscript C:\DennepPOS\start-backend-hidden.vbs
```

### Stop Backend
```
C:\DennepPOS\stop-backend.bat
```

### Check Backend Status
```
http://localhost:3002/health
```

### View Task Scheduler Tasks
```
Get-ScheduledTask -TaskName "DennepPOS Backend"
```
