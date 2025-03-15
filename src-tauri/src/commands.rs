// 这个模块包含所有Tauri命令

use crate::tools::edit::EditCommand;
use crate::tools::{BashTool, ComputerAction, ComputerTool, EditTool, ScrollDirection, ToolResult};
use log::{error, info};
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
    info!("接收到计算机控制命令: {:?}", args);

    let computer_tool = match ComputerTool::new() {
        Ok(tool) => tool,
        Err(e) => {
            let err_msg = format!("创建计算机控制工具失败: {}", e);
            error!("{}", err_msg);
            return Err(err_msg);
        }
    };

    match computer_tool
        .execute(
            args.action,
            args.text,
            args.coordinate,
            args.scroll_direction,
            args.scroll_amount,
            args.duration,
            args.key,
        )
        .await
    {
        Ok(result) => {
            info!("计算机控制命令执行成功");
            Ok(result)
        }
        Err(e) => {
            let err_msg = e.to_string();
            error!("计算机控制命令执行失败: {}", err_msg);
            Err(err_msg)
        }
    }
}

/// 获取计算机工具配置
#[command]
pub fn get_computer_options(
    width: Option<u32>,
    height: Option<u32>,
) -> Result<serde_json::Value, String> {
    info!("获取计算机工具配置，宽度={:?}，高度={:?}", width, height);

    let computer_tool = match ComputerTool::new() {
        Ok(tool) => tool,
        Err(e) => {
            let err_msg = format!("创建计算机控制工具失败: {}", e);
            error!("{}", err_msg);
            return Err(err_msg);
        }
    };

    let mut options = computer_tool.options();

    if let (Some(w), Some(h)) = (width, height) {
        options["display_width_px"] = serde_json::json!(w);
        options["display_height_px"] = serde_json::json!(h);
    }

    info!("获取计算机工具配置成功");
    Ok(options)
}

/// 截取屏幕截图
#[command]
pub async fn take_screenshot(
    width: Option<u32>,
    height: Option<u32>,
) -> Result<ToolResult, String> {
    info!("接收到截图请求，宽度={:?}，高度={:?}", width, height);

    let computer_tool = match ComputerTool::new() {
        Ok(tool) => tool,
        Err(e) => {
            let err_msg = format!("创建计算机控制工具失败: {}", e);
            error!("{}", err_msg);
            return Err(err_msg);
        }
    };

    match computer_tool
        .execute(
            ComputerAction::Screenshot,
            None,
            None,
            None,
            None,
            None,
            None,
        )
        .await
    {
        Ok(result) => {
            info!("截图成功");
            Ok(result)
        }
        Err(e) => {
            let err_msg = e.to_string();
            error!("截图失败: {}", err_msg);
            Err(err_msg)
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct BashCommandArgs {
    command: Option<String>,
    restart: Option<bool>,
}

/// 执行Bash命令
#[command]
pub async fn execute_bash_command(args: BashCommandArgs) -> Result<ToolResult, String> {
    info!("接收到Bash命令: {:?}", args);

    // 创建一个新的 BashTool 实例
    let bash_tool = BashTool::new();

    // 添加超时处理
    let execution_result = tokio::time::timeout(
        std::time::Duration::from_secs(35), // 比工具内部超时稍长一些
        bash_tool.execute(args.command.clone(), args.restart.unwrap_or(false)),
    )
    .await;

    // 处理超时和执行结果
    match execution_result {
        Ok(result) => {
            match result {
                Ok(tool_result) => {
                    info!("Bash命令执行成功");
                    Ok(tool_result)
                }
                Err(e) => {
                    let err_msg = e.to_string();
                    error!("Bash命令执行失败: {}", err_msg);

                    // 如果是超时错误，返回更友好的错误信息
                    if err_msg.contains("超时") {
                        Ok(ToolResult {
                            output: None,
                            error: Some(format!(
                                "命令执行超时: {}",
                                args.command.unwrap_or_default()
                            )),
                            base64_image: None,
                            system: Some(
                                "请尝试使用 restart: true 重启 Bash 会话，或者使用更简单的命令"
                                    .to_string(),
                            ),
                        })
                    } else {
                        Err(err_msg)
                    }
                }
            }
        }
        Err(_) => {
            // Tauri 命令本身超时
            error!("Bash命令执行超时（Tauri 命令级别）");
            Ok(ToolResult {
                output: None,
                error: Some("命令执行超时（Tauri 命令级别）".to_string()),
                base64_image: None,
                system: Some(
                    "请尝试使用 restart: true 重启 Bash 会话，或者使用更简单的命令".to_string(),
                ),
            })
        }
    }
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
    info!(
        "接收到编辑命令: {:?}, 文件路径: {}",
        args.command, args.path
    );

    let edit_tool = EditTool::new();

    match edit_tool
        .execute(
            args.command,
            args.path,
            args.file_text,
            args.view_range,
            args.old_str,
            args.new_str,
            args.insert_line,
        )
        .await
    {
        Ok(result) => {
            info!("编辑命令执行成功");
            Ok(result)
        }
        Err(e) => {
            let err_msg = e.to_string();
            error!("编辑命令执行失败: {}", err_msg);
            Err(err_msg)
        }
    }
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    info!("接收到问候请求，用户名: {}", name);
    format!("你好，{}！欢迎使用 Maestro！", name)
}
