# ColtIDE & ColtLang Integration Specification

This document details the interface contracts between **ColtIDE** and the **Colt Toolchain** (`colt.exe`).

Reference source: `ColtLang/docs/COLTIDE_INTEGRATION.md` (Protocol Version 1).

---

## 1. Toolchain Handshake Contract

Before executing operations, ColtIDE issues:

```bash
colt version --json
```

**Expected Response Schema (`exit 0`):**
```json
{
  "name": "colt",
  "version": "0.2.0",
  "protocolVersion": "1",
  "capabilities": [
    "check",
    "plan",
    "parse",
    "lex",
    "fmt",
    "capabilities"
  ]
}
```

If the handshake succeeds and protocol version matches `1`, ColtIDE activates the **Native Colt Toolchain** adapter. Otherwise, it gracefully engages the **Mock Colt Toolchain** with an explicit `[MOCK TOOLCHAIN]` status badge in the UI.

---

## 2. Syntax & Semantic Check (`colt check`)

Invoked on file save or debounced buffer edits.

```bash
# Standard editor buffer check via stdin
colt check --stdin --json < buffer.colt
```

**Diagnostics Schema:**
```json
{
  "source": "<stdin>",
  "status": "error",
  "diagnostics": [
    {
      "file": "<stdin>",
      "line": 15,
      "column": 6,
      "endLine": 15,
      "endColumn": 11,
      "severity": "error",
      "code": "COLT2002",
      "message": "Unknown collection 'users'. Declare it with DEFINE COLLECTION first.",
      "hint": "Declare it with DEFINE COLLECTION first.",
      "span": {
        "start": { "line": 15, "column": 6, "offset": 240 },
        "end": { "line": 15, "column": 11, "offset": 245 }
      }
    }
  ]
}
```

Diagnostics are mapped directly into:
1. Monaco red squigglies via `toMonacoMarker()`
2. The Problems Panel table with click-to-navigate cursor positioning.

---

## 3. Plan Generation (`colt plan`)

Invoked via the **Plan** action button in the breadcrumb bar.

```bash
colt plan --stdin --json < buffer.colt
```

Produces the compiled multi-engine SQL execution plan displayed in the **Output Panel**.

---

## 4. Canonical Formatting (`colt fmt`)

Invoked on `Shift+Alt+F` or `Ctrl+S`.

```bash
colt fmt --stdin --json < buffer.colt
```

Returns the formatted document text for in-place buffer replacement.

---

## 5. Schema Mapping & Catalog View

ColtIDE extracts catalog metadata (`CONNECT` statements and `DEFINE COLLECTION` blocks) using `colt parse --json`. The schema view displays connections, collections, fields, and constraints in a **strictly read-only** presentation with explicit source attribution.

---

## 6. Language Server Protocol (LSP) Road Map

The `IColtLspAdapter` interface is implemented in `src/toolchain/LspAdapter.ts`. When `colt lsp` is completed in the ColtLang repository, it can be attached directly via Tauri's stdio process bridge without modifying any editor UI components.
