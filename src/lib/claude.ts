import { core } from '@tauri-apps/api';
import { ClaudeApiClient } from './claude-api';

// 消息类型
export interface Message {
  role: 'user' | 'assistant';
  content: ContentBlock[];
}

// 内容块类型
export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock | ImageBlock | ThinkingBlock;

// 文本块
export interface TextBlock {
  type: 'text';
  text: string;
}

// 思考块
export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
  signature?: string;
}

// 工具使用块
export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, any>;
}

// 工具结果块
export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: (TextBlock | ImageBlock)[] | string;
  is_error: boolean;
}

// 图像块
export interface ImageBlock {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/png';
    data: string;
  };
}

// 工具结果
export interface ToolResult {
  output?: string;
  error?: string;
  base64_image?: string;
  system?: string;
}

// Claude API 配置
export interface ClaudeConfig {
  apiKey: string;
  apiProvider: 'anthropic';
  modelVersion: string;
  maxOutputTokens: number;
  systemPrompt: string;
  onlyNMostRecentImages?: number;
  thinkingEnabled?: boolean;
  thinkingBudget?: number;
  tokenEfficientToolsBeta?: boolean;
  enableComputerTool?: boolean;
  enableBashTool?: boolean;
  enableEditTool?: boolean;
}

// 工具定义
export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

// 可用工具
export const AVAILABLE_TOOLS: Tool[] = [
  {
    name: 'computer',
    description: '控制计算机执行各种操作，如截图、点击等',
    input_schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['screenshot', 'click', 'type', 'press', 'scroll'],
        },
        x: { type: 'number' },
        y: { type: 'number' },
        text: { type: 'string' },
        key: { type: 'string' },
        direction: { type: 'string', enum: ['up', 'down'] },
        amount: { type: 'number' },
      },
      required: ['action'],
    },
  },
  {
    name: 'bash',
    description: '执行 Bash 命令',
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string' },
        restart: { type: 'boolean' },
      },
      required: ['command'],
    },
  },
  {
    name: 'edit',
    description: '编辑文件',
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          enum: ['view', 'create', 'str_replace', 'insert', 'undo'],
        },
        path: { type: 'string' },
        content: { type: 'string' },
        old_string: { type: 'string' },
        new_string: { type: 'string' },
        line_number: { type: 'number' },
        view_range: { type: 'string' },
      },
      required: ['command', 'path'],
    },
  },
];

// 系统提示
const DEFAULT_SYSTEM_PROMPT = `你是一个强大的 AI 助手，可以控制计算机执行各种任务。
你可以使用以下工具：
1. computer - 控制计算机执行各种操作，如截图、点击等
2. bash - 执行 Bash 命令
3. edit - 编辑文件

当用户请求你执行任务时，请使用适当的工具来完成任务。`;

// 调用 Claude API
export async function callClaudeAPI(
  messages: Message[],
  config: ClaudeConfig,
  onContentBlock: (block: ContentBlock) => void,
  onToolResult: (result: ToolResult, toolUseId: string) => void
): Promise<Message[]> {
  try {
    // 如果有 API 密钥，使用实际的 Claude API
    if (config.apiKey && config.apiProvider === 'anthropic') {
      const client = new ClaudeApiClient(config.apiKey);
      
      // 准备工具
      const tools: Tool[] = [];
      
      if (config.enableComputerTool) {
        tools.push(AVAILABLE_TOOLS.find(t => t.name === 'computer')!);
      }
      
      if (config.enableBashTool) {
        tools.push(AVAILABLE_TOOLS.find(t => t.name === 'bash')!);
      }
      
      if (config.enableEditTool) {
        tools.push(AVAILABLE_TOOLS.find(t => t.name === 'edit')!);
      }
      
      try {
        // 发送消息到 API 并处理工具调用
        return await client.handleToolCalls(
          messages,
          config.modelVersion,
          config.maxOutputTokens,
          config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
          tools,
          onContentBlock,
          onToolResult
        );
      } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
      }
    }
    
    // 如果没有 API 密钥或使用模拟模式，使用模拟响应
    return await simulateClaudeResponse(
      messages,
      config,
      onContentBlock,
      onToolResult
    );
  } catch (error) {
    console.error('调用 Claude API 失败:', error);
    throw error;
  }
}

// 模拟 Claude 响应
async function simulateClaudeResponse(
  messages: Message[],
  config: ClaudeConfig,
  onContentBlock: (block: ContentBlock) => void,
  onToolResult: (result: ToolResult, toolUseId: string) => void
): Promise<Message[]> {
  // 获取最后一条消息
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'user') {
    throw new Error('最后一条消息必须是用户消息');
  }
  
  // 模拟 AI 响应
  const responseContent: ContentBlock[] = [];
  
  // 解析用户消息中的关键词，决定使用哪个工具
  const userText = lastMessage.content
    .filter(block => block.type === 'text')
    .map(block => (block as TextBlock).text)
    .join(' ');
  
  if (userText.toLowerCase().includes('截图') || userText.toLowerCase().includes('屏幕')) {
    // 使用 computer 工具进行截图
    const toolUseId = generateId();
    const toolUseBlock: ToolUseBlock = {
      type: 'tool_use',
      id: toolUseId,
      name: 'computer',
      input: { action: 'screenshot' },
    };
    
    responseContent.push(toolUseBlock);
    onContentBlock(toolUseBlock);
    
    // 调用 Tauri 命令执行截图
    try {
      const result = await core.invoke<ToolResult>('take_screenshot');
      
      // 创建工具结果块
      const toolResultContent: (TextBlock | ImageBlock)[] = [];
      
      if (result.output) {
        toolResultContent.push({
          type: 'text',
          text: result.output,
        });
      }
      
      if (result.base64_image) {
        toolResultContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: result.base64_image,
          },
        });
      }
      
      const toolResultBlock: ToolResultBlock = {
        type: 'tool_result',
        tool_use_id: toolUseId,
        content: toolResultContent,
        is_error: !!result.error,
      };
      
      onToolResult(result, toolUseId);
      
      // 添加文本响应
      responseContent.push({
        type: 'text',
        text: '我已经截取了屏幕截图，您可以在上面看到结果。',
      });
      
      // 创建 AI 响应消息
      const responseMessage: Message = {
        role: 'assistant',
        content: responseContent,
      };
      
      // 创建工具结果消息
      const toolResultMessage: Message = {
        role: 'user',
        content: [toolResultBlock],
      };
      
      // 创建最终 AI 响应
      const finalResponseMessage: Message = {
        role: 'assistant',
        content: [{
          type: 'text',
          text: '我已经截取了屏幕截图，您可以在上面看到结果。请问还需要我做什么？',
        }],
      };
      
      // 返回更新后的消息列表
      return [...messages, responseMessage, toolResultMessage, finalResponseMessage];
    } catch (error) {
      const errorResult: ToolResult = {
        error: `截图失败: ${error}`,
      };
      
      onToolResult(errorResult, toolUseId);
      
      // 添加错误响应
      responseContent.push({
        type: 'text',
        text: `截图时出现错误: ${error}`,
      });
      
      // 创建 AI 响应消息
      const responseMessage: Message = {
        role: 'assistant',
        content: responseContent,
      };
      
      // 创建工具结果消息
      const toolResultMessage: Message = {
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUseId,
          content: `截图失败: ${error}`,
          is_error: true,
        }],
      };
      
      // 创建最终 AI 响应
      const finalResponseMessage: Message = {
        role: 'assistant',
        content: [{
          type: 'text',
          text: `截图时出现错误: ${error}。请问我可以帮您做些什么其他事情吗？`,
        }],
      };
      
      // 返回更新后的消息列表
      return [...messages, responseMessage, toolResultMessage, finalResponseMessage];
    }
  } else if (userText.toLowerCase().includes('bash') || userText.toLowerCase().includes('命令') || userText.toLowerCase().includes('执行')) {
    // 提取命令
    const commandMatch = userText.match(/执行[：:]\s*(.+)/) || userText.match(/运行[：:]\s*(.+)/);
    const command = commandMatch ? commandMatch[1].trim() : 'echo "Hello from Bash"';
    
    // 使用 bash 工具执行命令
    const toolUseId = generateId();
    const toolUseBlock: ToolUseBlock = {
      type: 'tool_use',
      id: toolUseId,
      name: 'bash',
      input: { command, restart: false },
    };
    
    responseContent.push(toolUseBlock);
    onContentBlock(toolUseBlock);
    
    // 调用 Tauri 命令执行 Bash 命令
    try {
      const result = await core.invoke<ToolResult>('execute_bash_command', {
        args: { command, restart: false }
      });
      
      // 创建工具结果块
      const toolResultContent: (TextBlock | ImageBlock)[] = [];
      
      if (result.output) {
        toolResultContent.push({
          type: 'text',
          text: result.output,
        });
      }
      
      const toolResultBlock: ToolResultBlock = {
        type: 'tool_result',
        tool_use_id: toolUseId,
        content: toolResultContent,
        is_error: !!result.error,
      };
      
      onToolResult(result, toolUseId);
      
      // 添加文本响应
      responseContent.push({
        type: 'text',
        text: `我已经执行了命令 \`${command}\`，您可以在上面看到结果。`,
      });
      
      // 创建 AI 响应消息
      const responseMessage: Message = {
        role: 'assistant',
        content: responseContent,
      };
      
      // 创建工具结果消息
      const toolResultMessage: Message = {
        role: 'user',
        content: [toolResultBlock],
      };
      
      // 创建最终 AI 响应
      const finalResponseMessage: Message = {
        role: 'assistant',
        content: [{
          type: 'text',
          text: `我已经执行了命令 \`${command}\`，您可以在上面看到结果。请问还需要我做什么？`,
        }],
      };
      
      // 返回更新后的消息列表
      return [...messages, responseMessage, toolResultMessage, finalResponseMessage];
    } catch (error) {
      const errorResult: ToolResult = {
        error: `命令执行失败: ${error}`,
      };
      
      onToolResult(errorResult, toolUseId);
      
      // 添加错误响应
      responseContent.push({
        type: 'text',
        text: `执行命令时出现错误: ${error}`,
      });
      
      // 创建 AI 响应消息
      const responseMessage: Message = {
        role: 'assistant',
        content: responseContent,
      };
      
      // 创建工具结果消息
      const toolResultMessage: Message = {
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUseId,
          content: `命令执行失败: ${error}`,
          is_error: true,
        }],
      };
      
      // 创建最终 AI 响应
      const finalResponseMessage: Message = {
        role: 'assistant',
        content: [{
          type: 'text',
          text: `执行命令时出现错误: ${error}。请问我可以帮您做些什么其他事情吗？`,
        }],
      };
      
      // 返回更新后的消息列表
      return [...messages, responseMessage, toolResultMessage, finalResponseMessage];
    }
  } else if (userText.toLowerCase().includes('文件') || userText.toLowerCase().includes('编辑')) {
    // 提取路径
    const pathMatch = userText.match(/文件[：:]\s*(.+)/) || userText.match(/路径[：:]\s*(.+)/);
    const path = pathMatch ? pathMatch[1].trim() : '/tmp/example.txt';
    
    // 使用 edit 工具查看文件
    const toolUseId = generateId();
    const toolUseBlock: ToolUseBlock = {
      type: 'tool_use',
      id: toolUseId,
      name: 'edit',
      input: { command: 'view', path },
    };
    
    responseContent.push(toolUseBlock);
    onContentBlock(toolUseBlock);
    
    // 调用 Tauri 命令执行文件编辑
    try {
      const result = await core.invoke<ToolResult>('execute_edit_command', {
        args: { 
          command: 'view',
          path,
        }
      });
      
      // 创建工具结果块
      const toolResultContent: (TextBlock | ImageBlock)[] = [];
      
      if (result.output) {
        toolResultContent.push({
          type: 'text',
          text: result.output,
        });
      }
      
      const toolResultBlock: ToolResultBlock = {
        type: 'tool_result',
        tool_use_id: toolUseId,
        content: toolResultContent,
        is_error: !!result.error,
      };
      
      onToolResult(result, toolUseId);
      
      // 添加文本响应
      responseContent.push({
        type: 'text',
        text: `我已经查看了文件 \`${path}\`，您可以在上面看到内容。`,
      });
      
      // 创建 AI 响应消息
      const responseMessage: Message = {
        role: 'assistant',
        content: responseContent,
      };
      
      // 创建工具结果消息
      const toolResultMessage: Message = {
        role: 'user',
        content: [toolResultBlock],
      };
      
      // 创建最终 AI 响应
      const finalResponseMessage: Message = {
        role: 'assistant',
        content: [{
          type: 'text',
          text: `我已经查看了文件 \`${path}\`，您可以在上面看到内容。请问还需要我做什么？`,
        }],
      };
      
      // 返回更新后的消息列表
      return [...messages, responseMessage, toolResultMessage, finalResponseMessage];
    } catch (error) {
      const errorResult: ToolResult = {
        error: `文件操作失败: ${error}`,
      };
      
      onToolResult(errorResult, toolUseId);
      
      // 添加错误响应
      responseContent.push({
        type: 'text',
        text: `查看文件时出现错误: ${error}`,
      });
      
      // 创建 AI 响应消息
      const responseMessage: Message = {
        role: 'assistant',
        content: responseContent,
      };
      
      // 创建工具结果消息
      const toolResultMessage: Message = {
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUseId,
          content: `文件操作失败: ${error}`,
          is_error: true,
        }],
      };
      
      // 创建最终 AI 响应
      const finalResponseMessage: Message = {
        role: 'assistant',
        content: [{
          type: 'text',
          text: `查看文件时出现错误: ${error}。请问我可以帮您做些什么其他事情吗？`,
        }],
      };
      
      // 返回更新后的消息列表
      return [...messages, responseMessage, toolResultMessage, finalResponseMessage];
    }
  } else {
    // 如果没有匹配到任何工具，返回一般性回复
    responseContent.push({
      type: 'text',
      text: `我收到了您的消息："${userText}"。我可以帮助您控制计算机、执行命令和编辑文件。请告诉我您需要什么帮助？`,
    });
    
    // 创建 AI 响应消息
    const responseMessage: Message = {
      role: 'assistant',
      content: responseContent,
    };
    
    // 返回更新后的消息列表
    return [...messages, responseMessage];
  }
}

// 生成唯一 ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// 将消息转换为 API 格式
export function convertMessagesToApiFormat(messages: Message[]): any {
  // 在实际实现中，这里会将消息转换为 Claude API 所需的格式
  return messages;
}

// 将 API 响应转换为消息格式
export function convertApiResponseToMessage(response: any): Message {
  // 在实际实现中，这里会将 API 响应转换为消息格式
  return response;
} 