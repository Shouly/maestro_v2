// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 导入命令模块
use maestro::commands;

// 添加一个新的命令来获取屏幕尺寸
#[tauri::command]
fn get_screen_size(window: tauri::Window) -> (u32, u32) {
    if let Some(monitor) = window.current_monitor().unwrap() {
        let size = monitor.size();
        (size.width, size.height)
    } else {
        // 默认尺寸
        (1280, 720)
    }
}

fn main() {
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
        ]);
    
    app.run(tauri::generate_context!())
        .expect("Tauri 应用运行失败");
}
