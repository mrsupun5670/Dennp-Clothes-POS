# Quick Start: Run Dennep Clothes POS Desktop App

**This is a DESKTOP APPLICATION for Windows & macOS, NOT a web browser app.**

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Prerequisites (First Time Only)

#### Windows:
1. Download & install Node.js: https://nodejs.org (LTS version)
2. Download & run: https://rustup.rs/rustup-init.exe
3. Press Enter when installer asks
4. Close and reopen PowerShell

#### macOS:
```bash
# Install Node.js (or use Homebrew)
brew install node

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Step 2: Install Project Dependencies

Open Terminal/PowerShell and run:

```bash
cd "C:\Users\LENOVO\Documents\ElectronProjects\Dennp-Clothes-POS\frontend"
npm install
```

(This takes 2-3 minutes the first time)

### Step 3: Run the Desktop App

```bash
npm run tauri-dev
```

**What happens:**
- A native desktop window opens
- Shows your POS app
- Changes update instantly (hot reload)
- Press Ctrl+Shift+I for developer tools
- Close window to stop

**That's it! The app is running. 🎉**

---

## 📦 Create Installer (For Distribution)

When ready to share with others:

### Windows: Create .MSI Installer

```bash
npm run tauri-build-windows
```

**File created:** `frontend/src-tauri/target/release/bundle/msi/`
- Share this `.msi` file
- Users double-click to install
- App appears in Windows Start Menu

### macOS: Create .DMG Bundle

```bash
npm run tauri-build-macos
```

**File created:** `frontend/src-tauri/target/release/bundle/dmg/`
- Share this `.dmg` file
- Users drag app to Applications folder
- Opens from Applications

---

## 🔄 Daily Development Workflow

Every day you work on the app:

```bash
# 1. Open Terminal/PowerShell
# 2. Navigate to project
cd "C:\Users\LENOVO\Documents\ElectronProjects\Dennp-Clothes-POS\frontend"

# 3. Run the app
npm run tauri-dev

# 4. App window opens - start developing
# 5. Edit React files (src/App.tsx, etc.)
# 6. Changes appear instantly
# 7. When done, close the app window
```

---

## 🎯 Where to Add Your Code

```
frontend/src/
├── App.tsx                    ← Edit here (main UI)
├── App.css                    ← Edit here (styling)
├── components/                ← Create new components here
│   ├── common/               ← Shared components
│   ├── pos/                  ← POS-specific components
│   └── ui/                   ← UI components
├── pages/                     ← Create pages here
│   ├── SalesPage.tsx
│   ├── ProductsPage.tsx
│   └── ...
└── utils/                     ← Helper functions
```

---

## 📱 How It Works

### Desktop App (Tauri)
```
┌──────────────────────────────┐
│  Your Desktop App Window     │
│  (Native Windows/Mac window) │
│  ┌────────────────────────┐  │
│  │   React Frontend       │  │
│  │   (Your UI code)       │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
         ↕ (Communication)
┌──────────────────────────────┐
│  Rust Backend (Tauri)        │
│  - Database access           │
│  - File system access        │
│  - OS integration            │
└──────────────────────────────┘
```

### NOT a Web App
- ❌ Don't open a browser
- ❌ Don't type localhost in address bar
- ❌ Don't need internet to run
- ✅ Standalone desktop application

---

## 🛠️ Useful Commands

```bash
# Run desktop app (development)
npm run tauri-dev

# Build for Windows distribution
npm run tauri-build-windows

# Build for macOS distribution
npm run tauri-build-macos

# Check for TypeScript errors
npm run type-check

# Format code
npm run format

# Lint code
npm run lint
```

---

## ⚠️ Common Issues

### "Rust not found" error
**Solution:** Install Rust from https://rustup.rs/, then restart terminal

### "npm not found" error
**Solution:** Install Node.js from https://nodejs.org/

### Port 5173 already in use
**Solution:** Vite auto-switches to 5174/5175, or restart computer

### App window doesn't appear
**Solution:** Check terminal for errors, they show there

### Code changes not showing
**For React changes:** Should auto-refresh
**For Rust changes:** Restart `npm run tauri-dev`

---

## 📊 Project Status

✅ React + TypeScript ready
✅ Tauri configured
✅ Rust backend set up
✅ Tailwind CSS available
✅ Ready to build features

---

## 🎓 Learning Resources

- **React:** https://react.dev
- **Tauri:** https://tauri.app
- **TypeScript:** https://www.typescriptlang.org/
- **Tailwind CSS:** https://tailwindcss.com

---

## Next Steps

1. **Run the app:** `npm run tauri-dev`
2. **Edit App.tsx** and see changes instantly
3. **Create pages** in src/pages/
4. **Build features** in src/components/
5. **When ready:** `npm run tauri-build-windows` to create installer

---

## Key Point 🔑

**This is a native desktop application.**

- Opens as a window (not in browser)
- Runs on Windows & macOS
- Distributes as .MSI (Windows) or .DMG (macOS)
- Works offline
- Has full system access
- Looks like any other desktop app

**It's NOT a web application.**

---

**You're all set! Run `npm run tauri-dev` to start developing.** 🚀
