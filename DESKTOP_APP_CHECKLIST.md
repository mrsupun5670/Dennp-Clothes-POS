# Desktop App Setup Checklist

## ✅ Prerequisites Installation

### Windows
- [ ] **Node.js installed**
  - Download from: https://nodejs.org/ (LTS)
  - Verify: Open PowerShell, type: `node --version`
  - Should show v18.x or higher

- [ ] **Rust installed**
  - Download from: https://rustup.rs/
  - Run: rustup-init.exe
  - Follow default prompts
  - Restart PowerShell
  - Verify: Type `rustc --version` and `cargo --version`

### macOS
- [ ] **Node.js installed**
  - Via Homebrew: `brew install node`
  - Or download from: https://nodejs.org/
  - Verify: `node --version`

- [ ] **Rust installed**
  - Open Terminal
  - Paste: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Press Enter, follow prompts
  - Run: `source $HOME/.cargo/env`
  - Verify: `rustc --version` and `cargo --version`

---

## 📦 Project Setup

- [ ] **Navigate to project**
  ```bash
  cd "C:\Users\LENOVO\Documents\ElectronProjects\Dennp-Clothes-POS\frontend"
  ```

- [ ] **Install npm packages**
  ```bash
  npm install
  ```
  (Wait for completion - takes 2-3 minutes)

- [ ] **Verify installation**
  ```bash
  npm run type-check
  ```
  Should show no errors

---

## 🚀 Running the Desktop App

- [ ] **Start development server**
  ```bash
  npm run tauri-dev
  ```

- [ ] **Verify app window opens**
  - Native desktop window should appear
  - Shows Tauri + React default app
  - Not in browser tab

- [ ] **Test hot reload**
  - Edit src/App.tsx
  - Change text, save file
  - Window should update instantly

- [ ] **Stop the app**
  - Close the window, OR
  - Press Ctrl+C in terminal

---

## 💻 Development Environment

- [ ] **Understand file structure**
  - src/App.tsx ← Main app file
  - src/components/ ← Your components
  - src/pages/ ← Your pages
  - src-tauri/ ← Backend (Rust)

- [ ] **Know the workflow**
  1. Edit React files (instant update)
  2. Edit Rust files (restart app)
  3. Test changes in app window
  4. Build when ready

- [ ] **Have developer tools ready**
  - Press Ctrl+Shift+I to open DevTools
  - Console shows errors
  - Network tab shows API calls

---

## 🎨 Building Features

- [ ] **Created first page** (SalesPage.tsx, etc.)
- [ ] **Created first component** (Button, Card, etc.)
- [ ] **Added routing** (if using React Router)
- [ ] **Styled with Tailwind** or CSS
- [ ] **Connected to backend** (if needed)

---

## 📦 Building for Distribution

### Windows Release
- [ ] **Build Windows installer**
  ```bash
  npm run tauri-build-windows
  ```

- [ ] **Find installer file**
  - Location: `frontend/src-tauri/target/release/bundle/msi/`
  - File: `Dennep-Clothes-POS_x.x.x_x64_en-US.msi`

- [ ] **Test installer**
  - Double-click .msi file
  - App installs
  - App launches from Start Menu
  - App works properly

- [ ] **Version updated** in tauri.conf.json

### macOS Release
- [ ] **Build macOS app**
  ```bash
  npm run tauri-build-macos
  ```

- [ ] **Find DMG file**
  - Location: `frontend/src-tauri/target/release/bundle/dmg/`
  - File: `Dennep-Clothes-POS_x.x.x_x64.dmg`

- [ ] **Test on macOS** (if available)
  - Users can drag to Applications
  - App launches properly
  - All features work

---

## 🔧 Configuration

- [ ] **App name set** in tauri.conf.json
  ```json
  "productName": "Dennep Clothes POS"
  ```

- [ ] **App version set**
  ```json
  "version": "1.0.0"
  ```

- [ ] **Window size configured**
  ```json
  "width": 1200,
  "height": 800
  ```

- [ ] **App icon added** (optional)
  - Place in: `src-tauri/icons/`

---

## 📊 Testing Checklist

- [ ] **App launches** without errors
- [ ] **UI displays** correctly
- [ ] **Buttons work** and respond
- [ ] **Forms work** (input, submit)
- [ ] **Navigation works** (if using routing)
- [ ] **Database connects** (if applicable)
- [ ] **No console errors** (F12 to check)
- [ ] **Works offline** (if applicable)
- [ ] **Fast performance** (not slow/laggy)
- [ ] **Professional appearance**

---

## 🚀 Deployment Checklist

Before releasing to users:

- [ ] **Version number bumped**
- [ ] **All features tested**
- [ ] **No console errors**
- [ ] **Error handling works**
- [ ] **Database backups configured** (if applicable)
- [ ] **Documentation updated**
- [ ] **Release notes written**
- [ ] **Installer tested** on target OS
- [ ] **App icon professional** (if added)
- [ ] **License included** (if applicable)

---

## 📋 Important Files

### Configuration Files
- `frontend/package.json` - Dependencies & scripts
- `frontend/vite.config.ts` - Build configuration
- `frontend/tsconfig.json` - TypeScript config
- `frontend/tailwind.config.js` - Tailwind config
- `frontend/src-tauri/tauri.conf.json` - **Tauri config** (IMPORTANT)

### Source Code
- `frontend/src/App.tsx` - Main app file
- `frontend/src/main.tsx` - Entry point
- `frontend/src-tauri/src/main.rs` - Rust backend

### Build Output
- `frontend/src-tauri/target/release/bundle/msi/` - Windows installers
- `frontend/src-tauri/target/release/bundle/dmg/` - macOS installers

---

## 🆘 Troubleshooting

### App won't start
- [ ] Check terminal for error messages
- [ ] Verify Node.js installed: `node --version`
- [ ] Verify Rust installed: `rustc --version`
- [ ] Try: `npm install` again
- [ ] Delete node_modules and reinstall
- [ ] Restart computer

### Rust not found
- [ ] Install from: https://rustup.rs/
- [ ] Restart terminal/PowerShell
- [ ] Verify: `rustc --version`

### Port 5173 already in use
- [ ] Close other apps using that port
- [ ] Or let Vite try next port (5174, 5175)
- [ ] Restart computer

### Code changes not showing
- [ ] React: Should auto-reload (wait 2-3 seconds)
- [ ] Rust: Need to restart `npm run tauri-dev`
- [ ] CSS: Should auto-reload
- [ ] Try: Ctrl+R to refresh window

---

## 📞 Getting Help

### Check Documentation
- `HOW_TO_RUN.md` - Detailed setup guide
- `RUN_DESKTOP_APP.md` - Quick start guide
- Tauri Docs: https://tauri.app
- React Docs: https://react.dev

### Check Terminal Errors
- Error messages show in terminal
- Press Ctrl+Shift+I in app for DevTools
- Check Console tab for JavaScript errors

### Common Resources
- Tauri GitHub: https://github.com/tauri-apps/tauri
- React Documentation: https://react.dev
- Stack Overflow: Search for your error

---

## ✨ Final Steps

- [ ] **Read HOW_TO_RUN.md** for detailed instructions
- [ ] **Read RUN_DESKTOP_APP.md** for quick start
- [ ] **Verify Node.js installation**
- [ ] **Verify Rust installation**
- [ ] **Run `npm install` in frontend folder**
- [ ] **Run `npm run tauri-dev` to start**
- [ ] **See desktop app window open**
- [ ] **Start building features!**

---

## ✅ You're Ready!

When all checkboxes are done:

```bash
cd frontend
npm run tauri-dev
```

Your Dennep Clothes POS desktop application will launch! 🚀

---

**Remember:** This is a DESKTOP app, not a web app. It opens as a native window on Windows or macOS.
