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

    // 暂时禁用思考模式，因为我们还没有正确实现 thinking 块的处理
    /* 
    if (options?.thinkingEnabled && options?.thinkingBudget) {
      extraParams.thinking = {
        type: 'enabled',
        budget_tokens: options.thinkingBudget,
      };
    }
    */

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
      
      // 使用流式响应
      const stream = await this.client.messages.stream({
        model: model,
        max_tokens: Math.min(maxTokens, 64000),
        messages: anthropicMessages as any,
        system: systemPrompt,
        tools: anthropicTools as any,
        ...extraParams,
      });

      // 处理响应
      const responseContentBlocks: ContentBlock[] = [];
      let lastCallbackTime = 0;
      let accumulatedText = '';
      const MIN_CALLBACK_INTERVAL = 100; // 最小回调间隔（毫秒）
      const MIN_TEXT_LENGTH_FOR_CALLBACK = 10; // 累积多少字符才触发回调
      
      // 创建初始文本块并发送一次回调，确保UI创建一个消息块
      const initialTextBlock: TextBlock = { type: 'text', text: '' };
      responseContentBlocks.push(initialTextBlock);
      
      // 发送初始回调，确保UI创建一个消息块
      if (onContentBlock) {
        onContentBlock({ ...initialTextBlock });
        lastCallbackTime = Date.now();
      }
      
      // 收集完整响应
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const delta = chunk.delta;
          
          // 处理文本块
          if (delta.type === 'text_delta') {
            // 查找或创建文本块 - 应该始终使用第一个文本块
            let textBlock = responseContentBlocks.find(
              block => block.type === 'text'
            ) as TextBlock | undefined;
            
            // 这里应该不需要创建新的文本块，因为我们已经在流式处理开始时创建了一个
            if (!textBlock) {
              console.error('未找到文本块，这不应该发生');
              textBlock = initialTextBlock;
            }
            
            // 更新文本内容
            textBlock.text += delta.text;
            accumulatedText += delta.text;
            
            // 控制回调频率，避免过于频繁的更新
            const now = Date.now();
            if (onContentBlock && 
                (now - lastCallbackTime > MIN_CALLBACK_INTERVAL && accumulatedText.length >= MIN_TEXT_LENGTH_FOR_CALLBACK || 
                 delta.text.includes('\n'))) { // 遇到换行符时触发回调
              console.log('发送文本块更新，长度:', textBlock.text.length);
              onContentBlock({ ...textBlock });
              lastCallbackTime = now;
              accumulatedText = '';
            }
          }
        } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
          // 处理工具使用块
          const toolUseData = chunk.content_block;
          const toolUseBlock: ToolUseBlock = {
            type: 'tool_use',
            id: toolUseData.id,
            name: toolUseData.name,
            input: toolUseData.input as Record<string, any>,
          };
          
          responseContentBlocks.push(toolUseBlock);
          
          // 回调内容块
          if (onContentBlock) {
            onContentBlock(toolUseBlock);
          }
        }
      }

      // 确保最后一次回调，处理所有剩余文本
      if (accumulatedText.length > 0 && onContentBlock) {
        const textBlock = responseContentBlocks.find(
          block => block.type === 'text'
        ) as TextBlock | undefined;
        
        if (textBlock) {
          console.log('发送最终文本块更新，长度:', textBlock.text.length);
          onContentBlock({ ...textBlock });
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
              
              // 执行计算机操作
              result = await core.invoke<ToolResult>('execute_computer_command', {
                args: { 
                  ...toolInput,
                  width,
                  height
                }
              });
              break;

            case 'bash':
              // 执行 Bash 命令
              result = await core.invoke<ToolResult>('execute_bash_command', {
                args: { ...toolInput }
              });
              break;

            case 'edit':
              // 执行文件编辑
              result = await core.invoke<ToolResult>('execute_edit_command', {
                args: { ...toolInput }
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