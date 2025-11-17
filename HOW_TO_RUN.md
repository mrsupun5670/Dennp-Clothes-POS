# How to Run Dennep Clothes POS Desktop Application

This is a **DESKTOP APPLICATION**, not a web app. It runs natively on Windows and macOS using Tauri.

---

## Prerequisites (One-Time Setup)

### 1. Install Node.js
- Download from: https://nodejs.org/
- Get the **LTS (Long Term Support)** version
- Install with default options
- Verify: Open terminal/PowerShell and run:
  ```bash
  node --version
  npm --version
  ```

### 2. Install Rust (REQUIRED for Desktop App)
This is essential for building the desktop application.

**Windows:**
1. Go to: https://rustup.rs/
2. Download and run `rustup-init.exe`
3. Press Enter for default installation
4. Close and reopen terminal/PowerShell
5. Verify: Run:
   ```bash
   rustc --version
   cargo --version
   ```

**macOS:**
1. Open Terminal
2. Copy and paste:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
3. Press Enter and follow prompts
4. Run: `source $HOME/.cargo/env`
5. Verify:
   ```bash
   rustc --version
   cargo --version
   ```

### 3. Install Dependencies
Navigate to the project folder:

```bash
cd "C:\Users\LENOVO\Documents\ElectronProjects\Dennp-Clothes-POS\frontend"
npm install
```

This installs all required packages.

---

## Running the Desktop App

### Development Mode (Windows & macOS)

Development mode shows your app with hot reload (changes appear instantly).

```bash
cd frontend
npm run tauri-dev
```

**What happens:**
1. Vite dev server starts (http://localhost:5173)
2. Rust backend compiles
3. Desktop window opens automatically
4. You see the app running as a native window
5. Press Ctrl+Shift+I for developer tools

**Stop the app:**
- Close the window, OR
- Press Ctrl+C in the terminal

---

## Building for Distribution

When you're ready to release your app to users.

### Windows: Create .MSI Installer

```bash
cd frontend
npm run tauri-build-windows
```

**Output location:**
```
frontend/src-tauri/target/release/bundle/msi/Dennep-Clothes-POS_x.x.x_x64_en-US.msi
```

Users can install with one click.

### macOS: Create .DMG Bundle

```bash
cd frontend
npm run tauri-build-macos
```

**Output location:**
```
frontend/src-tauri/target/release/bundle/dmg/Dennep-Clothes-POS_x.x.x_x64.dmg
```

Users drag the app to Applications folder.

### Build for Both (if on multi-OS machine)

```bash
cd frontend
npm run tauri-build
```

Creates installers for your current OS.

---

## Understanding the Architecture

### What Makes This a Desktop App

**NOT a Web App:**
- ❌ You don't open a browser
- ❌ You don't go to localhost:5173
- ❌ It doesn't require internet (works offline)
- ❌ It's not stored in a browser tab

**IS a Desktop App:**
- ✅ Native window that looks like Windows/Mac apps
- ✅ Runs independently on the computer
- ✅ Has system integration (menus, file access, etc.)
- ✅ Distributed as .exe (Windows) or .dmg (macOS)
- ✅ Real database and file system access

### How It Works

```
┌─────────────────────────────────────────┐
│  Desktop App Window                     │
│  ┌───────────────────────────────────┐  │
│  │  React Frontend (UI)              │  │
│  │  (Your interface, buttons, forms) │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↑         ↓
    Tauri Bridge (Communication)
              ↑         ↓
┌─────────────────────────────────────────┐
│  Rust Backend (Logic)                   │
│  - Database operations                  │
│  - File system access                   │
│  - Business logic                       │
└─────────────────────────────────────────┘
```

---

## File Structure for Distribution

When you build the app:

```
frontend/src-tauri/target/release/bundle/
├── msi/              (Windows installer)
│   └── Dennep-Clothes-POS_x.x.x_x64_en-US.msi
├── dmg/              (macOS installer)
│   └── Dennep-Clothes-POS_x.x.x_x64.dmg
└── nsis/             (Windows NSIS installer files)
```

---

## Common Issues & Solutions

### Issue: "Rust not found"
**Solution:**
- Install Rust from https://rustup.rs/
- Restart your terminal/PowerShell
- Verify: `rustc --version`

### Issue: "cargo not found"
**Solution:**
- Same as above - install Rust
- Make sure you completed the installation
- Restart terminal

### Issue: Port 5173 already in use
**Solution:**
- Vite automatically tries port 5174, 5175, etc.
- Or close the app using that port
- Or restart your computer

### Issue: App won't start
**Solution:**
- Open Terminal/PowerShell
- Go to: `cd frontend`
- Run: `npm run tauri-dev`
- Check error messages in terminal
- Look at console output for specific errors

### Issue: Window doesn't open
**Solution:**
- Check the terminal for error messages
- Open DevTools: Ctrl+Shift+I in the app window
- Check the Console tab for errors

---

## Development Workflow

### Step 1: Development
```bash
cd frontend
npm run tauri-dev
```
- See your app running in a window
- Edit code → changes appear instantly
- Test features locally

### Step 2: Testing
- Use the app like a user would
- Test on Windows and macOS if possible
- Check file system operations
- Test database connections

### Step 3: Building for Release
```bash
cd frontend
npm run tauri-build-windows   # Windows
npm run tauri-build-macos     # macOS
```

### Step 4: Distribution
- Share the .MSI file (Windows users)
- Share the .DMG file (macOS users)
- Users install like any other app

---

## Package.json Scripts

The app has these build commands:

```json
{
  "scripts": {
    "dev": "vite",                              // Web dev only
    "tauri-dev": "tauri dev",                   // Desktop app dev
    "build": "vite build",                      // Web build
    "tauri-build": "tauri build",              // Build for current OS
    "tauri-build-windows": "tauri build --target x86_64-pc-windows-msvc",
    "tauri-build-macos": "tauri build --target universal-apple-darwin",
    "type-check": "tsc --noEmit",              // Check TypeScript
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives",
    "format": "prettier --write ."
  }
}
```

---

## Key Differences: Desktop vs Web

| Feature | Desktop App | Web App |
|---------|------------|---------|
| **Runs As** | Native window | Browser tab |
| **Launch** | Click app icon | Type URL |
| **Storage** | Local file system | Browser localStorage |
| **Database** | Direct connection | Through server |
| **Offline** | Works fully | Mostly broken |
| **Installation** | .MSI or .DMG | None (just URL) |
| **Distribution** | Download installer | Send URL |
| **Performance** | Very fast | Depends on internet |
| **File Access** | Full system access | Sandboxed |

---

## Configuration

### App Name & Info
Edit: `frontend/src-tauri/tauri.conf.json`

```json
{
  "package": {
    "productName": "Dennep Clothes POS",
    "version": "1.0.0"
  }
}
```

### Window Settings
```json
{
  "tauri": {
    "windows": [
      {
        "title": "Dennep Clothes POS",
        "width": 1200,
        "height": 800,
        "fullscreen": false
      }
    ]
  }
}
```

---

## Security Notes

Since this is a desktop app with direct system access:

- **Database passwords**: Store securely (not in code)
- **API keys**: Use environment variables
- **File access**: Request user permission
- **Updates**: Use Tauri's built-in updater

---

## Updating the App

Users have installed your app. When you update:

1. Change version in `tauri.conf.json`
2. Run `npm run tauri-build-windows` (or macOS)
3. Send new installer to users
4. Users download and install new version

Or use Tauri's auto-updater feature (advanced).

---

## Production Checklist

Before releasing:

- [ ] Test on Windows
- [ ] Test on macOS (if targeting both)
- [ ] Test all features work offline
- [ ] Database connections tested
- [ ] File operations tested
- [ ] Error handling works
- [ ] Version number updated
- [ ] Icon/branding added
- [ ] Installer name set correctly
- [ ] Documentation updated

---

## Getting Help

### Check Logs
```bash
# Windows
set RUST_LOG=debug && npm run tauri-dev

# macOS/Linux
RUST_LOG=debug npm run tauri-dev
```

### Tauri Documentation
- https://tauri.app/v1/guides/
- https://tauri.app/v1/api/

### React Documentation
- https://react.dev/

---

## Summary

**To Run as Desktop App:**

1. **First Time:**
   ```bash
   # Install Node.js
   # Install Rust from https://rustup.rs/
   cd frontend
   npm install
   ```

2. **Development:**
   ```bash
   npm run tauri-dev
   # App opens in a window (not browser)
   ```

3. **For Users (Distribution):**
   ```bash
   npm run tauri-build-windows    # Create .MSI
   npm run tauri-build-macos      # Create .DMG
   # Share installer file with users
   ```

That's it! Your app is a real desktop application now. 🚀

---

**Remember:** This is NOT a web application. It's a native desktop app that runs on Windows and macOS independently.
