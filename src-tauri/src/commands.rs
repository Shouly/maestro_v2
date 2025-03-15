// 这个模块包含所有Tauri命令

use crate::tools::{ComputerTool, ComputerAction, ScrollDirection, ToolResult, BashTool, EditTool};
use crate::tools::edit::EditCommand;
use serde::Deserialize;
use tauri::command;

#[derive(Debug, Deserialize)]
pub struct ComputerCommandArgs {
    action: ComputerAction,
    text: Option<String>,
    coordinate: Option<(i32, i32)>,
    scroll_direction: Option<ScrollDirection>,
    scroll_amount: Option<u32>,
    duration: Option<f32>,
    key: Option<String>,
}

/// 执行计算机控制命令
#[command]
pub async fn execute_computer_command(args: ComputerCommandArgs) -> Result<ToolResult, String> {
    let computer_tool = ComputerTool::new().map_err(|e| e.to_string())?;
    
    computer_tool.execute(
        args.action,
        args.text,
        args.coordinate,
        args.scroll_direction,
        args.scroll_amount,
        args.duration,
        args.key,
    )
    .await
    .map_err(|e| e.to_string())
}

/// 获取计算机工具配置
#[command]
pub fn get_computer_options() -> Result<serde_json::Value, String> {
    let computer_tool = ComputerTool::new().map_err(|e| e.to_string())?;
    Ok(computer_tool.options())
}

/// 截取屏幕截图
#[command]
pub async fn take_screenshot() -> Result<ToolResult, String> {
    let computer_tool = ComputerTool::new().map_err(|e| e.to_string())?;
    computer_tool.execute(
        ComputerAction::Screenshot,
        None,
        None,
        None,
        None,
        None,
        None,
    )
    .await
    .map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct BashCommandArgs {
    command: Option<String>,
    restart: Option<bool>,
}

/// 执行Bash命令
#[command]
pub async fn execute_bash_command(args: BashCommandArgs) -> Result<ToolResult, String> {
    let bash_tool = BashTool::new();
    
    bash_tool.execute(
        args.command,
        args.restart.unwrap_or(false),
    )
    .await
    .map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct EditCommandArgs {
    command: EditCommand,
    path: String,
    file_text: Option<String>,
    view_range: Option<Vec<i32>>,
    old_str: Option<String>,
    new_str: Option<String>,
    insert_line: Option<i32>,
}

/// 执行文本编辑命令
#[command]
pub async fn execute_edit_command(args: EditCommandArgs) -> Result<ToolResult, String> {
    let edit_tool = EditTool::new();
    
    edit_tool.execute(
        args.command,
        args.path,
        args.file_text,
        args.view_range,
        args.old_str,
        args.new_str,
        args.insert_line,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("你好，{}！欢迎使用 Maestro！", name)
} 