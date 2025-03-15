// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 导入命令模块
mod commands;

fn main() {
    // 使用命令模块中的命令
    let app = maestro::build_app()
        .invoke_handler(tauri::generate_handler![commands::greet]);
    
    app.run(tauri::generate_context!())
        .expect("Tauri 应用运行失败");
}
