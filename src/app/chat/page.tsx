"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Navbar } from '@/components/layout/Navbar';
import { ChatInput } from '@/components/ui/ChatInput';
import { ChatMessage, MessageRole } from '@/components/ui/ChatMessage';
import { ChatSessionList, ChatSession } from '@/components/ui/ChatSessionList';
import { ToolOutput } from '@/components/ui/ToolOutput';
import { SettingsPanel, SettingsData } from '@/components/ui/SettingsPanel';
import { Button } from '@/components/ui/Button';

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
  timestamp: Date;
}

export default function ChatPage() {
  // 状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    apiKey: '',
    modelVersion: 'claude-3-sonnet-20240229',
    enableComputerTool: true,
    enableBashTool: true,
    enableEditTool: true,
    theme: 'system',
  });

  // 初始化
  useEffect(() => {
    // 这里应该从本地存储加载会话和设置
    // 示例数据
    const demoSessions: ChatSession[] = [
      {
        id: '1',
        title: '示例会话',
        lastMessage: '这是一个示例会话',
        timestamp: new Date(),
        isActive: true,
      }
    ];
    
    setSessions(demoSessions);
    setCurrentSessionId('1');
    
    // 添加欢迎消息
    setMessages([
      {
        id: uuidv4(),
        role: 'assistant',
        content: '你好！我是 Maestro，你的 AI 助手。我可以帮助你控制计算机、执行命令和编辑文件。请告诉我你需要什么帮助？',
        timestamp: new Date(),
      }
    ]);
  }, []);

  // 处理发送消息
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // 添加用户消息
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // 模拟 AI 响应
    setIsLoading(true);
    
    // 这里应该调用 API
    setTimeout(() => {
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '我收到了你的消息。这是一个示例响应，实际应用中会调用 Claude API 获取回复。',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // 模拟工具输出
      const toolOutput: Tool = {
        id: uuidv4(),
        type: 'info',
        title: '系统信息',
        content: '这是一个示例工具输出。在实际应用中，这里会显示工具执行的结果。',
        timestamp: new Date(),
      };
      
      setTools(prev => [...prev, toolOutput]);
      setIsLoading(false);
      
      // 更新会话列表
      if (currentSessionId) {
        setSessions(prev => 
          prev.map(session => 
            session.id === currentSessionId 
              ? { ...session, lastMessage: content } 
              : session
          )
        );
      }
    }, 1500);
  };

  // 创建新会话
  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `新会话 ${sessions.length + 1}`,
      timestamp: new Date(),
      isActive: true,
    };
    
    setSessions(prev => prev.map(s => ({ ...s, isActive: false })).concat([newSession]));
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setTools([]);
  };

  // 选择会话
  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSessions(prev => 
      prev.map(session => ({
        ...session,
        isActive: session.id === sessionId,
      }))
    );
    
    // 这里应该加载选定会话的消息
    // 示例
    if (sessionId === '1') {
      setMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: '你好！我是 Maestro，你的 AI 助手。我可以帮助你控制计算机、执行命令和编辑文件。请告诉我你需要什么帮助？',
          timestamp: new Date(),
        }
      ]);
      setTools([]);
    } else {
      setMessages([]);
      setTools([]);
    }
  };

  // 删除会话
  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
        setSessions(prev => 
          prev.map((session, index) => 
            index === 0 ? { ...session, isActive: true } : session
          ).filter(session => session.id !== sessionId)
        );
      } else {
        setCurrentSessionId(null);
      }
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
    // 这里应该实现导出功能
    console.log(`导出会话 ${sessionId}`);
  };

  // 保存设置
  const handleSaveSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
    // 这里应该保存设置到本地存储
  };

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))]">
      {/* 导航栏 */}
      <Navbar className="border-b" />
      
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧会话列表 */}
        <div className="w-64 border-r p-4 bg-[hsl(var(--secondary))] hidden md:block">
          <ChatSessionList
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
            onExportSession={handleExportSession}
          />
        </div>
        
        {/* 右侧对话区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 对话标题栏 */}
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <h1 className="text-lg font-semibold">
              {currentSessionId 
                ? sessions.find(s => s.id === currentSessionId)?.title || '对话' 
                : '对话'}
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                aria-label="设置"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* 消息列表 */}
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
              <ChatMessage
                role="assistant"
                content=""
                isLoading={true}
              />
            )}
            
            {/* 工具输出 */}
            {tools.map(tool => (
              <ToolOutput
                key={tool.id}
                type={tool.type}
                title={tool.title}
                content={tool.content}
                timestamp={tool.timestamp}
              />
            ))}
          </div>
          
          {/* 输入区域 */}
          <div className="p-4 border-t">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder="输入消息或指令..."
            />
            <div className="flex justify-center mt-2">
              <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                由 Claude AI 提供支持
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 设置面板 */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={settings}
      />
    </div>
  );
} 