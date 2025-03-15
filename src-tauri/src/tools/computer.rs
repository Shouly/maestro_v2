use crate::tools::base::{ToolError, ToolResult};
use base64::{engine::general_purpose, Engine as _};
use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File},
    io::Read,
    path::Path,
    process::{Command, Stdio},
    time::Duration,
};
use uuid::Uuid;

const OUTPUT_DIR: &str = "/tmp/outputs";
const TYPING_DELAY_MS: u32 = 12;
const TYPING_GROUP_SIZE: usize = 50;
const SCREENSHOT_DELAY: f32 = 2.0;

/// 计算机控制工具支持的操作
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ComputerAction {
    /// 按下特定键
    Key,
    /// 输入文本
    Type,
    /// 移动鼠标
    MouseMove,
    /// 左键点击
    LeftClick,
    /// 左键拖拽
    LeftClickDrag,
    /// 右键点击
    RightClick,
    /// 中键点击
    MiddleClick,
    /// 双击
    DoubleClick,
    /// 三击
    TripleClick,
    /// 截图
    Screenshot,
    /// 获取光标位置
    CursorPosition,
    /// 按下左键
    LeftMouseDown,
    /// 释放左键
    LeftMouseUp,
    /// 滚动
    Scroll,
    /// 按住键
    HoldKey,
    /// 等待
    Wait,
}

/// 滚动方向
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ScrollDirection {
    Up,
    Down,
    Left,
    Right,
}

/// 缩放源
#[derive(Debug, Clone, Copy)]
pub enum ScalingSource {
    Computer,
    Api,
}

/// 分辨率
#[derive(Debug, Clone, Copy)]
pub struct Resolution {
    pub width: u32,
    pub height: u32,
}

// 定义目标分辨率常量，与Python版本保持一致
const MAX_SCALING_TARGETS: [(&str, Resolution); 3] = [
    (
        "XGA",
        Resolution {
            width: 1024,
            height: 768,
        },
    ), // 4:3
    (
        "WXGA",
        Resolution {
            width: 1280,
            height: 800,
        },
    ), // 16:10
    (
        "FWXGA",
        Resolution {
            width: 1366,
            height: 768,
        },
    ), // ~16:9
];

/// 计算机控制工具
pub struct ComputerTool {
    width: u32,
    height: u32,
    display_num: Option<u32>,
    display_prefix: String,
    xdotool: String,
    scaling_enabled: bool,
}

impl ComputerTool {
    /// 创建一个新的计算机控制工具实例
    pub fn new() -> Result<Self, ToolError> {
        info!("初始化计算机控制工具");

        // 直接获取系统屏幕尺寸，不再尝试从环境变量获取
        let (width, height) = {
            #[cfg(target_os = "macos")]
            {
                // 在 macOS 上使用 NSScreen 获取屏幕尺寸
                let width_output = Command::new("sh")
                    .arg("-c")
                    .arg("system_profiler SPDisplaysDataType | grep Resolution | awk '{print $2}'")
                    .output()
                    .map_err(|e| ToolError::new(&format!("无法获取屏幕宽度: {}", e)))?;

                let height_output = Command::new("sh")
                    .arg("-c")
                    .arg("system_profiler SPDisplaysDataType | grep Resolution | awk '{print $4}'")
                    .output()
                    .map_err(|e| ToolError::new(&format!("无法获取屏幕高度: {}", e)))?;

                let width_str = String::from_utf8_lossy(&width_output.stdout);
                let height_str = String::from_utf8_lossy(&height_output.stdout);

                let width = width_str.trim().parse::<u32>().unwrap_or(1280);
                let height = height_str.trim().parse::<u32>().unwrap_or(720);

                (width, height)
            }

            #[cfg(target_os = "linux")]
            {
                // 在 Linux 上使用 xrandr 获取屏幕尺寸
                let output = Command::new("sh")
                    .arg("-c")
                    .arg("xrandr | grep '*' | awk '{print $1}' | head -n1")
                    .output()
                    .map_err(|e| ToolError::new(&format!("无法获取屏幕尺寸: {}", e)))?;

                let size_str = String::from_utf8_lossy(&output.stdout);
                let parts: Vec<&str> = size_str.trim().split('x').collect();

                if parts.len() == 2 {
                    let width = parts[0].parse::<u32>().unwrap_or(1280);
                    let height = parts[1].parse::<u32>().unwrap_or(720);
                    (width, height)
                } else {
                    (1280, 720) // 默认尺寸
                }
            }

            #[cfg(target_os = "windows")]
            {
                // 在 Windows 上使用 PowerShell 获取屏幕尺寸
                let width_output = Command::new("powershell")
                    .arg("-Command")
                    .arg("[System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width")
                    .output()
                    .map_err(|e| ToolError::new(&format!("无法获取屏幕宽度: {}", e)))?;

                let height_output = Command::new("powershell")
                    .arg("-Command")
                    .arg("[System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height")
                    .output()
                    .map_err(|e| ToolError::new(&format!("无法获取屏幕高度: {}", e)))?;

                let width_str = String::from_utf8_lossy(&width_output.stdout);
                let height_str = String::from_utf8_lossy(&height_output.stdout);

                let width = width_str.trim().parse::<u32>().unwrap_or(1280);
                let height = height_str.trim().parse::<u32>().unwrap_or(720);

                (width, height)
            }

            #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
            {
                (1280, 720) // 默认尺寸
            }
        };

        info!("获取到系统屏幕尺寸: {}x{}", width, height);

        // 不再从环境变量获取display_num
        let display_num = None;
        let display_prefix = if let Some(num) = display_num {
            format!("DISPLAY=:{} ", num)
        } else {
            String::new()
        };

        let xdotool = format!("{}xdotool", display_prefix);

        info!("计算机控制工具初始化完成，屏幕尺寸: {}x{}", width, height);

        Ok(Self {
            width,
            height,
            display_num,
            display_prefix,
            xdotool,
            scaling_enabled: true,
        })
    }

    /// 获取工具配置选项
    pub fn options(&self) -> serde_json::Value {
        let (width, height) =
            self.scale_coordinates(ScalingSource::Computer, self.width, self.height);
        debug!(
            "获取计算机工具配置: 宽度={}, 高度={}, 显示器编号={:?}",
            width, height, self.display_num
        );
        serde_json::json!({
            "display_width_px": width,
            "display_height_px": height,
            "display_number": self.display_num,
        })
    }

    /// 执行计算机控制操作
    pub async fn execute(
        &self,
        action: ComputerAction,
        text: Option<String>,
        coordinate: Option<(i32, i32)>,
        scroll_direction: Option<ScrollDirection>,
        scroll_amount: Option<u32>,
        duration: Option<f32>,
        key: Option<String>,
    ) -> Result<ToolResult, ToolError> {
        info!(
            "执行计算机控制操作: {:?}, 坐标={:?}, 文本={:?}, 按键={:?}",
            action, coordinate, text, key
        );

        match action {
            ComputerAction::MouseMove | ComputerAction::LeftClickDrag => {
                let coordinate = coordinate.ok_or_else(|| {
                    ToolError::new(format!("coordinate is required for {:?}", action))
                })?;
                if text.is_some() {
                    return Err(ToolError::new(format!(
                        "text is not accepted for {:?}",
                        action
                    )));
                }

                let (x, y) = self.validate_and_get_coordinates(coordinate)?;

                if matches!(action, ComputerAction::MouseMove) {
                    let command = format!("{} mousemove --sync {} {}", self.xdotool, x, y);
                    self.shell(&command, true).await
                } else {
                    let command = format!(
                        "{} mousedown 1 mousemove --sync {} {} mouseup 1",
                        self.xdotool, x, y
                    );
                    self.shell(&command, true).await
                }
            }
            ComputerAction::Key | ComputerAction::Type => {
                let text = text
                    .ok_or_else(|| ToolError::new(format!("text is required for {:?}", action)))?;
                if coordinate.is_some() {
                    return Err(ToolError::new(format!(
                        "coordinate is not accepted for {:?}",
                        action
                    )));
                }

                if matches!(action, ComputerAction::Key) {
                    let command = format!("{} key -- {}", self.xdotool, text);
                    self.shell(&command, true).await
                } else {
                    let mut results = Vec::new();
                    for chunk in text.chars().collect::<Vec<_>>().chunks(TYPING_GROUP_SIZE) {
                        let chunk_str: String = chunk.iter().collect();
                        let command = format!(
                            "{} type --delay {} -- {}",
                            self.xdotool,
                            TYPING_DELAY_MS,
                            shell_escape::escape(chunk_str.into())
                        );
                        let result = self.shell(&command, false).await?;
                        results.push(result);
                    }

                    let screenshot = self.take_screenshot().await?;

                    let output = results
                        .iter()
                        .filter_map(|r| r.output.clone())
                        .collect::<Vec<_>>()
                        .join("");

                    let error = results
                        .iter()
                        .filter_map(|r| r.error.clone())
                        .collect::<Vec<_>>()
                        .join("");

                    Ok(ToolResult {
                        output: if output.is_empty() {
                            None
                        } else {
                            Some(output)
                        },
                        error: if error.is_empty() { None } else { Some(error) },
                        base64_image: screenshot.base64_image,
                        system: None,
                    })
                }
            }
            ComputerAction::LeftClick
            | ComputerAction::RightClick
            | ComputerAction::MiddleClick
            | ComputerAction::DoubleClick
            | ComputerAction::TripleClick => {
                if text.is_some() {
                    return Err(ToolError::new(format!(
                        "text is not accepted for {:?}",
                        action
                    )));
                }

                let mut command_parts = Vec::new();
                command_parts.push(self.xdotool.clone());

                if let Some(coords) = coordinate {
                    let (x, y) = self.validate_and_get_coordinates(coords)?;
                    command_parts.push(format!("mousemove --sync {} {}", x, y));
                }

                if let Some(k) = &key {
                    command_parts.push(format!("keydown {}", k));
                }

                let click_button = match action {
                    ComputerAction::LeftClick => "1",
                    ComputerAction::RightClick => "3",
                    ComputerAction::MiddleClick => "2",
                    ComputerAction::DoubleClick => "--repeat 2 --delay 10 1",
                    ComputerAction::TripleClick => "--repeat 3 --delay 10 1",
                    _ => unreachable!(),
                };

                command_parts.push(format!("click {}", click_button));

                if let Some(k) = &key {
                    command_parts.push(format!("keyup {}", k));
                }

                self.shell(&command_parts.join(" "), true).await
            }
            ComputerAction::Screenshot => {
                info!("执行截图操作");
                self.take_screenshot().await
            }
            ComputerAction::CursorPosition => {
                info!("获取光标位置");
                let command = format!("{} getmouselocation --shell", self.xdotool);
                let result = self.shell(&command, false).await?;

                if let Some(output) = result.output {
                    let x_part = output
                        .split("X=")
                        .nth(1)
                        .ok_or_else(|| ToolError::new("无法解析X坐标"))?;
                    let x = x_part
                        .split('\n')
                        .next()
                        .ok_or_else(|| ToolError::new("无法解析X坐标"))?
                        .parse::<i32>()
                        .map_err(|_| ToolError::new("无法解析X坐标为数字"))?;

                    let y_part = output
                        .split("Y=")
                        .nth(1)
                        .ok_or_else(|| ToolError::new("无法解析Y坐标"))?;
                    let y = y_part
                        .split('\n')
                        .next()
                        .ok_or_else(|| ToolError::new("无法解析Y坐标"))?
                        .parse::<i32>()
                        .map_err(|_| ToolError::new("无法解析Y坐标为数字"))?;

                    let (scaled_x, scaled_y) =
                        self.scale_coordinates(ScalingSource::Computer, x as u32, y as u32);

                    Ok(ToolResult {
                        output: Some(format!("X={},Y={}", scaled_x, scaled_y)),
                        error: None,
                        base64_image: None,
                        system: None,
                    })
                } else {
                    Err(ToolError::new("获取光标位置失败"))
                }
            }
            ComputerAction::LeftMouseDown | ComputerAction::LeftMouseUp => {
                if coordinate.is_some() {
                    return Err(ToolError::new(format!(
                        "coordinate is not accepted for {:?}",
                        action
                    )));
                }

                let action_str = if matches!(action, ComputerAction::LeftMouseDown) {
                    "mousedown"
                } else {
                    "mouseup"
                };
                let command = format!("{} {} 1", self.xdotool, action_str);

                self.shell(&command, true).await
            }
            ComputerAction::Scroll => {
                let scroll_direction = scroll_direction.ok_or_else(|| {
                    ToolError::new("scroll_direction is required for scroll action")
                })?;

                let scroll_amount = scroll_amount
                    .ok_or_else(|| ToolError::new("scroll_amount is required for scroll action"))?;

                let mut command_parts = Vec::new();
                command_parts.push(self.xdotool.clone());

                if let Some(coords) = coordinate {
                    let (x, y) = self.validate_and_get_coordinates(coords)?;
                    command_parts.push(format!("mousemove --sync {} {}", x, y));
                }

                if let Some(t) = &text {
                    command_parts.push(format!("keydown {}", t));
                }

                let scroll_button = match scroll_direction {
                    ScrollDirection::Up => "4",
                    ScrollDirection::Down => "5",
                    ScrollDirection::Left => "6",
                    ScrollDirection::Right => "7",
                };

                command_parts.push(format!(
                    "click --repeat {} {}",
                    scroll_amount, scroll_button
                ));

                if let Some(t) = &text {
                    command_parts.push(format!("keyup {}", t));
                }

                self.shell(&command_parts.join(" "), true).await
            }
            ComputerAction::HoldKey => {
                let duration = duration
                    .ok_or_else(|| ToolError::new("duration is required for hold_key action"))?;

                // 更严格的duration验证，与Python版本保持一致
                if duration < 0.0 {
                    return Err(ToolError::new(format!(
                        "duration={} must be non-negative",
                        duration
                    )));
                }
                if duration > 100.0 {
                    return Err(ToolError::new(format!("duration={} is too long", duration)));
                }

                let text =
                    text.ok_or_else(|| ToolError::new("text is required for hold_key action"))?;

                let escaped_keys = shell_escape::escape(text.into());
                let command = format!(
                    "{} keydown {} sleep {} keyup {}",
                    self.xdotool, escaped_keys, duration, escaped_keys
                );

                self.shell(&command, true).await
            }
            ComputerAction::Wait => {
                info!("等待操作: {}秒", duration.unwrap_or(0.0));
                let duration = duration
                    .ok_or_else(|| ToolError::new("duration is required for wait action"))?;

                // 更严格的duration验证，与Python版本保持一致
                if duration < 0.0 {
                    return Err(ToolError::new(format!(
                        "duration={} must be non-negative",
                        duration
                    )));
                }
                if duration > 100.0 {
                    return Err(ToolError::new(format!("duration={} is too long", duration)));
                }

                // 使用tokio的sleep而不是标准库的sleep
                tokio::time::sleep(Duration::from_secs_f32(duration)).await;
                self.take_screenshot().await
            }
        }
    }

    /// 验证并获取坐标
    fn validate_and_get_coordinates(
        &self,
        coordinate: (i32, i32),
    ) -> Result<(u32, u32), ToolError> {
        let (x, y) = coordinate;
        debug!("验证坐标: ({}, {})", x, y);

        // 更严格的坐标验证，与Python版本保持一致
        if x < 0 || y < 0 {
            let err_msg = format!("{:?} must be a tuple of non-negative ints", coordinate);
            error!("坐标验证失败: {}", err_msg);
            return Err(ToolError::new(err_msg));
        }

        // 检查坐标是否超出屏幕范围
        if x as u32 > self.width || y as u32 > self.height {
            let err_msg = format!("Coordinates {}, {} are out of bounds", x, y);
            error!("坐标超出屏幕范围: {}", err_msg);
            return Err(ToolError::new(err_msg));
        }

        let scaled = self.scale_coordinates(ScalingSource::Api, x as u32, y as u32);
        debug!(
            "坐标缩放结果: ({}, {}) -> ({}, {})",
            x, y, scaled.0, scaled.1
        );
        Ok(scaled)
    }

    /// 执行shell命令
    async fn shell(&self, command: &str, take_screenshot: bool) -> Result<ToolResult, ToolError> {
        debug!("执行Shell命令: {}", command);

        let output = Command::new("sh")
            .arg("-c")
            .arg(command)
            .output()
            .map_err(|e| {
                let err_msg = format!("执行命令失败: {}", e);
                error!("{}", err_msg);
                ToolError::new(err_msg)
            })?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        if !stderr.is_empty() {
            warn!("命令执行产生错误: {}", stderr);
        }

        let mut result = ToolResult {
            output: if stdout.is_empty() {
                None
            } else {
                Some(stdout)
            },
            error: if stderr.is_empty() {
                None
            } else {
                Some(stderr)
            },
            base64_image: None,
            system: None,
        };

        if take_screenshot {
            debug!("命令执行后需要截图，等待{}秒", SCREENSHOT_DELAY);
            // 延迟一段时间，让界面稳定下来，与Python版本保持一致
            tokio::time::sleep(Duration::from_secs_f32(SCREENSHOT_DELAY)).await;

            // 获取截图，使用Box::pin来避免无限大的Future
            info!("执行截图");
            let screenshot_future = Box::pin(self.take_screenshot());
            let screenshot_result = screenshot_future.await?;
            result.base64_image = screenshot_result.base64_image;
        }

        Ok(result)
    }

    /// 截取屏幕截图 - 重命名为 take_screenshot 以避免递归
    async fn take_screenshot(&self) -> Result<ToolResult, ToolError> {
        info!("开始截取屏幕截图");

        let output_dir = Path::new(OUTPUT_DIR);
        if !output_dir.exists() {
            debug!("创建输出目录: {}", OUTPUT_DIR);
            fs::create_dir_all(output_dir).map_err(|e| {
                let err_msg = format!("创建输出目录失败: {}", e);
                error!("{}", err_msg);
                ToolError::new(err_msg)
            })?;
        }

        // 使用UUID生成唯一文件名，与Python版本保持一致
        let filename = format!("screenshot_{}.png", Uuid::new_v4().to_string());
        let path = output_dir.join(&filename);
        debug!("截图文件路径: {}", path.display());

        // 根据操作系统选择不同的截图命令
        let screenshot_cmd = if cfg!(target_os = "macos") {
            // macOS使用screencapture
            format!("screencapture -x {}", path.display())
        } else if cfg!(target_os = "linux") {
            // Linux先尝试gnome-screenshot，如果不可用则使用scrot
            let has_gnome_screenshot = Command::new("which")
                .arg("gnome-screenshot")
                .stdout(Stdio::null())
                .status()
                .map(|s| s.success())
                .unwrap_or(false);

            if has_gnome_screenshot {
                debug!("使用gnome-screenshot进行截图");
                format!(
                    "{}gnome-screenshot -f {} -p",
                    self.display_prefix,
                    path.display()
                )
            } else {
                debug!("使用scrot进行截图");
                format!("{}scrot -p {}", self.display_prefix, path.display())
            }
        } else if cfg!(target_os = "windows") {
            // Windows可以使用PowerShell的截图功能
            debug!("使用PowerShell进行截图");
            format!(
                "powershell -command \"Add-Type -AssemblyName System.Windows.Forms; \
                [System.Windows.Forms.SendKeys]::SendWait('%{{PRTSC}}'); \
                $img = [System.Windows.Forms.Clipboard]::GetImage(); \
                $img.Save('{}')\"",
                path.display()
            )
        } else {
            let err_msg = "不支持的操作系统";
            error!("{}", err_msg);
            return Err(ToolError::new(err_msg));
        };

        // 执行截图命令
        debug!("执行截图命令: {}", screenshot_cmd);
        let result = self.shell(&screenshot_cmd, false).await?;

        // 如果启用了缩放，则调整图像大小
        if self.scaling_enabled {
            let (x, y) = self.scale_coordinates(ScalingSource::Computer, self.width, self.height);
            debug!("调整截图大小为: {}x{}", x, y);
            let convert_cmd = format!(
                "convert {} -resize {}x{}! {}",
                path.display(),
                x,
                y,
                path.display()
            );
            self.shell(&convert_cmd, false).await?;
        }

        // 检查文件是否存在并读取
        if path.exists() {
            debug!("截图文件已创建: {}", path.display());
            let mut file = File::open(&path).map_err(|e| {
                let err_msg = format!("无法打开截图文件: {}", e);
                error!("{}", err_msg);
                ToolError::new(err_msg)
            })?;

            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer).map_err(|e| {
                let err_msg = format!("无法读取截图文件: {}", e);
                error!("{}", err_msg);
                ToolError::new(err_msg)
            })?;

            let base64_image = general_purpose::STANDARD.encode(&buffer);
            info!("截图完成，图像大小: {} 字节", buffer.len());

            Ok(ToolResult {
                output: None,
                error: None,
                base64_image: Some(base64_image),
                system: None,
            })
        } else {
            let err_msg = format!("截图失败: {:?}", result.error);
            error!("{}", err_msg);
            Err(ToolError::new(err_msg))
        }
    }

    /// 缩放坐标
    fn scale_coordinates(&self, source: ScalingSource, x: u32, y: u32) -> (u32, u32) {
        if !self.scaling_enabled {
            return (x, y);
        }

        let ratio = self.width as f32 / self.height as f32;
        let mut target_dimension = None;

        // 查找合适的目标分辨率，与Python版本保持一致的逻辑
        for (_, dimension) in &MAX_SCALING_TARGETS {
            let dim_ratio = dimension.width as f32 / dimension.height as f32;
            // 允许比例有一定误差
            if (dim_ratio - ratio).abs() < 0.02 && dimension.width < self.width {
                target_dimension = Some(dimension);
                break;
            }
        }

        if let Some(target) = target_dimension {
            // 缩放因子应该小于1
            let x_scaling_factor = target.width as f32 / self.width as f32;
            let y_scaling_factor = target.height as f32 / self.height as f32;

            match source {
                ScalingSource::Api => {
                    // 从API坐标缩放到实际坐标
                    // 放大
                    (
                        (x as f32 / x_scaling_factor).round() as u32,
                        (y as f32 / y_scaling_factor).round() as u32,
                    )
                }
                ScalingSource::Computer => {
                    // 从实际坐标缩放到API坐标
                    // 缩小
                    (
                        (x as f32 * x_scaling_factor).round() as u32,
                        (y as f32 * y_scaling_factor).round() as u32,
                    )
                }
            }
        } else {
            (x, y)
        }
    }
}
