use crate::tools::base::{ToolError, ToolResult};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};

const SNIPPET_LINES: usize = 4;
const MAX_FILE_SIZE: usize = 10 * 1024 * 1024; // 10MB
const MAX_DISPLAY_LINES: usize = 1000;
const TRUNCATED_MESSAGE: &str = "<文件已截断>\n注意：为了节省上下文，只显示了部分文件内容。请使用view_range参数查看特定行范围。";

/// 编辑命令类型
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EditCommand {
    /// 查看文件内容
    View,
    /// 创建新文件
    Create,
    /// 字符串替换
    StrReplace,
    /// 插入文本
    Insert,
    /// 撤销编辑
    UndoEdit,
}

/// 文本编辑工具
pub struct EditTool {
    /// 文件历史记录，用于撤销操作
    file_history: Arc<Mutex<HashMap<PathBuf, Vec<String>>>>,
}

impl EditTool {
    /// 创建一个新的文本编辑工具实例
    pub fn new() -> Self {
        Self {
            file_history: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// 执行编辑操作
    pub async fn execute(
        &self,
        command: EditCommand,
        path: String,
        file_text: Option<String>,
        view_range: Option<Vec<i32>>,
        old_str: Option<String>,
        new_str: Option<String>,
        insert_line: Option<i32>,
    ) -> Result<ToolResult, ToolError> {
        let path = PathBuf::from(&path);
        self.validate_path(&command, &path)?;

        match command {
            EditCommand::View => self.view(&path, view_range).await,
            EditCommand::Create => {
                let file_text = file_text.ok_or_else(|| ToolError::new("创建文件时需要提供文件内容"))?;
                self.create(&path, &file_text)
            }
            EditCommand::StrReplace => {
                let old_str = old_str.ok_or_else(|| ToolError::new("字符串替换时需要提供原字符串"))?;
                self.str_replace(&path, &old_str, new_str.as_deref())
            }
            EditCommand::Insert => {
                let insert_line = insert_line.ok_or_else(|| ToolError::new("插入文本时需要提供行号"))?;
                let new_str = new_str.ok_or_else(|| ToolError::new("插入文本时需要提供新文本"))?;
                self.insert(&path, insert_line, &new_str)
            }
            EditCommand::UndoEdit => self.undo_edit(&path),
        }
    }

    /// 验证路径和命令组合是否有效
    fn validate_path(&self, command: &EditCommand, path: &Path) -> Result<(), ToolError> {
        // 检查是否是绝对路径
        if !path.is_absolute() {
            let suggested_path = Path::new("").join(path);
            return Err(ToolError::new(format!(
                "路径 {} 不是绝对路径，应该以 '/' 开头。也许您想要的是 {}？",
                path.display(),
                suggested_path.display()
            )));
        }

        // 检查路径是否存在
        if !path.exists() && !matches!(command, EditCommand::Create) {
            return Err(ToolError::new(format!(
                "路径 {} 不存在。请提供有效的路径。",
                path.display()
            )));
        }

        if path.exists() && matches!(command, EditCommand::Create) {
            return Err(ToolError::new(format!(
                "文件已存在于: {}。不能使用 create 命令覆盖文件。",
                path.display()
            )));
        }

        // 检查路径是否指向目录
        if path.is_dir() && !matches!(command, EditCommand::View) {
            return Err(ToolError::new(format!(
                "路径 {} 是一个目录，只能对目录使用 view 命令",
                path.display()
            )));
        }

        Ok(())
    }

    /// 查看文件内容
    async fn view(&self, path: &Path, view_range: Option<Vec<i32>>) -> Result<ToolResult, ToolError> {
        if path.is_dir() {
            if view_range.is_some() {
                return Err(ToolError::new("查看目录时不允许使用 view_range 参数"));
            }

            // 使用tokio的异步文件系统操作
            let entries = tokio::fs::read_dir(path)
                .await
                .map_err(|e| ToolError::new(format!("读取目录失败: {}", e)))?;

            let mut files = Vec::new();
            let mut dirs = Vec::new();

            let mut entries_vec = Vec::new();
            let mut entry = entries;
            
            // 收集目录条目
            loop {
                match entry.next_entry().await {
                    Ok(Some(e)) => entries_vec.push(e),
                    Ok(None) => break,
                    Err(e) => return Err(ToolError::new(format!("读取目录条目失败: {}", e))),
                }
            }

            // 处理每个条目
            for entry in entries_vec {
                let path = entry.path();
                let file_name = path.file_name().unwrap().to_string_lossy().to_string();
                
                // 跳过隐藏文件
                if file_name.starts_with('.') {
                    continue;
                }
                
                let metadata = tokio::fs::metadata(&path)
                    .await
                    .map_err(|e| ToolError::new(format!("获取文件元数据失败: {}", e)))?;
                
                if metadata.is_dir() {
                    dirs.push(format!("{}/", file_name));
                } else {
                    files.push(file_name);
                }
            }

            // 排序并组合结果
            dirs.sort();
            files.sort();
            
            let output = format!(
                "目录 {} 的内容:\n\n目录:\n{}\n\n文件:\n{}",
                path.display(),
                dirs.join("\n"),
                files.join("\n")
            );
            
            return Ok(ToolResult::success(output));
        }

        // 读取文件内容
        let file_content = self.read_file(path)?;
        
        // 处理查看范围
        if let Some(range) = view_range {
            if range.len() != 2 {
                return Err(ToolError::new("无效的 view_range。它应该是两个整数的数组。"));
            }
            
            let init_line = range[0];
            let final_line = range[1];
            
            let file_lines: Vec<&str> = file_content.split('\n').collect();
            let n_lines_file = file_lines.len() as i32;
            
            if init_line < 1 || init_line > n_lines_file {
                return Err(ToolError::new(format!(
                    "无效的 view_range: {:?}。第一个元素 {} 应该在文件行数范围内: [1, {}]",
                    range, init_line, n_lines_file
                )));
            }
            
            if final_line != -1 && final_line < init_line {
                return Err(ToolError::new(format!(
                    "无效的 view_range: {:?}。第二个元素 {} 应该大于或等于第一个元素 {}",
                    range, final_line, init_line
                )));
            }
            
            let content = if final_line == -1 {
                file_lines[(init_line - 1) as usize..].join("\n")
            } else if final_line > n_lines_file {
                return Err(ToolError::new(format!(
                    "无效的 view_range: {:?}。第二个元素 {} 应该小于文件行数: {}",
                    range, final_line, n_lines_file
                )));
            } else {
                file_lines[(init_line - 1) as usize..final_line as usize].join("\n")
            };
            
            return Ok(ToolResult::success(self.make_output(&content, &path.to_string_lossy(), init_line as usize)));
        }
        
        // 返回完整文件内容
        Ok(ToolResult::success(self.make_output(&file_content, &path.to_string_lossy(), 1)))
    }

    /// 创建新文件
    fn create(&self, path: &Path, file_text: &str) -> Result<ToolResult, ToolError> {
        self.write_file(path, file_text)?;
        
        // 添加到历史记录
        let mut history = self.file_history.lock().unwrap();
        history.entry(path.to_path_buf()).or_insert_with(Vec::new).push(file_text.to_string());
        
        Ok(ToolResult::success(format!("文件创建成功: {}", path.display())))
    }

    /// 字符串替换
    fn str_replace(&self, path: &Path, old_str: &str, new_str: Option<&str>) -> Result<ToolResult, ToolError> {
        // 读取文件内容
        let file_content = self.read_file(path)?;
        let old_str = old_str.replace("\t", "    ");
        let new_str = new_str.unwrap_or("").replace("\t", "    ");
        
        // 检查原字符串是否唯一
        let occurrences = file_content.matches(&old_str).count();
        if occurrences == 0 {
            return Err(ToolError::new(format!(
                "未执行替换，原字符串 `{}` 在文件 {} 中未找到",
                old_str, path.display()
            )));
        } else if occurrences > 1 {
            let file_lines: Vec<&str> = file_content.split('\n').collect();
            let mut lines = Vec::new();
            
            for (idx, line) in file_lines.iter().enumerate() {
                if line.contains(&old_str) {
                    lines.push(idx + 1);
                }
            }
            
            return Err(ToolError::new(format!(
                "未执行替换。原字符串 `{}` 在行 {:?} 中有多处匹配。请确保它是唯一的",
                old_str, lines
            )));
        }
        
        // 计算替换行号（在替换前）
        let replacement_line = file_content.split(&old_str).next().unwrap().matches('\n').count();
        let start_line = replacement_line.saturating_sub(SNIPPET_LINES);
        let end_line = replacement_line + SNIPPET_LINES + new_str.matches('\n').count();
        
        // 替换字符串
        let new_file_content = file_content.replace(&old_str, &new_str);
        
        // 写入文件
        self.write_file(path, &new_file_content)?;
        
        // 添加到历史记录
        let mut history = self.file_history.lock().unwrap();
        history.entry(path.to_path_buf()).or_insert_with(Vec::new).push(file_content.clone());
        
        // 创建编辑部分的片段
        let file_lines: Vec<&str> = new_file_content.split('\n').collect();
        let snippet = file_lines[start_line..std::cmp::min(end_line + 1, file_lines.len())].join("\n");
        
        // 准备成功消息
        let success_msg = format!(
            "文件 {} 已编辑。\n\n{}",
            path.display(),
            self.make_output(&snippet, &format!("{} 的片段", path.display()), start_line + 1)
        );
        
        Ok(ToolResult::success(success_msg))
    }

    /// 插入文本
    fn insert(&self, path: &Path, insert_line: i32, new_str: &str) -> Result<ToolResult, ToolError> {
        // 读取文件内容
        let file_content = self.read_file(path)?;
        let new_str = new_str.replace("\t", "    ");
        
        let file_lines: Vec<&str> = file_content.split('\n').collect();
        let n_lines_file = file_lines.len() as i32;
        
        if insert_line < 0 || insert_line > n_lines_file {
            return Err(ToolError::new(format!(
                "无效的 insert_line 参数: {}。它应该在文件行数范围内: [0, {}]",
                insert_line, n_lines_file
            )));
        }
        
        let new_str_lines: Vec<&str> = new_str.split('\n').collect();
        let mut new_file_lines = Vec::new();
        
        // 构建新文件内容
        new_file_lines.extend_from_slice(&file_lines[0..insert_line as usize]);
        new_file_lines.extend_from_slice(&new_str_lines);
        new_file_lines.extend_from_slice(&file_lines[insert_line as usize..]);
        
        let new_file_content = new_file_lines.join("\n");
        
        // 创建片段
        let start_snippet_line = (insert_line as usize).saturating_sub(SNIPPET_LINES);
        let end_snippet_line = std::cmp::min(
            insert_line as usize + new_str_lines.len() + SNIPPET_LINES,
            new_file_lines.len()
        );
        
        let snippet = new_file_lines[start_snippet_line..end_snippet_line].join("\n");
        
        // 写入文件
        self.write_file(path, &new_file_content)?;
        
        // 添加到历史记录
        let mut history = self.file_history.lock().unwrap();
        history.entry(path.to_path_buf()).or_insert_with(Vec::new).push(file_content);
        
        // 准备成功消息
        let success_msg = format!(
            "文件 {} 已编辑。\n\n{}",
            path.display(),
            self.make_output(&snippet, &format!("编辑后文件的片段"), start_snippet_line + 1)
        );
        
        Ok(ToolResult::success(success_msg))
    }

    /// 撤销编辑
    fn undo_edit(&self, path: &Path) -> Result<ToolResult, ToolError> {
        let mut history = self.file_history.lock().unwrap();
        let file_history = history.get_mut(&path.to_path_buf());
        
        if let Some(history) = file_history {
            if let Some(old_text) = history.pop() {
                self.write_file(path, &old_text)?;
                
                return Ok(ToolResult::success(format!(
                    "文件 {} 的最后一次编辑已撤销。\n\n{}",
                    path.display(),
                    self.make_output(&old_text, &path.to_string_lossy(), 1)
                )));
            }
        }
        
        Err(ToolError::new(format!("未找到文件 {} 的编辑历史", path.display())))
    }

    /// 读取文件内容
    fn read_file(&self, path: &Path) -> Result<String, ToolError> {
        // 检查文件大小
        let metadata = fs::metadata(path)
            .map_err(|e| ToolError::new(format!("获取文件元数据失败: {}", e)))?;
        
        if metadata.len() > MAX_FILE_SIZE as u64 {
            return Err(ToolError::new(format!(
                "文件 {} 太大（{} 字节），超过了最大限制 {} 字节。请使用view_range参数查看特定行范围。",
                path.display(), metadata.len(), MAX_FILE_SIZE
            )));
        }
        
        fs::read_to_string(path).map_err(|e| ToolError::new(format!("读取文件 {} 时出错: {}", path.display(), e)))
    }

    /// 写入文件内容
    fn write_file(&self, path: &Path, content: &str) -> Result<(), ToolError> {
        // 确保目录存在
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| {
                ToolError::new(format!("创建目录 {} 时出错: {}", parent.display(), e))
            })?;
        }
        
        fs::write(path, content).map_err(|e| ToolError::new(format!("写入文件 {} 时出错: {}", path.display(), e)))
    }

    /// 生成输出格式
    fn make_output(&self, content: &str, file_descriptor: &str, init_line: usize) -> String {
        // 如果内容行数过多，截断显示
        let lines: Vec<&str> = content.split('\n').collect();
        let content_with_line_numbers = if lines.len() > MAX_DISPLAY_LINES {
            let first_half = MAX_DISPLAY_LINES / 2;
            let second_half = MAX_DISPLAY_LINES - first_half;
            
            let first_part: Vec<String> = lines[..first_half]
                .iter()
                .enumerate()
                .map(|(i, line)| format!("{:6}\t{}", i + init_line, line))
                .collect();
            
            let second_part: Vec<String> = lines[lines.len() - second_half..]
                .iter()
                .enumerate()
                .map(|(i, line)| format!("{:6}\t{}", i + init_line + lines.len() - second_half, line))
                .collect();
            
            format!(
                "{}\n\n{}\n\n{}",
                first_part.join("\n"),
                TRUNCATED_MESSAGE,
                second_part.join("\n")
            )
        } else {
            lines
                .iter()
                .enumerate()
                .map(|(i, line)| format!("{:6}\t{}", i + init_line, line))
                .collect::<Vec<_>>()
                .join("\n")
        };
        
        format!(
            "以下是对 {} 运行 `cat -n` 的结果:\n{}\n",
            file_descriptor,
            content_with_line_numbers
        )
    }
} 