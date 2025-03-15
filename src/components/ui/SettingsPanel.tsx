import React, { useState } from 'react';
import { X, Save, Eye, EyeOff, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SettingsData) => void;
  initialSettings: SettingsData;
  className?: string;
}

export interface SettingsData {
  apiKey: string;
  modelVersion: string;
  enableComputerTool: boolean;
  enableBashTool: boolean;
  enableEditTool: boolean;
  theme: 'light' | 'dark' | 'system';
}

export const SettingsPanel: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings,
  className,
}) => {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSave = () => {
    onSave(settings);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={cn(
        "bg-[hsl(var(--background))] rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto",
        className
      )}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">设置</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[hsl(var(--accent))]"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 设置内容 */}
        <div className="p-6 space-y-6">
          {/* API设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">API 设置</h3>
            
            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium">
                Anthropic API 密钥
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  id="apiKey"
                  name="apiKey"
                  value={settings.apiKey}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
                  placeholder="sk-ant-api03-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[hsl(var(--muted-foreground))]"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                从 <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))] hover:underline">Anthropic Console</a> 获取 API 密钥
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="modelVersion" className="block text-sm font-medium">
                Claude 模型版本
              </label>
              <select
                id="modelVersion"
                name="modelVersion"
                value={settings.modelVersion}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
              >
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </select>
            </div>
          </div>
          
          {/* 工具设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">工具设置</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableComputerTool"
                  name="enableComputerTool"
                  checked={settings.enableComputerTool}
                  onChange={handleChange}
                  className="w-4 h-4 text-[hsl(var(--primary))] border-[hsl(var(--border))] rounded focus:ring-[hsl(var(--primary))]"
                />
                <label htmlFor="enableComputerTool" className="ml-2 text-sm font-medium">
                  启用计算机控制工具 (ComputerTool)
                </label>
                <div className="relative ml-1 group">
                  <Info className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-[hsl(var(--background))] border rounded shadow-lg text-xs hidden group-hover:block">
                    允许 AI 控制鼠标、键盘并捕获屏幕截图
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableBashTool"
                  name="enableBashTool"
                  checked={settings.enableBashTool}
                  onChange={handleChange}
                  className="w-4 h-4 text-[hsl(var(--primary))] border-[hsl(var(--border))] rounded focus:ring-[hsl(var(--primary))]"
                />
                <label htmlFor="enableBashTool" className="ml-2 text-sm font-medium">
                  启用命令执行工具 (BashTool)
                </label>
                <div className="relative ml-1 group">
                  <Info className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-[hsl(var(--background))] border rounded shadow-lg text-xs hidden group-hover:block">
                    允许 AI 执行系统命令
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableEditTool"
                  name="enableEditTool"
                  checked={settings.enableEditTool}
                  onChange={handleChange}
                  className="w-4 h-4 text-[hsl(var(--primary))] border-[hsl(var(--border))] rounded focus:ring-[hsl(var(--primary))]"
                />
                <label htmlFor="enableEditTool" className="ml-2 text-sm font-medium">
                  启用文本编辑工具 (EditTool)
                </label>
                <div className="relative ml-1 group">
                  <Info className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-[hsl(var(--background))] border rounded shadow-lg text-xs hidden group-hover:block">
                    允许 AI 读取和修改文件
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 界面设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">界面设置</h3>
            
            <div className="space-y-2">
              <label htmlFor="theme" className="block text-sm font-medium">
                主题
              </label>
              <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="system">跟随系统</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex justify-end px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-2"
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            保存设置
          </Button>
        </div>
      </div>
    </div>
  );
}; 