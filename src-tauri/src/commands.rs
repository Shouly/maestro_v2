// 这个模块包含所有Tauri命令

use crate::tools::{ComputerTool, ComputerAction, ScrollDirection, ToolResult, BashTool, EditTool};
use crate::tools::edit::EditCommand;
use log::{debug, error, info};
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
    width: Option<u32>,
    height: Option<u32>,
}

/// 执行计算机控制命令
#[command]
pub async fn execute_computer_command(args: ComputerCommandArgs) -> Result<ToolResult, String> {
    info!("接收到计算机控制命令: {:?}", args);
    
    // 设置环境变量
    if let Some(w) = args.width {
        debug!("设置WIDTH环境变量: {}", w);
        std::env::set_var("WIDTH", w.to_string());
    }
    
    if let Some(h) = args.height {
        debug!("设置HEIGHT环境变量: {}", h);
        std::env::set_var("HEIGHT", h.to_string());
    }
    
    let computer_tool = match ComputerTool::new() {
        Ok(tool) => tool,
        Err(e) => {
            let err_msg = format!("创建计算机控制工具失败: {}", e);
            error!("{}", err_msg);
            return Err(err_msg);
        }
    };
    
    match computer_tool.execute(
        args.action,
        args.text,
        args.coordinate,
        args.scroll_direction,
        args.scroll_amount,
        args.duration,
        args.key,
    ).await {
        Ok(result) => {
            info!("计算机控制命令执行成功");
            Ok(result)
        },
        Err(e) => {
            let err_msg = e.to_string();
            error!("计算机控制命令执行失败: {}", err_msg);
            Err(err_msg)
        }
    }
}

/// 获取计算机工具配置
#[command]
pub fn get_computer_options(width: Option<u32>, height: Option<u32>) -> Result<serde_json::Value, String> {
    info!("获取计算机工具配置，宽度={:?}，高度={:?}", width, height);
    
    // 设置环境变量
    if let Some(w) = width {
        debug!("设置WIDTH环境变量: {}", w);
        std::env::set_var("WIDTH", w.to_string());
    }
    
    if let Some(h) = height {
        debug!("设置HEIGHT环境变量: {}", h);
        std::env::set_var("HEIGHT", h.to_string());
    }
    
    let computer_tool = match ComputerTool::new() {
        Ok(tool) => tool,
        Err(e) => {
            let err_msg = format!("创建计算机控制工具失败: {}", e);
            error!("{}", err_msg);
            return Err(err_msg);
        }
    };
    
    let options = computer_tool.options();
    info!("获取计算机工具配置成功");
    Ok(options)
}

/// 截取屏幕截图
#[command]
pub async fn take_screenshot(width: Option<u32>, height: Option<u32>) -> Result<ToolResult, String> {
    info!("接收到截图请求，宽度={:?}，高度={:?}", width, height);
    
    // 设置环境变量
    if let Some(w) = width {
        debug!("设置WIDTH环境变量: {}", w);
        std::env::set_var("WIDTH", w.to_string());
    }
    
    if let Some(h) = height {
        debug!("设置HEIGHT环境变量: {}", h);
        std::env::set_var("HEIGHT", h.to_string());
    }
    
    let computer_tool = match ComputerTool::new() {
        Ok(tool) => tool,
        Err(e) => {
            let err_msg = format!("创建计算机控制工具失败: {}", e);
            error!("{}", err_msg);
            return Err(err_msg);
        }
    };
    
    match computer_tool.execute(
        ComputerAction::Screenshot,
        None,
        None,
        None,
        None,
        None,
        None,
    ).await {
        Ok(result) => {
            info!("截图成功");
            Ok(result)
        },
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
    
    let bash_tool = BashTool::new();
    
    match bash_tool.execute(
        args.command,
        args.restart.unwrap_or(false),
    ).await {
        Ok(result) => {
            info!("Bash命令执行成功");
            Ok(result)
        },
        Err(e) => {
            let err_msg = e.to_string();
            error!("Bash命令执行失败: {}", err_msg);
            Err(err_msg)
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
    info!("接收到编辑命令: {:?}, 文件路径: {}", args.command, args.path);
    
    let edit_tool = EditTool::new();
    
    match edit_tool.execute(
        args.command,
        args.path,
        args.file_text,
        args.view_range,
        args.old_str,
        args.new_str,
        args.insert_line,
    ).await {
        Ok(result) => {
            info!("编辑命令执行成功");
            Ok(result)
        },
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