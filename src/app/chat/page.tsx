"use client";

import { Button } from '@/components/ui/Button';
import { ChatInput } from '@/components/ui/ChatInput';
import { ChatMessage, MessageRole } from '@/components/ui/ChatMessage';
import { ChatSession, ChatSessionList } from '@/components/ui/ChatSessionList';
import { MainNavigation } from '@/components/ui/MainNavigation';
import { MobileNavigation } from '@/components/ui/MobileNavigation';
import { SettingsData, SettingsPanel } from '@/components/ui/SettingsPanel';
import { ToolOutput } from '@/components/ui/ToolOutput';
import { Menu, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { core, event } from '@tauri-apps/api';
const { invoke } = core;
const { listen } = event;

import { 
  callClaudeAPI, 
  ContentBlock, 
  Message as ClaudeMessage, 
  TextBlock, 
  ToolResult, 
  ToolUseBlock 
} from '@/lib/claude';

// 消息类型
interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// 工具输出类型
interface Tool {
  id: string;
  type: 'command' | 'screenshot' | 'code' | 'file' | 'success' | 'error' | 'info';
  title: string;
  content: string;
  imageData?: string; // Base64 编码的图像数据
  timestamp: Date;
}

// 工具结果类型
interface ToolResultType {
  output?: string;
  error?: string;
  base64_image?: string;
  system?: string;
}

export default function ChatPage() {
  // 状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [claudeMessages, setClaudeMessages] = useState<ClaudeMessage[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<SettingsData>({
    // API配置
    apiProvider: 'anthropic',
    apiKey: '',
    modelVersion: 'claude-3-7-sonnet-20250219',
    
    // 工具配置
    toolVersion: 'computer_use_20250124',
    enableComputerTool: true,
    enableBashTool: true,
    enableEditTool: true,
    
    // 输出配置
    maxOutputTokens: 128000,
    defaultOutputTokens: 16384,
    thinkingEnabled: true,
    thinkingBudget: 8192,
    
    // 图像和显示配置
    onlyNMostRecentImages: 3,
    hideScreenshots: false,
    tokenEfficientToolsBeta: false,
    
    // 系统提示配置
    customSystemPrompt: '',
    
    // 界面设置
    theme: 'system',
  });

  // 初始化
  useEffect(() => {
    // 从本地存储加载会话和设置
    const loadSavedData = async () => {
      try {
        // 这里应该从本地存储加载会话和设置
        // 示例数据
        const demoSessions: ChatSession[] = [
          {
            id: '1',
            title: '新会话',
            lastMessage: '欢迎使用 Maestro',
            timestamp: new Date(),
            isActive: true,
          }
        ];
    
        setSessions(demoSessions);
        setCurrentSessionId('1');
    
        // 添加欢迎消息
        const welcomeMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: '你好！我是 Maestro，你的 AI 助手。我可以帮助你控制计算机、执行命令和编辑文件。请告诉我你需要什么帮助？',
          timestamp: new Date(),
        };
        
        setMessages([welcomeMessage]);
        
        // 初始化 Claude 消息
        const welcomeClaudeMessage: ClaudeMessage = {
          role: 'assistant',
          content: [{
            type: 'text',
            text: '你好！我是 Maestro，你的 AI 助手。我可以帮助你控制计算机、执行命令和编辑文件。请告诉我你需要什么帮助？'
          }]
        };
        
        setClaudeMessages([welcomeClaudeMessage]);

        // 获取计算机工具配置
        try {
          const options = await invoke('get_computer_options');
          console.log('Computer tool options:', options);
        } catch (error) {
          console.error('Failed to get computer options:', error);
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    };

    loadSavedData();

    // 设置事件监听器
    const unlistenFns: (() => void)[] = [];

    const setupListeners = async () => {
      // 监听工具执行结果
      const unlisten = await listen('tool_result', (event) => {
        console.log('Tool result:', event);
        // 处理工具执行结果
      });
      unlistenFns.push(unlisten);
    };

    setupListeners();

    // 清理函数
    return () => {
      unlistenFns.forEach(fn => fn());
    };
  }, []);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tools]);

  // 处理内容块
  const handleContentBlock = (block: ContentBlock) => {
    if (block.type === 'text') {
      // 文本块不需要特殊处理，会在最终响应中显示
    } else if (block.type === 'tool_use') {
      // 工具使用块，添加到工具输出
      const toolUseBlock = block as ToolUseBlock;
      
      let title = '使用工具';
      let content = JSON.stringify(toolUseBlock.input, null, 2);
      let type: 'command' | 'screenshot' | 'code' | 'file' | 'info' = 'info';
      
      if (toolUseBlock.name === 'computer') {
        title = '计算机操作';
        type = 'screenshot';
      } else if (toolUseBlock.name === 'bash') {
        title = '执行命令';
        type = 'command';
        content = toolUseBlock.input.command;
      } else if (toolUseBlock.name === 'edit') {
        title = '文件操作';
        type = 'file';
        content = `${toolUseBlock.input.command} ${toolUseBlock.input.path}`;
      }
      
      const toolOutput: Tool = {
        id: toolUseBlock.id,
        type,
        title,
        content,
        timestamp: new Date(),
      };
      
      setTools(prev => [...prev, toolOutput]);
    }
  };

  // 处理工具结果
  const handleToolResult = (result: ToolResult, toolUseId: string) => {
    let type: 'success' | 'error' | 'code' | 'screenshot' = 'success';
    let title = '工具结果';
    let content = result.output || '';
    
    if (result.error) {
      type = 'error';
      title = '错误';
      content = result.error;
    } else if (result.base64_image) {
      type = 'screenshot';
      title = '屏幕截图';
    }
    
    const toolOutput: Tool = {
      id: uuidv4(),
      type,
      title,
      content,
      imageData: result.base64_image,
      timestamp: new Date(),
    };
    
    setTools(prev => [...prev, toolOutput]);
  };

  // 发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // 添加 Claude 用户消息
    const userClaudeMessage: ClaudeMessage = {
      role: 'user',
      content: [{
        type: 'text',
        text: content
      }]
    };
    
    setClaudeMessages(prev => [...prev, userClaudeMessage]);
    setIsLoading(true);

    try {
      // 更新会话最后一条消息
      if (currentSessionId) {
        setSessions(prev => 
          prev.map(session => 
            session.id === currentSessionId 
              ? { ...session, lastMessage: content, timestamp: new Date() } 
              : session
          )
        );
      }

      // 调用 Claude API
      const updatedMessages = await callClaudeAPI(
        claudeMessages,
        {
          apiKey: settings.apiKey,
          apiProvider: 'anthropic',
          modelVersion: settings.modelVersion,
          maxOutputTokens: settings.maxOutputTokens,
          systemPrompt: settings.customSystemPrompt,
          onlyNMostRecentImages: settings.onlyNMostRecentImages,
          thinkingEnabled: settings.thinkingEnabled,
          thinkingBudget: settings.thinkingBudget,
          tokenEfficientToolsBeta: settings.tokenEfficientToolsBeta,
          enableComputerTool: settings.enableComputerTool,
          enableBashTool: settings.enableBashTool,
          enableEditTool: settings.enableEditTool,
        },
        handleContentBlock,
        handleToolResult
      );
      
      setClaudeMessages(updatedMessages);
      
      // 提取最后一条 AI 消息
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage.role === 'assistant') {
        // 提取文本内容
        const textContent = lastMessage.content
          .filter(block => block.type === 'text')
          .map(block => (block as TextBlock).text)
          .join('\n\n');
        
        // 添加 AI 响应
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: textContent,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `处理消息时出错: ${error}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // 创建新会话
  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `新会话 ${sessions.length + 1}`,
      lastMessage: '新建会话',
      timestamp: new Date(),
      isActive: true,
    };

    setSessions(prev => prev.map(s => ({ ...s, isActive: false })).concat(newSession));
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setTools([]);
    setClaudeMessages([]);
  };

  // 选择会话
  const handleSelectSession = (sessionId: string) => {
    if (sessionId === currentSessionId) return;

    // 这里应该保存当前会话的消息和工具输出
    // 然后加载选定会话的消息和工具输出

    setSessions(prev => 
      prev.map(session => ({
        ...session,
        isActive: session.id === sessionId,
      }))
    );
    
    setCurrentSessionId(sessionId);
    
    // 模拟加载会话数据
    setMessages([
      {
        id: uuidv4(),
        role: 'assistant',
        content: '已加载会话。我可以继续帮助你吗？',
        timestamp: new Date(),
      }
    ]);
    
    setClaudeMessages([
      {
        role: 'assistant',
        content: [{
          type: 'text',
          text: '已加载会话。我可以继续帮助你吗？'
        }]
      }
    ]);
    
    setTools([]);
  };

  // 删除会话
  const handleDeleteSession = (sessionId: string) => {
    // 如果删除当前会话，选择另一个会话
    if (sessionId === currentSessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
        setSessions(prev => 
          prev
            .filter(s => s.id !== sessionId)
            .map((s, i) => i === 0 ? { ...s, isActive: true } : s)
        );
      } else {
        // 如果没有剩余会话，创建一个新会话
        handleCreateSession();
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } else {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  // 重命名会话
  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle } 
          : session
      )
    );
  };

  // 导出会话
  const handleExportSession = (sessionId: string) => {
    // 导出会话数据
    const sessionToExport = sessions.find(s => s.id === sessionId);
    if (!sessionToExport) return;
    
    // 这里应该实现导出逻辑
    console.log('Exporting session:', sessionToExport);
  };

  // 保存设置
  const handleSaveSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
    setSettingsOpen(false);
    
    // 这里应该保存设置到本地存储
    console.log('Saving settings:', newSettings);
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-[hsl(var(--background))]">
      {/* 侧边栏 */}
      <div className={`fixed inset-0 z-40 lg:relative lg:z-0 lg:w-80 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[hsl(var(--border))]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-[hsl(var(--primary))] mr-2" />
                <h1 className="text-lg font-semibold">Maestro</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <Button
              variant="gradient"
              className="w-full justify-start"
              onClick={handleCreateSession}
            >
              <Plus className="h-4 w-4 mr-2" />
              新会话
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <ChatSessionList
              sessions={sessions}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
              onRenameSession={handleRenameSession}
              onExportSession={handleExportSession}
              onCreateSession={handleCreateSession}
            />
          </div>
          
          <div className="p-4 border-t border-[hsl(var(--border))]">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setSettingsOpen(true)}
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </Button>
          </div>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 移动导航 */}
        <MobileNavigation
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath="/chat"
          onOpenSettings={() => setSettingsOpen(true)}
        />
        
        {/* 桌面导航 */}
        <MainNavigation
          currentPath="/chat"
          onOpenSettings={() => setSettingsOpen(true)}
        />
        
        {/* 聊天区域 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 消息列表 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && (
                <div className="flex justify-center my-4">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 bg-[hsl(var(--primary))] rounded-full"></div>
                    <div className="h-2 w-2 bg-[hsl(var(--primary))] rounded-full"></div>
                    <div className="h-2 w-2 bg-[hsl(var(--primary))] rounded-full"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* 输入区域 */}
            <div className="p-4 border-t border-[hsl(var(--border))]">
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                placeholder="输入消息..."
              />
            </div>
          </div>
          
          {/* 工具输出区域 */}
          <div className="hidden lg:flex lg:w-96 border-l border-[hsl(var(--border))] flex-col overflow-hidden">
            <div className="p-4 border-b border-[hsl(var(--border))]">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-[hsl(var(--primary))] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <h2 className="text-lg font-semibold">工具输出</h2>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {tools.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-center">工具输出将显示在这里</p>
                </div>
              ) : (
                tools.map(tool => (
                  <ToolOutput
                    key={tool.id}
                    type={tool.type}
                    title={tool.title}
                    content={tool.content}
                    imageData={tool.imageData}
                    timestamp={tool.timestamp}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 设置面板 */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialSettings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
} 