# ColtStudio Packaging & Distribution Guide

This document describes how to package **ColtStudio** for production distribution on Windows, macOS, and Linux using Tauri 2.

---

## 1. Prerequisites for Packaging

- All workspace tests must pass: `npm run test`
- Build frontend production bundle: `npm run build`
- Platform native build tools:
  - **Windows**: Microsoft C++ Build Tools & WiX Toolset v3 (for `.msi` and `.exe`)
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`

---

## 2. Bundling the Colt Toolchain Executable

When distributing ColtStudio as a self-contained IDE, the precompiled native `colt` executable can be packaged as an external binary resource in Tauri:

1. Copy the target platform's `colt.exe` (or `colt`) to `src-tauri/binaries/colt-$TARGET_TRIPLE.exe`.
2. Reference the external binary in `src-tauri/tauri.conf.json`:
   ```json
   {
     "bundle": {
       "externalBin": [
         "binaries/colt"
       ]
     }
   }
   ```
3. At runtime, ColtStudio checks:
   - User configured path (`colt.compilerPath`)
   - Bundled application resource directory (`resources/binaries/colt.exe`)
   - System `PATH`

---

## 3. Production Build Commands

```bash
# Build the production desktop installer
npm run tauri build
```

### Windows Build Artifacts:
- `src-tauri/target/release/bundle/msi/ColtStudio_0.1.0_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/ColtStudio_0.1.0_x64-setup.exe`

### macOS Build Artifacts:
- `src-tauri/target/release/bundle/dmg/ColtStudio_0.1.0_x64.dmg`
- `src-tauri/target/release/bundle/macos/ColtStudio.app`

### Linux Build Artifacts:
- `src-tauri/target/release/bundle/deb/coltstudio_0.1.0_amd64.deb`
- `src-tauri/target/release/bundle/appimage/coltstudio_0.1.0_amd64.AppImage`

---

## 4. Release Checklist

1. [ ] Increment version in `package.json` and `src-tauri/tauri.conf.json`
2. [ ] Run automated tests: `npm run test`
3. [ ] Run typecheck: `npm run typecheck`
4. [ ] Build desktop bundle: `npm run tauri build`
5. [ ] Verify `.colt` file associations open ColtStudio
6. [ ] Verify handshake with bundled or system `colt` toolchain
