import { Message, ContentBlock, TextBlock, ToolUseBlock, ToolResultBlock, ImageBlock, Tool, ToolResult } from './claude';
import { core } from '@tauri-apps/api';

// Anthropic API 响应类型
interface AnthropicResponse {
  id: string;
  type: string;
  role: 'user' | 'assistant';
  content: ContentBlock[];
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Anthropic API 请求类型
interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: Message[];
  system?: string;
  tools?: Tool[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
}

// Claude API 客户端
export class ClaudeApiClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  // 发送消息到 Anthropic API
  async sendMessage(
    messages: Message[],
    model: string,
    maxTokens: number,
    systemPrompt?: string,
    tools?: Tool[],
  ): Promise<Message> {
    try {
      const request: AnthropicRequest = {
        model,
        max_tokens: maxTokens,
        messages,
        tools,
      };
      
      if (systemPrompt) {
        request.system = systemPrompt;
      }
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data: AnthropicResponse = await response.json();
      
      return {
        role: data.role as 'user' | 'assistant',
        content: data.content,
      };
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }
  
  // 处理工具调用
  async handleToolCalls(
    messages: Message[],
    model: string,
    maxTokens: number,
    systemPrompt?: string,
    tools?: Tool[],
    onContentBlock?: (block: ContentBlock) => void,
    onToolResult?: (result: ToolResult, toolUseId: string) => void,
  ): Promise<Message[]> {
    // 发送消息到 API
    const response = await this.sendMessage(
      messages,
      model,
      maxTokens,
      systemPrompt,
      tools,
    );
    
    // 处理内容块
    if (onContentBlock) {
      for (const block of response.content) {
        onContentBlock(block);
      }
    }
    
    // 检查是否有工具调用
    const toolUseBlocks = response.content.filter(
      (block): block is ToolUseBlock => block.type === 'tool_use'
    );
    
    if (toolUseBlocks.length === 0) {
      // 没有工具调用，直接返回
      return [...messages, response];
    }
    
    // 处理工具调用
    const toolResultContent: ToolResultBlock[] = [];
    
    for (const toolUseBlock of toolUseBlocks) {
      const { id: toolUseId, name: toolName, input: toolInput } = toolUseBlock;
      
      try {
        let result: ToolResult;
        
        // 根据工具类型执行不同的操作
        if (toolName === 'computer') {
          // 执行计算机操作
          const action = toolInput.action;
          
          if (action === 'screenshot') {
            // 截图
            result = await core.invoke<ToolResult>('take_screenshot');
          } else {
            // 其他计算机操作
            result = {
              error: `不支持的计算机操作: ${action}`,
            };
          }
        } else if (toolName === 'bash') {
          // 执行 Bash 命令
          const command = toolInput.command;
          const restart = toolInput.restart || false;
          
          result = await core.invoke<ToolResult>('execute_bash_command', {
            args: { command, restart }
          });
        } else if (toolName === 'edit') {
          // 执行文件编辑
          const command = toolInput.command;
          const path = toolInput.path;
          
          result = await core.invoke<ToolResult>('execute_edit_command', {
            args: { 
              command,
              path,
              ...toolInput
            }
          });
        } else {
          // 不支持的工具
          result = {
            error: `不支持的工具: ${toolName}`,
          };
        }
        
        // 回调工具结果
        if (onToolResult) {
          onToolResult(result, toolUseId);
        }
        
        // 创建工具结果块
        const toolResultBlock = this.makeToolResultBlock(result, toolUseId);
        toolResultContent.push(toolResultBlock);
      } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        
        // 创建错误结果
        const errorResult: ToolResult = {
          error: `执行工具时出错: ${error}`,
        };
        
        // 回调工具结果
        if (onToolResult) {
          onToolResult(errorResult, toolUseId);
        }
        
        // 创建工具结果块
        const toolResultBlock = this.makeToolResultBlock(errorResult, toolUseId);
        toolResultContent.push(toolResultBlock);
      }
    }
    
    // 添加工具结果到消息
    const toolResultMessage: Message = {
      role: 'user',
      content: toolResultContent,
    };
    
    // 递归处理工具调用
    return this.handleToolCalls(
      [...messages, response, toolResultMessage],
      model,
      maxTokens,
      systemPrompt,
      tools,
      onContentBlock,
      onToolResult,
    );
  }
  
  // 创建工具结果块
  private makeToolResultBlock(result: ToolResult, toolUseId: string): ToolResultBlock {
    const content: (TextBlock | ImageBlock)[] = [];
    
    if (result.output) {
      content.push({
        type: 'text',
        text: result.output,
      });
    }
    
    if (result.base64_image) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: result.base64_image,
        },
      });
    }
    
    return {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content: content.length > 0 ? content : result.error || '操作成功，但没有返回结果',
      is_error: !!result.error,
    };
  }
} 