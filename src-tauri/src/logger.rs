use std::fs;
use std::path::Path;
use std::sync::Once;
use chrono::Local;
use env_logger::{Builder, Env};
use log::LevelFilter;
use std::io::Write;

// 日志文件路径
const LOG_DIR: &str = "logs";
const LOG_FILE_PREFIX: &str = "maestro";

// 确保日志初始化只执行一次
static INIT: Once = Once::new();

/// 初始化日志系统
pub fn init() {
    INIT.call_once(|| {
        // 创建日志目录
        let log_dir = Path::new(LOG_DIR);
        if !log_dir.exists() {
            fs::create_dir_all(log_dir).expect("无法创建日志目录");
        }

        // 生成日志文件名，格式为 maestro_YYYY-MM-DD.log
        let date = Local::now().format("%Y-%m-%d").to_string();
        let log_file = format!("{}_{}.log", LOG_FILE_PREFIX, date);
        let log_path = log_dir.join(log_file);

        // 配置日志
        let env = Env::default()
            .filter_or("RUST_LOG", "info"); // 默认日志级别为 info

        let mut builder = Builder::from_env(env);
        builder.format(|buf, record| {
            writeln!(
                buf,
                "{} [{}] - {}: {}",
                Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
                record.level(),
                record.target(),
                record.args()
            )
        });

        // 同时输出到控制台和文件
        if let Ok(file) = fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(log_path)
        {
            builder
                .filter(None, LevelFilter::Info)
                .target(env_logger::Target::Pipe(Box::new(file)))
                .init();
        } else {
            // 如果无法打开文件，则只输出到控制台
            builder
                .filter(None, LevelFilter::Info)
                .init();
        }

        log::info!("日志系统初始化完成");
    });
}

/// 获取日志目录路径
pub fn get_log_dir() -> String {
    LOG_DIR.to_string()
}

/// 获取当前日志文件路径
pub fn get_current_log_file() -> String {
    let date = Local::now().format("%Y-%m-%d").to_string();
    format!("{}/{}_{}.log", LOG_DIR, LOG_FILE_PREFIX, date)
} 