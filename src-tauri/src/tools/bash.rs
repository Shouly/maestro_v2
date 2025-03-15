use crate::tools::base::{ToolError, ToolResult};
use std::{
    io::{BufRead, BufReader, Write},
    process::{Child, Command, Stdio},
    time::Duration,
};
use tokio::sync::Mutex;

const TIMEOUT_SECONDS: u64 = 120;
const SENTINEL: &str = "<<BASH_TOOL_SENTINEL>>";

/// Bash工具，用于执行系统命令
pub struct BashTool {
    /// 会话状态，用于保持命令执行的上下文
    session: Mutex<BashSession>,
}

/// Bash会话，维护命令执行的状态
struct BashSession {
    /// 是否已启动
    started: bool,
    /// 是否超时
    timed_out: bool,
    /// Bash进程
    process: Option<Child>,
}

impl BashTool {
    /// 创建一个新的Bash工具实例
    pub fn new() -> Self {
        Self {
            session: Mutex::new(BashSession {
                started: false,
                timed_out: false,
                process: None,
            }),
        }
    }

    /// 启动Bash会话
    async fn start_session(&self) -> Result<(), ToolError> {
        let mut session = self.session.lock().await;

        if session.started && session.process.is_some() {
            return Ok(());
        }

        // 创建一个新的bash进程
        let process = Command::new("bash")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| ToolError::new(format!("启动bash进程失败: {}", e)))?;

        session.process = Some(process);
        session.started = true;
        session.timed_out = false;

        Ok(())
    }

    /// 执行Bash命令
    pub async fn execute(
        &self,
        command: Option<String>,
        restart: bool,
    ) -> Result<ToolResult, ToolError> {
        let mut session = self.session.lock().await;

        if restart {
            // 如果有正在运行的进程，先终止它
            if let Some(mut process) = session.process.take() {
                let _ = process.kill();
            }

            *session = BashSession {
                started: false,
                timed_out: false,
                process: None,
            };

            drop(session);
            self.start_session().await?;

            return Ok(ToolResult {
                output: None,
                error: None,
                base64_image: None,
                system: Some("工具已重启".to_string()),
            });
        }

        if session.timed_out {
            return Err(ToolError::new("会话已超时，需要重启"));
        }

        // 如果会话未启动，先启动它
        if !session.started || session.process.is_none() {
            drop(session);
            self.start_session().await?;
            session = self.session.lock().await;
        }

        let command = command.ok_or_else(|| ToolError::new("未提供命令"))?;

        // 获取进程引用
        let process = session.process.as_mut()
            .ok_or_else(|| ToolError::new("bash进程未启动"))?;

        // 确保进程仍在运行
        match process.try_wait() {
            Ok(Some(status)) => {
                return Ok(ToolResult {
                    output: None,
                    error: Some(format!(
                        "bash已退出，退出码为 {}",
                        status.code().unwrap_or(-1)
                    )),
                    base64_image: None,
                    system: Some("工具需要重启".to_string()),
                });
            }
            Err(e) => {
                return Err(ToolError::new(format!("检查bash进程状态失败: {}", e)));
            }
            _ => {} // 进程仍在运行
        }

        // 获取stdin、stdout和stderr，避免同时可变借用
        // 先获取所有需要的句柄，然后再使用它们
        let mut stdin_opt = process.stdin.take();
        let stdout_opt = process.stdout.take();
        let stderr_opt = process.stderr.take();

        // 释放会话锁，以便在执行命令期间不阻塞其他操作
        drop(session);

        // 检查是否成功获取所有句柄
        let stdin = stdin_opt
            .as_mut()
            .ok_or_else(|| ToolError::new("无法获取bash进程的stdin"))?;
        let stdout = stdout_opt
            .ok_or_else(|| ToolError::new("无法获取bash进程的stdout"))?;
        let stderr = stderr_opt
            .ok_or_else(|| ToolError::new("无法获取bash进程的stderr"))?;

        // 写入命令，并添加哨兵以标记命令结束
        writeln!(
            stdin,
            "{} && echo {} || echo {}",
            command, SENTINEL, SENTINEL
        )
        .map_err(|e| ToolError::new(format!("写入命令失败: {}", e)))?;

        // 读取输出直到遇到哨兵
        let mut stdout_reader = BufReader::new(stdout);
        let mut stderr_reader = BufReader::new(stderr);

        let mut stdout_output = String::new();
        let mut stderr_output = String::new();

        // 设置超时
        let start_time = std::time::Instant::now();

        // 读取stdout
        loop {
            let mut line = String::new();
            match stdout_reader.read_line(&mut line) {
                Ok(0) => break, // EOF
                Ok(_) => {
                    if line.trim() == SENTINEL {
                        break;
                    }
                    stdout_output.push_str(&line);
                }
                Err(e) => return Err(ToolError::new(format!("读取stdout失败: {}", e))),
            }

            // 检查超时
            if start_time.elapsed().as_secs() > TIMEOUT_SECONDS {
                let mut session = self.session.lock().await;
                session.timed_out = true;
                return Err(ToolError::new(format!(
                    "命令执行超时（{}秒）",
                    TIMEOUT_SECONDS
                )));
            }

            // 短暂休眠，避免CPU占用过高
            std::thread::sleep(Duration::from_millis(10));
        }

        // 读取stderr（非阻塞）
        loop {
            let mut line = String::new();
            match stderr_reader.read_line(&mut line) {
                Ok(0) => break, // EOF
                Ok(_) => stderr_output.push_str(&line),
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => break,
                Err(e) => return Err(ToolError::new(format!("读取stderr失败: {}", e))),
            }
        }

        // 恢复进程的标准输入输出句柄
        let mut session = self.session.lock().await;
        if let Some(process) = session.process.as_mut() {
            process.stdin = stdin_opt;
            process.stdout = Some(stdout_reader.into_inner());
            process.stderr = Some(stderr_reader.into_inner());
        }

        Ok(ToolResult {
            output: if stdout_output.is_empty() {
                None
            } else {
                Some(stdout_output)
            },
            error: if stderr_output.is_empty() {
                None
            } else {
                Some(stderr_output)
            },
            base64_image: None,
            system: None,
        })
    }
}
