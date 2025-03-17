import { core } from '@tauri-apps/api';
import { ClaudeApiClient } from './claude-api';

// 工具版本类型
export type ToolVersion = 'computer_use_20250124' | 'computer_use_20241022';
export type BetaFlag = 'computer-use-2024-10-22' | 'computer-use-2025-01-24';

// 计算机工具选项接口
export interface ComputerToolOptions {
  display_width_px: number;
  display_height_px: number;
  display_number?: number;
}

// 工具组定义
export interface ToolGroup {
  version: ToolVersion;
  tools: string[];
  betaFlag: BetaFlag | null;
}

// 工具组映射
export const TOOL_GROUPS: ToolGroup[] = [
  {
    version: 'computer_use_20241022',
    tools: ['computer', 'bash', 'edit'],
    betaFlag: 'computer-use-2024-10-22',
  },
  {
    version: 'computer_use_20250124',
    tools: ['computer', 'bash', 'edit'],
    betaFlag: 'computer-use-2025-01-24',
  },
];

// 按版本映射工具组
export const TOOL_GROUPS_BY_VERSION: Record<ToolVersion, ToolGroup> = 
  TOOL_GROUPS.reduce((acc, group) => ({...acc, [group.version]: group}), {} as Record<ToolVersion, ToolGroup>);

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
  cache_control?: { type: 'ephemeral' };
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

// Claude配置接口
export interface ClaudeConfig {
  apiKey: string;
  apiProvider: 'anthropic' | 'mock';
  model: string;
  modelVersion: string;
  maxTokens: number;
  systemPrompt: string;
  enableComputerTool: boolean;
  enableBashTool: boolean;
  enableEditTool: boolean;
  thinkingEnabled: boolean;
  thinkingBudget: number;
  onlyNMostRecentImages?: number;
  tokenEfficientToolsBeta: boolean;
  toolVersion: ToolVersion;
  promptCaching?: boolean;
  computerToolOptions?: ComputerToolOptions;
}

// 工具定义
export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
  options?: ComputerToolOptions;
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
          enum: [
            'screenshot', 
            'mouse_move', 
            'left_click', 
            'right_click', 
            'middle_click', 
            'double_click', 
            'triple_click', 
            'type', 
            'key', 
            'cursor_position', 
            'left_mouse_down', 
            'left_mouse_up', 
            'scroll', 
            'hold_key', 
            'wait'
          ],
        },
        coordinate: { 
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2
        },
        text: { type: 'string' },
        key: { type: 'string' },
        scroll_direction: { type: 'string', enum: ['up', 'down', 'left', 'right'] },
        scroll_amount: { type: 'number' },
        duration: { type: 'number' },
      },
      required: ['action'],
      additionalProperties: false,
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
      additionalProperties: false,
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
          enum: ['view', 'create', 'str_replace', 'insert', 'undo_edit'],
        },
        path: { type: 'string' },
        file_text: { type: 'string' },
        view_range: { 
          type: 'array',
          items: { type: 'number' },
          minItems: 2,
          maxItems: 2
        },
        old_str: { type: 'string' },
        new_str: { type: 'string' },
        insert_line: { type: 'number' },
      },
      required: ['command', 'path'],
      additionalProperties: false,
    },
  },
];

// 计算机工具
export const COMPUTER_TOOL = AVAILABLE_TOOLS.find(t => t.name === 'computer')!;
// Bash工具
export const BASH_TOOL = AVAILABLE_TOOLS.find(t => t.name === 'bash')!;
// 编辑工具
export const EDIT_TOOL = AVAILABLE_TOOLS.find(t => t.name === 'edit')!;

// 获取系统架构
function getSystemArchitecture(): string {
  // 在实际环境中，这应该从系统获取
  // 这里简单返回一个值
  return navigator.platform || 'x86_64';
}

// 系统提示
const DEFAULT_SYSTEM_PROMPT = `<SYSTEM_CAPABILITY>
* You are utilising an ${navigator.platform.includes('Mac') ? 'macOS' : navigator.platform.includes('Win') ? 'Windows' : 'Linux'} system using ${getSystemArchitecture()} architecture with internet access.
* You can feel free to install applications with your bash tool. Use curl instead of wget.
* To open a browser, please just click on the browser icon or use the bash tool to launch it.
* Using bash tool you can start GUI applications, but they may take some time to appear. Take a screenshot to confirm it did.
* When using your bash tool with commands that are expected to output very large quantities of text, redirect into a tmp file and use str_replace_editor or \`grep -n -B <lines before> -A <lines after> <query> <filename>\` to confirm output.
* When viewing a page it can be helpful to zoom out so that you can see everything on the page. Either that, or make sure you scroll down to see everything before deciding something isn't available.
* When using your computer function calls, they take a while to run and send back to you. Where possible/feasible, try to chain multiple of these calls all into one function calls request.
* The current date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
</SYSTEM_CAPABILITY>

<IMPORTANT>
* When using a browser, if a startup wizard appears, IGNORE IT. Do not even click "skip this step". Instead, click on the address bar where it says "Search or enter address", and enter the appropriate search term or URL there.
* If the item you are looking at is a pdf, if after taking a single screenshot of the pdf it seems that you want to read the entire document instead of trying to continue to read the pdf from your screenshots + navigation, determine the URL, use curl to download the pdf, install and use pdftotext to convert it to a text file, and then read that text file directly with your edit tool.
</IMPORTANT>`;

// 调用 Claude API
export async function callClaudeAPI(
  messages: Message[],
  config: ClaudeConfig,
  onContentBlock?: (block: ContentBlock) => void,
  onToolResult?: (result: ToolResult, toolUseId: string) => void
): Promise<Message[]> {
  // 获取工具组
  const toolGroup = TOOL_GROUPS_BY_VERSION[config.toolVersion];
  
  // 准备工具
  const tools: Tool[] = [];
  
  // 添加计算机工具
  if (config.enableComputerTool && toolGroup.tools.includes('computer')) {
    const computerTool = { ...COMPUTER_TOOL };
    
    // 如果有计算机工具选项，添加到工具中
    if (config.computerToolOptions) {
      computerTool.options = config.computerToolOptions;
    }
    
    tools.push(computerTool);
  }
  
  // 添加Bash工具
  if (config.enableBashTool && toolGroup.tools.includes('bash')) {
    tools.push(BASH_TOOL);
  }
  
  // 添加编辑工具
  if (config.enableEditTool && toolGroup.tools.includes('edit')) {
    tools.push(EDIT_TOOL);
  }
  
  // 创建API客户端
  const client = new ClaudeApiClient(config.apiKey);
  
  // 准备选项
  const options = {
    thinkingEnabled: config.thinkingEnabled,
    thinkingBudget: config.thinkingBudget,
    onlyNMostRecentImages: config.onlyNMostRecentImages,
    tokenEfficientToolsBeta: config.tokenEfficientToolsBeta,
    promptCaching: false // 不再需要，我们已经默认为所有消息添加缓存控制
  };
  
  // 打印配置和工具信息，用于调试
  console.log('Claude 配置信息:', {
    model: config.model,
    maxTokens: config.maxTokens,
    toolVersion: config.toolVersion,
    toolsCount: tools.length,
    options
  });
  
  // 调用API
  return client.handleToolCalls(
    messages,
    config.model,
    config.maxTokens,
    config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    tools,
    onContentBlock,
    onToolResult,
    options
  );
}