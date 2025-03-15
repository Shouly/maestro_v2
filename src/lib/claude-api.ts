import { Anthropic } from '@anthropic-ai/sdk';
import { core } from '@tauri-apps/api';
import { ContentBlock, ImageBlock, Message, TextBlock, Tool, ToolResult, ToolResultBlock, ToolUseBlock } from './claude';
import { v4 as uuidv4 } from 'uuid';

// Claude API 客户端
export class ClaudeApiClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API 密钥不能为空。请在设置中配置有效的 API 密钥。');
    }
    
    this.client = new Anthropic({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  // 处理工具调用
  async handleToolCalls(
    messages: Message[],
    model: string,
    maxTokens: number,
    systemPrompt: string,
    tools: Tool[],
    onContentBlock?: (block: ContentBlock) => void,
    onToolResult?: (result: ToolResult, toolUseId: string) => void,
    options?: {
      thinkingEnabled?: boolean;
      thinkingBudget?: number;
      onlyNMostRecentImages?: number;
      tokenEfficientToolsBeta?: boolean;
      promptCaching?: boolean;
    }
  ): Promise<Message[]> {
    // 转换消息格式为Anthropic API兼容格式
    const anthropicMessages = this.convertToAnthropicMessages(messages);

    // 准备工具
    const anthropicTools = tools.length > 0 ? tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    })) : undefined;

    // 准备额外参数
    const extraParams: Record<string, any> = {};

    // 启用思考模式
    if (options?.thinkingEnabled && options?.thinkingBudget) {
      extraParams.thinking = {
        type: 'enabled',
        budget_tokens: options.thinkingBudget,
      };
    }

    // 处理图像截断
    if (options?.onlyNMostRecentImages) {
      this.filterRecentImages(messages, options.onlyNMostRecentImages);
    }

    // 处理提示缓存
    if (options?.promptCaching) {
      this.injectPromptCaching(messages);
    }

    try {
      // 打印请求参数，用于调试
      console.log('Claude API 请求参数:', {
        model,
        max_tokens: Math.min(maxTokens, 64000),
        system: systemPrompt,
        messages: anthropicMessages,
        tools: anthropicTools,
        extraParams
      });
      
      // 打印完整的提示词
      console.log('完整提示词:', JSON.stringify({
        model,
        max_tokens: Math.min(maxTokens, 64000),
        system: systemPrompt,
        messages: anthropicMessages,
        tools: anthropicTools,
        ...extraParams
      }, null, 2));
      
      // 调用Claude模型
      const response = await this.client.messages.create({
        model: model,
        max_tokens: Math.min(maxTokens, 64000),
        messages: anthropicMessages as any,
        system: systemPrompt,
        tools: anthropicTools as any,
        ...extraParams,
      });

      // 打印完整响应，用于调试
      console.log('Claude API 完整响应:', JSON.stringify(response, null, 2));

      // 处理响应
      const responseContentBlocks: ContentBlock[] = [];
      
      // 处理响应内容块
      if (!response.content || !Array.isArray(response.content)) {
        console.error('响应内容格式不正确:', response);
        // 创建一个默认的文本块
        const defaultTextBlock: TextBlock = { 
          type: 'text', 
          text: '响应格式错误，请重试。' 
        };
        responseContentBlocks.push(defaultTextBlock);
        
        if (onContentBlock) {
          onContentBlock(defaultTextBlock);
        }
      } else {
        // 处理每个内容块
        for (const block of response.content) {
          if (block.type === 'text') {
            // 处理文本块
            const textBlock: TextBlock = {
              type: 'text',
              text: block.text
            };
            
            responseContentBlocks.push(textBlock);
            
            // 回调文本块
            if (onContentBlock) {
              console.log('发送文本块，长度:', textBlock.text.length);
              onContentBlock(textBlock);
            }
          } else if (block.type === 'tool_use') {
            // 处理工具使用块
            console.log('处理工具使用块:', JSON.stringify(block, null, 2));
            const toolUseBlock: ToolUseBlock = {
              type: 'tool_use',
              id: block.id,
              name: block.name,
              input: block.input as Record<string, any>,
            };
            
            responseContentBlocks.push(toolUseBlock);
            
            // 回调内容块
            if (onContentBlock) {
              console.log('发送工具使用块');
              onContentBlock(toolUseBlock);
            }
          } else {
            // 处理其他类型的块（如果有）
            console.warn('未知的内容块类型:', (block as any).type);
          }
        }
      }

      // 创建响应消息
      const responseMessage: Message = {
        role: 'assistant',
        content: responseContentBlocks,
      };

      // 检查是否有工具调用
      const toolUseBlocks = responseContentBlocks.filter(
        (block): block is ToolUseBlock => block.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0) {
        // 没有工具调用，直接返回
        return [...messages, responseMessage];
      }

      // 处理工具调用
      const toolResultContent: ToolResultBlock[] = [];

      for (const toolUseBlock of toolUseBlocks) {
        const { id: toolUseId, name: toolName, input: toolInput } = toolUseBlock;

        try {
          let result: ToolResult;

          // 根据工具类型执行不同的操作
          switch (toolName) {
            case 'computer':
              // 获取屏幕尺寸
              let width = window.screen.width || 1280;
              let height = window.screen.height || 720;
              
              try {
                const screenSize = await core.invoke<[number, number]>('get_screen_size');
                if (screenSize) {
                  width = screenSize[0];
                  height = screenSize[1];
                }
              } catch (e) {
                console.warn('Failed to get screen size from Tauri:', e);
              }
              
              // 转换参数格式
              const transformedInput = { ...toolInput };
              
              // 将coordinate数组转换为(x, y)坐标
              if (Array.isArray(transformedInput.coordinate) && transformedInput.coordinate.length === 2) {
                transformedInput.coordinate = [
                  transformedInput.coordinate[0], 
                  transformedInput.coordinate[1]
                ];
              }
              
              // 将action名称转换为后端期望的格式
              if (transformedInput.action === 'click') {
                transformedInput.action = 'left_click';
              } else if (transformedInput.action === 'press') {
                transformedInput.action = 'key';
              }
              
              console.log('执行计算机操作:', JSON.stringify(transformedInput, null, 2));
              
              // 执行计算机操作
              result = await core.invoke<ToolResult>('execute_computer_command', {
                args: { 
                  ...transformedInput,
                  width,
                  height
                }
              });
              break;

            case 'bash':
              // 执行 Bash 命令
              console.log('执行Bash命令:', JSON.stringify(toolInput, null, 2));
              try {
                // 添加超时处理
                const bashPromise = core.invoke<ToolResult>('execute_bash_command', {
                  args: { ...toolInput }
                });
                
                // 设置超时
                const timeoutPromise = new Promise<ToolResult>((_, reject) => {
                  setTimeout(() => {
                    reject(new Error('前端超时：Bash 命令执行时间过长'));
                  }, 40000); // 40秒超时
                });
                
                // 使用 Promise.race 实现超时
                result = await Promise.race([bashPromise, timeoutPromise]);
                
                console.log('Bash命令执行结果:', JSON.stringify(result, null, 2));
                
                // 检查是否需要重启会话
                if (result.system && result.system.includes('重启')) {
                  console.log('Bash会话需要重启，自动重启中...');
                  try {
                    // 尝试重启会话
                    await core.invoke<ToolResult>('execute_bash_command', {
                      args: { restart: true }
                    });
                    console.log('Bash会话已重启');
                  } catch (restartError) {
                    console.error('重启Bash会话失败:', restartError);
                  }
                }
              } catch (error) {
                console.error('Bash命令执行失败:', error);
                
                // 创建错误结果
                result = {
                  error: `执行Bash命令失败: ${error}`,
                  system: '请尝试使用 restart: true 重启 Bash 会话，或者使用更简单的命令'
                };
                
                // 尝试重启会话
                try {
                  console.log('尝试自动重启Bash会话...');
                  await core.invoke<ToolResult>('execute_bash_command', {
                    args: { restart: true }
                  });
                  console.log('Bash会话已重启');
                } catch (restartError) {
                  console.error('重启Bash会话失败:', restartError);
                }
              }
              break;

            case 'edit':
              // 转换参数格式
              const transformedEditInput = { ...toolInput };
              
              // 将命令名称转换为后端期望的格式
              if (transformedEditInput.command === 'undo_edit') {
                transformedEditInput.command = 'undo_edit';
              }
              
              // 将参数名称转换为后端期望的格式
              if (transformedEditInput.file_text !== undefined) {
                transformedEditInput.file_text = transformedEditInput.file_text;
              }
              
              if (transformedEditInput.old_str !== undefined) {
                transformedEditInput.old_str = transformedEditInput.old_str;
              }
              
              if (transformedEditInput.new_str !== undefined) {
                transformedEditInput.new_str = transformedEditInput.new_str;
              }
              
              if (transformedEditInput.insert_line !== undefined) {
                transformedEditInput.insert_line = transformedEditInput.insert_line;
              }
              
              console.log('执行编辑操作:', JSON.stringify(transformedEditInput, null, 2));
              
              // 执行文件编辑
              result = await core.invoke<ToolResult>('execute_edit_command', {
                args: { ...transformedEditInput }
              });
              break;

            default:
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

      // 递归处理可能的后续工具调用
      return this.handleToolCalls(
        [...messages, responseMessage, toolResultMessage],
        model,
        maxTokens,
        systemPrompt,
        tools,
        onContentBlock,
        onToolResult,
        options
      );
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }

  // 转换为Anthropic消息格式
  private convertToAnthropicMessages(messages: Message[]) {
    // 打印转换前的消息
    console.log('转换前的消息:', JSON.stringify(messages, null, 2));
    
    const convertedMessages = messages.map(message => {
      // 转换消息内容
      const content = message.content.map(block => {
        if (block.type === 'text') {
          return { type: 'text', text: (block as TextBlock).text };
        } else if (block.type === 'tool_result') {
          const toolResultBlock = block as ToolResultBlock;
          let content;

          if (typeof toolResultBlock.content === 'string') {
            content = [{ type: 'text', text: toolResultBlock.content }];
          } else {
            content = toolResultBlock.content.map(item => {
              if (item.type === 'text') {
                return { type: 'text', text: item.text };
              } else if (item.type === 'image') {
                return {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: item.source.data,
                  },
                };
              }
              return item;
            });
          }

          return {
            type: 'tool_result',
            tool_use_id: toolResultBlock.tool_use_id,
            content,
            is_error: toolResultBlock.is_error,
          };
        }

        return block;
      });

      return {
        role: message.role,
        content,
      };
    });
    
    // 打印转换后的消息
    console.log('转换后的消息:', JSON.stringify(convertedMessages, null, 2));
    
    return convertedMessages;
  }

  // 创建工具结果块
  private makeToolResultBlock(result: ToolResult, toolUseId: string): ToolResultBlock {
    console.log('创建工具结果块:', JSON.stringify(result, null, 2));
    
    const content: (TextBlock | ImageBlock)[] = [];

    if (result.output) {
      content.push({
        type: 'text',
        text: this.maybePrependSystemToolResult(result, result.output),
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

    // 如果没有输出和图像，但有错误，使用错误作为内容
    if (content.length === 0 && result.error) {
      return {
        type: 'tool_result',
        tool_use_id: toolUseId,
        content: this.maybePrependSystemToolResult(result, result.error),
        is_error: true,
      };
    }
    
    // 如果没有任何内容，添加一个空文本块
    if (content.length === 0) {
      content.push({
        type: 'text',
        text: this.maybePrependSystemToolResult(result, '命令执行完成，但没有输出'),
      });
    }

    return {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content: result.error
        ? this.maybePrependSystemToolResult(result, result.error)
        : content,
      is_error: !!result.error,
    };
  }

  // 可能添加系统信息到工具结果
  private maybePrependSystemToolResult(result: ToolResult, resultText: string): string {
    if (result.system) {
      return `<system>${result.system}</system>\n${resultText}`;
    }
    return resultText;
  }

  // 注入提示缓存控制
  private injectPromptCaching(messages: Message[]): void {
    // 为最近3个回合设置缓存断点
    let breakpointsRemaining = 3;

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === 'user' && Array.isArray(message.content) && message.content.length > 0) {
        if (breakpointsRemaining > 0) {
          breakpointsRemaining--;
          // 添加缓存控制
          const lastContent = message.content[message.content.length - 1];
          (lastContent as any).cache_control = { type: 'ephemeral' };
        } else {
          // 移除缓存控制
          const lastContent = message.content[message.content.length - 1];
          if ((lastContent as any).cache_control) {
            delete (lastContent as any).cache_control;
          }
          // 只处理一个额外的回合
          break;
        }
      }
    }
  }

  // 过滤保留最近的图像
  private filterRecentImages(messages: Message[], imagesToKeep: number): void {
    if (!imagesToKeep) return;

    // 收集所有工具结果块
    const toolResultBlocks: ToolResultBlock[] = [];
    for (const message of messages) {
      if (Array.isArray(message.content)) {
        for (const item of message.content) {
          if (item.type === 'tool_result') {
            toolResultBlocks.push(item as ToolResultBlock);
          }
        }
      }
    }

    // 计算图像总数
    let totalImages = 0;
    for (const toolResult of toolResultBlocks) {
      if (Array.isArray(toolResult.content)) {
        for (const content of toolResult.content) {
          if (content.type === 'image') {
            totalImages++;
          }
        }
      }
    }

    // 计算要移除的图像数量
    let imagesToRemove = Math.max(0, totalImages - imagesToKeep);

    // 移除旧图像
    for (const toolResult of toolResultBlocks) {
      if (Array.isArray(toolResult.content) && imagesToRemove > 0) {
        const newContent: (TextBlock | ImageBlock)[] = [];

        for (const content of toolResult.content) {
          if (content.type === 'image' && imagesToRemove > 0) {
            imagesToRemove--;
            continue;
          }
          newContent.push(content);
        }

        toolResult.content = newContent;
      }
    }
  }
} 