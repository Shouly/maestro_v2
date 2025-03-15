use tauri::Manager;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

// 注意：greet命令已移至commands.rs模块

/// 构建Tauri应用程序
/// 
/// 这个函数封装了Tauri应用的核心构建逻辑，可以被不同平台的入口点调用
pub fn build_app() -> tauri::Builder<tauri::Wry> {
    tauri::Builder::default()
        // 注意：命令处理器在main.rs中注册
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .plugin(tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build())
}

/// 运行Tauri应用程序
/// 
/// 这个函数是应用程序的主要入口点，可以被main.rs调用
pub fn run() {
    build_app()
        .run(tauri::generate_context!())
        .expect("Tauri 应用运行失败");
}

/// 移动平台入口点
/// 
/// 这个函数是为移动平台(iOS/Android)准备的入口点
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn mobile_entry_point() {
    build_app()
        .run(tauri::generate_context!())
        .expect("Tauri 移动应用运行失败");
} 