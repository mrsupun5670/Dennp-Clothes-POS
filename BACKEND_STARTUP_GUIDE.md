# Backend Silent Startup Guide

## Files Created

### 1. `start-backend-hidden.vbs`
**Purpose:** Starts the backend server without showing a window
**Usage:** Double-click this file OR the Tauri app will run it automatically

### 2. `stop-backend.bat`
**Purpose:** Stops the backend server
**Usage:** Double-click when you need to manually stop the backend

## How It Works

1. **Automatic:** When you launch the Tauri app, it automatically runs `start-backend-hidden.vbs`
2. **Hidden:** No console window appears - the backend runs silently in the background
3. **Clean:** When you close the app, you can run `stop-backend.bat` if needed

## Manual Testing

Test the hidden startup:
```
wscript.exe "C:\Users\LENOVO\Documents\ElectronProjects\Dennp-Clothes-POS\start-backend-hidden.vbs"
```

Stop the backend:
```
C:\Users\LENOVO\Documents\ElectronProjects\Dennp-Clothes-POS\stop-backend.bat
```

## Notes

- The backend runs on port 3002
- No window = no distractions for users
- Backend auto-starts when app launches
