//! ColtIDE Native Desktop IDE Core Library

pub mod colt_toolchain;
pub mod fs_commands;
pub mod terminal_pty;

use colt_toolchain::{
    check_colt, format_colt, get_toolchain_info, parse_colt_ast, plan_colt, ColtCheckResult,
    ColtFormatResult, ColtPlanResult, ColtToolchainStatus,
};
use fs_commands::FileTreeEntry;
use std::path::Path;

#[tauri::command(rename_all = "camelCase")]
pub async fn colt_get_toolchain_info(configured_path: Option<String>) -> ColtToolchainStatus {
    get_toolchain_info(configured_path).await
}

#[tauri::command(rename_all = "camelCase")]
pub async fn colt_check(
    path_or_source: String,
    is_buffer: bool,
    configured_path: Option<String>,
) -> ColtCheckResult {
    check_colt(path_or_source, is_buffer, configured_path).await
}

#[tauri::command(rename_all = "camelCase")]
pub async fn colt_plan(
    path_or_source: String,
    is_buffer: bool,
    configured_path: Option<String>,
) -> ColtPlanResult {
    plan_colt(path_or_source, is_buffer, configured_path).await
}

#[tauri::command(rename_all = "camelCase")]
pub async fn colt_format(
    path_or_source: String,
    is_buffer: bool,
    configured_path: Option<String>,
) -> ColtFormatResult {
    format_colt(path_or_source, is_buffer, configured_path).await
}

#[tauri::command(rename_all = "camelCase")]
pub async fn colt_parse_ast(
    path_or_source: String,
    is_buffer: bool,
    configured_path: Option<String>,
) -> Result<serde_json::Value, String> {
    parse_colt_ast(path_or_source, is_buffer, configured_path).await
}

#[tauri::command(rename_all = "camelCase")]
pub async fn fs_read_dir_tree(path: String, depth: u32) -> Result<Vec<FileTreeEntry>, String> {
    fs_commands::read_dir_tree(Path::new(&path), depth)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command(rename_all = "camelCase")]
pub async fn fs_read_file(path: String) -> Result<String, String> {
    fs_commands::read_file(Path::new(&path))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command(rename_all = "camelCase")]
pub async fn fs_write_file(path: String, content: String) -> Result<(), String> {
    fs_commands::write_file(Path::new(&path), &content)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command(rename_all = "camelCase")]
pub async fn fs_create_file(path: String) -> Result<(), String> {
    fs_commands::create_file(Path::new(&path))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command(rename_all = "camelCase")]
pub async fn fs_delete_file(path: String) -> Result<(), String> {
    fs_commands::delete_file(Path::new(&path))
        .await
        .map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            colt_get_toolchain_info,
            colt_check,
            colt_plan,
            colt_format,
            colt_parse_ast,
            fs_read_dir_tree,
            fs_read_file,
            fs_write_file,
            fs_create_file,
            fs_delete_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ColtIDE application");
}
