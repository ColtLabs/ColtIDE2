# ColtStudio Development Guide

This document describes how to set up the development environment, run the IDE locally, execute automated tests, and verify toolchain integration.

---

## 1. Prerequisites

- **Node.js**: `>= 20.0` (Node 22 or 24 recommended)
- **Rust**: `1.85+` with `cargo`
- **Package Manager**: `npm` or `pnpm`
- **Colt Toolchain**: Built from the `ColtLang` repository (e.g. `../ColtLang/target/release/colt.exe`)

---

## 2. Initial Setup

Clone and install dependencies:

```bash
# In the ColtStudio repository root:
npm install
```

---

## 3. Running Development Mode

### 3.1 Web & UI Development (Vite Fast Mode)
Runs the React frontend in the browser with Vite hot module replacement (HMR). Uses the built-in **Mock Toolchain** or native bridge if running in a browser mock:

```bash
npm run dev
# Open http://localhost:1420
```

### 3.2 Native Desktop Development (Tauri 2 Mode)
Spawns the native Tauri 2 desktop window with the full Rust backend, PTY terminal, and native `colt` compiler process integration:

```bash
npm run tauri dev
```

---

## 4. Running Automated Tests

Run the Vitest test suite:

```bash
# Run all automated tests
npm run test

# Run tests in watch mode
npm run test:watch

# TypeScript typecheck
npm run typecheck
```

### Testing Rust Backend

```bash
cd src-tauri
cargo check
cargo test
```

---

## 5. Connecting to Local ColtLang Builds

1. Build the release binary in `ColtLang`:
   ```powershell
   cd ../ColtLang
   cargo build --release -p colt-cli
   ```
2. ColtStudio will automatically discover `../ColtLang/target/release/colt.exe` via its discovery chain!
3. Alternatively, click the **Settings** icon (gear) in the bottom right corner of ColtStudio and specify the explicit path in the **Colt Executable Path** input.
