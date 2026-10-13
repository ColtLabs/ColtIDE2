//! Colt Toolchain Integration Layer for ColtIDE
//! Discovers the native Colt compiler executable and coordinates safe invocations
//! according to the authoritative ColtIDE Toolchain & Integration Specification.

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::process::Command;
use tokio::time::timeout;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtToolchainStatus {
    pub available: bool,
    #[serde(rename = "isMock")]
    pub is_mock: bool,
    #[serde(rename = "executablePath")]
    pub executable_path: Option<String>,
    pub version: Option<String>,
    #[serde(rename = "protocolVersion")]
    pub protocol_version: Option<String>,
    pub capabilities: Vec<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtHandshakeJson {
    pub name: String,
    pub version: String,
    #[serde(rename = "protocolVersion")]
    pub protocol_version: String,
    pub capabilities: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtDiagnosticItem {
    pub file: String,
    pub line: u32,
    pub column: u32,
    #[serde(rename = "endLine")]
    pub end_line: u32,
    #[serde(rename = "endColumn")]
    pub end_column: u32,
    pub severity: String,
    pub code: String,
    pub message: String,
    pub hint: Option<String>,
    pub span: ColtSpan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtSpan {
    pub start: ColtPosition,
    pub end: ColtPosition,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtPosition {
    pub line: u32,
    pub column: u32,
    pub offset: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtCheckResult {
    pub source: String,
    pub status: String,
    pub diagnostics: Vec<ColtDiagnosticItem>,
    pub steps: Option<u32>,
    #[serde(rename = "executionTimeMs")]
    pub execution_time_ms: Option<u64>,
    #[serde(rename = "rawOutput")]
    pub raw_output: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtPlanStep {
    pub step: u32,
    pub operation: String,
    pub collection: Option<String>,
    pub connection: Option<String>,
    pub sql: Option<String>,
    pub params: Option<Vec<serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtPlanResult {
    pub source: String,
    pub steps: Vec<ColtPlanStep>,
    pub diagnostics: Vec<ColtDiagnosticItem>,
    #[serde(rename = "rawOutput")]
    pub raw_output: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColtFormatResult {
    pub source: String,
    pub formatted: String,
    pub changed: bool,
    pub error: Option<String>,
}

/// Locates the Colt compiler executable using a prioritized discovery chain:
/// 1. Configured custom path provided by user settings
/// 2. COLT_COMPILER_PATH environment variable
/// 3. Sibling ColtLang repository release / debug binary (development convenience)
/// 4. Current workspace local build (target/release/colt)
/// 5. System PATH lookup
pub fn discover_colt_executable(configured_path: Option<&str>) -> Option<PathBuf> {
    // 1. Explicit user configured path
    if let Some(custom) = configured_path {
        let trimmed = custom.trim();
        if !trimmed.is_empty() {
            let p = PathBuf::from(trimmed);
            if p.exists() && p.is_file() {
                return Some(p);
            }
        }
    }

    // 2. Environment variable
    if let Ok(env_path) = std::env::var("COLT_COMPILER_PATH") {
        let p = PathBuf::from(env_path.trim());
        if p.exists() && p.is_file() {
            return Some(p);
        }
    }

    // 3. Check sibling ColtLang repository
    let binary_name = if cfg!(windows) { "colt.exe" } else { "colt" };
    let sibling_candidates = [
        format!("../ColtLang/target/release/{}", binary_name),
        format!("../ColtLang/target/debug/{}", binary_name),
        format!("../../ColtLang/target/release/{}", binary_name),
        format!("e:/Projects/ColtLang/target/release/{}", binary_name),
        format!("e:/Projects/ColtLang/target/debug/{}", binary_name),
    ];

    for candidate in &sibling_candidates {
        let p = PathBuf::from(candidate);
        if p.exists() && p.is_file() {
            return Some(p);
        }
    }

    // 4. Check workspace target
    let local_target = PathBuf::from(format!("target/release/{}", binary_name));
    if local_target.exists() && local_target.is_file() {
        return Some(local_target);
    }

    // 5. Check system PATH
    if let Ok(found) = which::which(binary_name) {
        return Some(found);
    }

    None
}

/// Invokes `colt version --json` to verify handshake & capabilities
pub async fn get_toolchain_info(configured_path: Option<String>) -> ColtToolchainStatus {
    let exe = match discover_colt_executable(configured_path.as_deref()) {
        Some(path) => path,
        None => {
            return ColtToolchainStatus {
                available: false,
                is_mock: true,
                executable_path: None,
                version: None,
                protocol_version: None,
                capabilities: vec![],
                error: Some("Native Colt executable not found. Mock adapter available for UI development.".into()),
            };
        }
    };

    let exe_str = exe.to_string_lossy().to_string();

    let mut cmd = Command::new(&exe);
    cmd.arg("version").arg("--json");
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    match timeout(Duration::from_secs(5), cmd.output()).await {
        Ok(Ok(output)) => {
            if output.status.success() {
                if let Ok(handshake) = serde_json::from_slice::<ColtHandshakeJson>(&output.stdout) {
                    return ColtToolchainStatus {
                        available: true,
                        is_mock: false,
                        executable_path: Some(exe_str),
                        version: Some(handshake.version),
                        protocol_version: Some(handshake.protocol_version),
                        capabilities: handshake.capabilities,
                        error: None,
                    };
                }
            }
            ColtToolchainStatus {
                available: false,
                is_mock: true,
                executable_path: Some(exe_str),
                version: None,
                protocol_version: None,
                capabilities: vec![],
                error: Some(format!(
                    "Toolchain handshake failed: {}",
                    String::from_utf8_lossy(&output.stderr)
                )),
            }
        }
        _ => ColtToolchainStatus {
            available: false,
            is_mock: true,
            executable_path: Some(exe_str),
            version: None,
            protocol_version: None,
            capabilities: vec![],
            error: Some("Toolchain execution timed out or failed to start.".into()),
        },
    }
}

/// Invokes `colt check` either via stdin or path
pub async fn check_colt(
    path_or_source: String,
    is_buffer: bool,
    configured_path: Option<String>,
) -> ColtCheckResult {
    let start_time = std::time::Instant::now();
    let exe = match discover_colt_executable(configured_path.as_deref()) {
        Some(p) => p,
        None => {
            return ColtCheckResult {
                source: if is_buffer { "<stdin>".into() } else { path_or_source },
                status: "error".into(),
                diagnostics: vec![],
                steps: None,
                execution_time_ms: None,
                rawOutput: Some("Colt compiler not found".into()),
            };
        }
    };

    let mut cmd = Command::new(&exe);
    if is_buffer {
        cmd.arg("check").arg("--stdin").arg("--json");
        cmd.stdin(Stdio::piped());
    } else {
        cmd.arg("check").arg(&path_or_source).arg("--json");
    }
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
            return ColtCheckResult {
                source: if is_buffer { "<stdin>".into() } else { path_or_source },
                status: "error".into(),
                diagnostics: vec![],
                steps: None,
                execution_time_ms: None,
                rawOutput: Some(format!("Failed to spawn colt process: {}", e)),
            };
        }
    };

    if is_buffer {
        if let Some(mut stdin) = child.stdin.take() {
            let _ = stdin.write_all(path_or_source.as_bytes()).await;
        }
    }

    let elapsed = start_time.elapsed().as_millis() as u64;

    match timeout(Duration::from_secs(10), child.wait_with_output()).await {
        Ok(Ok(output)) => {
            let stdout_str = String::from_utf8_lossy(&output.stdout).to_string();

            // Attempt to parse JSON response
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&stdout_str) {
                let diagnostics = if let Some(arr) = val.get("diagnostics").and_then(|d| d.as_array()) {
                    serde_json::from_value::<Vec<ColtDiagnosticItem>>(serde_json::Value::Array(arr.clone()))
                        .unwrap_or_default()
                } else {
                    vec![]
                };

                let steps = val.get("steps").and_then(|s| s.as_u64()).map(|s| s as u32);
                let status = val.get("status").and_then(|s| s.as_str()).unwrap_or(if diagnostics.is_empty() { "ok" } else { "error" });

                ColtCheckResult {
                    source: if is_buffer { "<stdin>".into() } else { path_or_source },
                    status: status.into(),
                    diagnostics,
                    steps,
                    execution_time_ms: Some(elapsed),
                    rawOutput: Some(stdout_str),
                }
            } else {
                ColtCheckResult {
                    source: if is_buffer { "<stdin>".into() } else { path_or_source },
                    status: if output.status.success() { "ok".into() } else { "error".into() },
                    diagnostics: vec![],
                    steps: None,
                    execution_time_ms: Some(elapsed),
                    rawOutput: Some(stdout_str),
                }
            }
        }
        _ => ColtCheckResult {
            source: if is_buffer { "<stdin>".into() } else { path_or_source },
            status: "error".into(),
            diagnostics: vec![],
            steps: None,
            execution_time_ms: Some(elapsed),
            rawOutput: Some("Command timed out".into()),
        },
    }
}

/// Invokes `colt plan` to generate multi-engine execution plan
pub async fn plan_colt(
    path_or_source: String,
    is_buffer: bool,
    configured_path: Option<String>,
) -> ColtPlanResult {
    let exe = match discover_colt_executable(configured_path.as_deref()) {
        Some(p) => p,
        None => {
            return ColtPlanResult {
                source: if is_buffer { "<stdin>".into() } else { path_or_source },
                steps: vec![],
                diagnostics: vec![],
                rawOutput: Some("Colt compiler not found".into()),
            };
        }
    };

    let mut cmd = Command::new(&exe);
    if is_buffer {
        cmd.arg("plan").arg("--stdin").arg("--json");
        cmd.stdin(Stdio::piped());
    } else {
        cmd.arg("plan").arg(&path_or_source).arg("--json");
    }
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
            return ColtPlanResult {
                source: if is_buffer { "<stdin>".into() } else { path_or_source },
                steps: vec![],
                diagnostics: vec![],
                rawOutput: Some(format!("Failed to spawn colt process: {}", e)),
            };
        }
    };

    if is_buffer {
        if let Some(mut stdin) = child.stdin.take() {
            let _ = stdin.write_all(path_or_source.as_bytes()).await;
        }
    }

    match timeout(Duration::from_secs(10), child.wait_with_output()).await {
        Ok(Ok(output)) => {
            let stdout_str = String::from_utf8_lossy(&output.stdout).to_string();
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&stdout_str) {
                let steps = if let Some(plan_obj) = val.get("plan").and_then(|p| p.get("steps")) {
                    serde_json::from_value::<Vec<ColtPlanStep>>(plan_obj.clone()).unwrap_or_default()
                } else if let Some(steps_arr) = val.get("steps") {
                    serde_json::from_value::<Vec<ColtPlanStep>>(steps_arr.clone()).unwrap_or_default()
                } else {
                    vec![]
                };

                let diagnostics = if let Some(arr) = val.get("diagnostics").and_then(|d| d.as_array()) {
                    serde_json::from_value::<Vec<ColtDiagnosticItem>>(serde_json::Value::Array(arr.clone()))
                        .unwrap_or_default()
                } else {
                    vec![]
                };

                ColtPlanResult {
                    source: if is_buffer { "<stdin>".into() } else { path_or_source },
                    steps,
                    diagnostics,
                    rawOutput: Some(stdout_str),
                }
            } else {
                ColtPlanResult {
                    source: if is_buffer { "<stdin>".into() } else { path_or_source },
                    steps: vec![],
                    diagnostics: vec![],
                    rawOutput: Some(stdout_str),
                }
            }
        }
        _ => ColtPlanResult {
            source: if is_buffer { "<stdin>".into() } else { path_or_source },
            steps: vec![],
            diagnostics: vec![],
            rawOutput: Some("Plan compilation timed out".into()),
        },
    }
}

/// Invokes `colt fmt` to format source code
pub async fn format_colt(
    path_or_source: String,
    is_buffer: bool,
    configured_path: Option<String>,
) -> ColtFormatResult {
    let exe = match discover_colt_executable(configured_path.as_deref()) {
        Some(p) => p,
        None => {
            return ColtFormatResult {
                source: if is_buffer { "<stdin>".into() } else { path_or_source },
                formatted: "".into(),
                changed: false,
                error: Some("Colt compiler not found".into()),
            };
        }
    };

    let mut cmd = Command::new(&exe);
    if is_buffer {
        cmd.arg("fmt").arg("--stdin").arg("--json");
        cmd.stdin(Stdio::piped());
    } else {
        cmd.arg("fmt").arg(&path_or_source).arg("--json");
    }
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
            return ColtFormatResult {
                source: if is_buffer { "<stdin>".into() } else { path_or_source },
                formatted: "".into(),
                changed: false,
                error: Some(format!("Failed to spawn colt process: {}", e)),
            };
        }
    };

    if is_buffer {
        if let Some(mut stdin) = child.stdin.take() {
            let _ = stdin.write_all(path_or_source.as_bytes()).await;
        }
    }

    match timeout(Duration::from_secs(5), child.wait_with_output()).await {
        Ok(Ok(output)) => {
            let stdout_str = String::from_utf8_lossy(&output.stdout).to_string();
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&stdout_str) {
                let formatted = val.get("formatted").and_then(|f| f.as_str()).unwrap_or("").to_string();
                let changed = val.get("changed").and_then(|c| c.as_bool()).unwrap_or(false);
                ColtFormatResult {
                    source: if is_buffer { "<stdin>".into() } else { path_or_source },
                    formatted,
                    changed,
                    error: None,
                }
            } else {
                ColtFormatResult {
                    source: if is_buffer { "<stdin>".into() } else { path_or_source },
                    formatted: stdout_str,
                    changed: true,
                    error: None,
                }
            }
        }
        _ => ColtFormatResult {
            source: if is_buffer { "<stdin>".into() } else { path_or_source },
            formatted: "".into(),
            changed: false,
            error: Some("Formatting execution timed out".into()),
        },
    }
}

/// Invokes `colt parse --json` to retrieve the AST for schema catalog extraction
pub async fn parse_colt_ast(
    path_or_source: String,
    is_buffer: bool,
    configured_path: Option<String>,
) -> Result<serde_json::Value, String> {
    let exe = match discover_colt_executable(configured_path.as_deref()) {
        Some(p) => p,
        None => return Err("Colt compiler not found".into()),
    };

    let mut cmd = Command::new(&exe);
    if is_buffer {
        cmd.arg("parse").arg("--stdin").arg("--json");
        cmd.stdin(Stdio::piped());
    } else {
        cmd.arg("parse").arg(&path_or_source).arg("--json");
    }
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn colt: {}", e))?;

    if is_buffer {
        if let Some(mut stdin) = child.stdin.take() {
            let _ = stdin.write_all(path_or_source.as_bytes()).await;
        }
    }

    let output = timeout(Duration::from_secs(5), child.wait_with_output())
        .await
        .map_err(|_| "Parse timed out".to_string())?
        .map_err(|e| format!("Failed to wait for output: {}", e))?;

    let stdout_str = String::from_utf8_lossy(&output.stdout).to_string();
    serde_json::from_str::<serde_json::Value>(&stdout_str).map_err(|e| format!("Failed to parse AST JSON: {}", e))
}
