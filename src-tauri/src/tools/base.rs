use serde::{Deserialize, Serialize};
use std::fmt;

/// 表示工具执行的结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolResult {
    /// 工具执行的输出文本
    pub output: Option<String>,
    /// 工具执行的错误信息
    pub error: Option<String>,
    /// Base64编码的图像数据
    pub base64_image: Option<String>,
    /// 系统消息
    pub system: Option<String>,
}

impl ToolResult {
    /// 创建一个新的成功结果
    pub fn success(output: impl Into<String>) -> Self {
        Self {
            output: Some(output.into()),
            error: None,
            base64_image: None,
            system: None,
        }
    }

    /// 创建一个新的错误结果
    pub fn error(error: impl Into<String>) -> Self {
        Self {
            output: None,
            error: Some(error.into()),
            base64_image: None,
            system: None,
        }
    }

    /// 添加base64编码的图像
    pub fn with_image(mut self, base64_image: impl Into<String>) -> Self {
        self.base64_image = Some(base64_image.into());
        self
    }

    /// 添加系统消息
    pub fn with_system(mut self, system: impl Into<String>) -> Self {
        self.system = Some(system.into());
        self
    }
}

/// 工具执行错误
#[derive(Debug)]
pub struct ToolError {
    pub message: String,
}

impl ToolError {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

impl fmt::Display for ToolError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for ToolError {}

/// 将ToolError转换为ToolResult
impl From<ToolError> for ToolResult {
    fn from(error: ToolError) -> Self {
        Self::error(error.message)
    }
} 