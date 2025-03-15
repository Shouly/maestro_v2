// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 导入命令模块
use maestro::commands;
// 导入日志模块
mod logger;
use log::{info, warn, error};
use std::fs;

// 添加一个新的命令来获取屏幕尺寸
#[tauri::command]
fn get_screen_size(window: tauri::Window) -> (u32, u32) {
    if let Some(monitor) = window.current_monitor().unwrap() {
        let size = monitor.size();
        info!("获取屏幕尺寸: {}x{}", size.width, size.height);
        (size.width, size.height)
    } else {
        // 默认尺寸
        warn!("无法获取屏幕尺寸，使用默认值: 1280x720");
        (1280, 720)
    }
}

// 添加一个新的命令来获取日志文件路径
#[tauri::command]
fn get_log_file_path() -> String {
    logger::get_current_log_file()
}

// 添加一个新的命令来读取日志文件内容
#[tauri::command]
fn read_log_file() -> Result<String, String> {
    let path = logger::get_current_log_file();
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("无法读取日志文件: {}", e))
    }
}

fn main() {
    // 初始化日志系统
    logger::init();
    info!("Maestro 应用程序启动");
    
    // 使用命令模块中的命令
    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::execute_computer_command,
            commands::get_computer_options,
            commands::take_screenshot,
            commands::execute_bash_command,
            commands::execute_edit_command,
            commands::greet,
            get_screen_size,
            get_log_file_path,
            read_log_file,
        ]);
    
    info!("Tauri 应用程序初始化完成");
    
    match app.run(tauri::generate_context!()) {
        Ok(_) => info!("Maestro 应用程序正常退出"),
        Err(e) => error!("Maestro 应用程序运行失败: {}", e),
    }
}
