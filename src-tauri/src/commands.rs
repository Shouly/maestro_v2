// 这个模块包含所有Tauri命令

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("你好，{}！欢迎使用 Maestro！", name)
} 