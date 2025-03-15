import { core } from '@tauri-apps/api';
import { ClaudeApiClient } from './claude-api';

// 工具版本类型
export type ToolVersion = 'computer_use_20250124' | 'computer_use_20241022';
export type BetaFlag = 'computer-use-2024-10-22' | 'computer-use-2025-01-24';

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
    tools.push(COMPUTER_TOOL);
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
    thinkingEnabled: false,
    thinkingBudget: config.thinkingBudget,
    onlyNMostRecentImages: config.onlyNMostRecentImages,
    tokenEfficientToolsBeta: config.tokenEfficientToolsBeta,
    promptCaching: config.promptCaching || false
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