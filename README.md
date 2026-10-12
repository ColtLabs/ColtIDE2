# ColtStudio

**ColtStudio** is the official native desktop Integrated Development Environment (IDE) for the **Colt** programming language.

Built with **Tauri 2**, **React 19**, **TypeScript**, **Vite**, and **Monaco Editor**, ColtStudio delivers a fast, low-latency development experience with zero telemetry, no AI bloat, and pure native system performance.

---

## Key Principles & Architectural Boundary

1. **ColtLang is Authoritative**:  
   The IDE **does not** duplicate parsing, AST representation, semantic analysis, type checking, or multi-engine planning. All semantic analysis and compilation are delegated to the native `colt` executable or future `colt lsp` daemon.

2. **Decoupled Syntax Highlighting**:  
   Monaco Editor syntax highlighting is implemented purely lexically via a custom Monaco Monarch tokenizer. Red squigglies, diagnostics, and problem markers arrive asynchronously from `colt check`.

3. **Isolated Integration Layer**:  
   The IDE communicates with the compiler through an explicit, versioned adapter interface (`IColtToolchainAdapter`). When the native compiler is absent, a clearly identified Mock adapter (`[MOCK TOOLCHAIN]`) enables UI layout and component testing without claiming simulated data is genuine.

4. **Configurable Discovery**:  
   The compiler binary path is fully configurable (`colt.compilerPath`) with multi-stage fallback (custom path -> workspace `.colt/toolchain` -> sibling repo `../ColtLang/target/release/colt.exe` -> system `PATH`). No machine-specific absolute paths are hardcoded.

5. **Read-Only Schema Mapper**:  
   Visualizes database connections, collections, fields, and constraints extracted directly from the Colt compiler catalog. Mutations are strictly prohibited in the mapper view until transactional schema contracts are published.

---

## Features

- **Monaco Code Editor**: Full `.colt` syntax highlighting, bracket matching, comment toggling, and auto-closing pairs.
- **Workspace Explorer**: Directory navigation, file creation, and project file tree browsing.
- **Editor Tabs & Breadcrumbs**: Multi-file editing with dirty state indicators (`●`) and quick actions (`Check`, `Plan`, `Format`, `Schema`).
- **Problems Panel**: Real-time diagnostic viewer supporting codes `COLT1001` through `COLT2027` with click-to-navigate cursor positioning.
- **Output Stream**: Real-time log capture and structured viewer for multi-engine SQL execution plans compiled by Colt.
- **Integrated Terminal**: Cross-platform pseudo-terminal powered by `portable-pty` and `xterm.js`.
- **Read-Only Schema Mapper**: Interactive catalog inspector displaying collections, fields, `@key`, `@unique`, and `@index` constraints.
- **Toolchain Status & Settings**: Real-time handshake monitoring and compiler path configuration.

---

## Documentation

- [Development Guide](./DEVELOPMENT.md) — Setup, local workflows, running tests, and debugging.
- [Integration Specification](./INTEGRATION.md) — Toolchain contracts, CLI commands, and LSP architecture.
- [Packaging Guide](./PACKAGING.md) — Native builds and bundle distribution for Windows, macOS, and Linux.

---

## License

MIT License. Copyright (c) 2026 ColtStudio Team.
