use crate::tools::base::{ToolError, ToolResult};
use std::{
    io::{BufRead, BufReader, Write, Read},
    process::{Child, Command, Stdio},
    time::{Duration, Instant},
    sync::Arc,
};
use tokio::{sync::Mutex, time::timeout};

const TIMEOUT_SECONDS: u64 = 30; // 减少超时时间
const SENTINEL: &str = "<<BASH_TOOL_SENTINEL_UNIQUE_STRING_12345>>";
const MAX_OUTPUT_SIZE: usize = 1024 * 1024; // 限制输出大小为 1MB

/// Bash工具，用于执行系统命令
pub struct BashTool {
    /// 会话状态，用于保持命令执行的上下文
    session: Arc<Mutex<BashSession>>,
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
            session: Arc::new(Mutex::new(BashSession {
                started: false,
                timed_out: false,
                process: None,
            })),
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
        // 如果需要重启会话
        if restart {
            let mut session = self.session.lock().await;
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

        // 检查会话状态
        {
            let session = self.session.lock().await;
            if session.timed_out {
                return Err(ToolError::new("会话已超时，请使用 restart: true 重启会话"));
            }
        }

        // 如果会话未启动，先启动它
        {
            let session = self.session.lock().await;
            if !session.started || session.process.is_none() {
                drop(session);
                self.start_session().await?;
            }
        }

        let command = command.ok_or_else(|| ToolError::new("未提供命令"))?;

        // 使用超时包装整个命令执行过程
        match timeout(
            Duration::from_secs(TIMEOUT_SECONDS),
            self.execute_command_with_timeout(command.clone())
        ).await {
            Ok(result) => result,
            Err(_) => {
                // 超时处理
                let mut session = self.session.lock().await;
                session.timed_out = true;
                
                // 尝试终止当前进程并重启
                if let Some(mut process) = session.process.take() {
                    let _ = process.kill();
                }
                
                *session = BashSession {
                    started: false,
                    timed_out: false,
                    process: None,
                };
                
                drop(session);
                // 尝试重新启动会话
                let _ = self.start_session().await;
                
                Err(ToolError::new(format!(
                    "命令执行超时（{}秒）: {}",
                    TIMEOUT_SECONDS,
                    command
                )))
            }
        }
    }

    /// 带超时的命令执行
    async fn execute_command_with_timeout(&self, command: String) -> Result<ToolResult, ToolError> {
        let session_arc = Arc::clone(&self.session);
        let mut session = session_arc.lock().await;

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

        // 获取stdin、stdout和stderr
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

        // 使用更可靠的命令执行方式，添加超时和输出限制
        // 使用 timeout 命令限制执行时间，并使用管道确保输出不会被缓冲
        let wrapped_command = format!(
            "{{ timeout {} {} || echo \"命令执行超时\"; }} 2>&1; echo \"{}\"",
            TIMEOUT_SECONDS - 5, // 留出5秒处理时间
            command.replace("\"", "\\\""), // 转义引号
            SENTINEL
        );

        // 写入命令
        writeln!(stdin, "{}", wrapped_command)
            .map_err(|e| ToolError::new(format!("写入命令失败: {}", e)))?;

        // 读取输出直到遇到哨兵或达到大小限制
        let mut reader = BufReader::new(stdout);
        let mut output = String::new();
        let start_time = Instant::now();

        loop {
            let mut line = String::new();
            match reader.read_line(&mut line) {
                Ok(0) => break, // EOF
                Ok(_) => {
                    if line.trim() == SENTINEL {
                        break;
                    }
                    
                    // 检查输出大小限制
                    if output.len() + line.len() > MAX_OUTPUT_SIZE {
                        output.push_str("\n... 输出过大，已截断 ...");
                        break;
                    }
                    
                    output.push_str(&line);
                }
                Err(e) => return Err(ToolError::new(format!("读取输出失败: {}", e))),
            }

            // 检查执行时间
            if start_time.elapsed().as_secs() > TIMEOUT_SECONDS - 2 {
                output.push_str("\n命令执行时间过长，已强制终止");
                break;
            }
        }

        // 读取stderr（非阻塞，已经通过2>&1重定向到stdout）
        let mut stderr_output = String::new();
        let mut stderr_reader = BufReader::new(stderr);
        let _ = stderr_reader.read_to_string(&mut stderr_output);

        // 恢复进程的标准输入输出句柄
        let mut session = session_arc.lock().await;
        if let Some(process) = session.process.as_mut() {
            process.stdin = stdin_opt;
            process.stdout = Some(reader.into_inner());
            process.stderr = Some(stderr_reader.into_inner());
        }

        // 检查输出中是否包含超时信息
        if output.contains("命令执行超时") || output.contains("命令执行时间过长") {
            session.timed_out = true;
            return Err(ToolError::new(format!(
                "命令执行超时（{}秒）",
                TIMEOUT_SECONDS
            )));
        }

        Ok(ToolResult {
            output: if output.is_empty() {
                None
            } else {
                Some(output)
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
