//! Terminal PTY implementation for ColtStudio
//! Cross-platform pseudo-terminal management using `portable-pty`.

use portable_pty::{native_pty_system, Child, CommandBuilder, MasterPty, PtySize};
use serde::Serialize;
use std::collections::HashMap;
use std::io::Write;
use std::sync::{Arc, Mutex, RwLock};

#[derive(Serialize)]
pub struct SpawnResult {
    pub id: String,
    pub shell: String,
}

pub struct TerminalInstance {
    pub master: Box<dyn MasterPty + Send>,
    pub writer: Arc<Mutex<Box<dyn Write + Send>>>,
    pub child: Arc<Mutex<Box<dyn Child + Send + Sync>>>,
}

pub struct TerminalState {
    pub terminals: Arc<RwLock<HashMap<String, TerminalInstance>>>,
}

impl TerminalState {
    pub fn new() -> Self {
        Self {
            terminals: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl Default for TerminalState {
    fn default() -> Self {
        Self::new()
    }
}

pub fn spawn_terminal(
    id: &str,
    cols: u16,
    rows: u16,
    cwd: Option<&str>,
) -> Result<SpawnResult, String> {
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| e.to_string())?;

    let default_shell = if cfg!(windows) {
        "powershell.exe"
    } else {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string()).leak()
    };

    let mut cmd = CommandBuilder::new(default_shell);
    if let Some(dir) = cwd {
        cmd.cwd(dir);
    }

    let child = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;
    drop(pair.slave);

    Ok(SpawnResult {
        id: id.to_string(),
        shell: default_shell.to_string(),
    })
}
