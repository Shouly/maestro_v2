import React, { useState } from 'react';
import { X, Save, Eye, EyeOff, Info, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import LogViewerModal from '../LogViewerModal';
import { ComputerToolOptions } from '@/lib/claude';

export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SettingsData) => void;
  initialSettings: SettingsData;
  className?: string;
}

export interface SettingsData {
  // API配置
  apiProvider: 'anthropic' | 'bedrock' | 'vertex' | 'mock';
  apiKey: string;
  modelVersion: string;
  
  // 工具配置
  toolVersion: 'computer_use_20241022' | 'computer_use_20250124';
  enableComputerTool: boolean;
  enableBashTool: boolean;
  enableEditTool: boolean;
  
  // 输出配置
  maxOutputTokens: number;
  defaultOutputTokens: number;
  thinkingEnabled: boolean;
  thinkingBudget: number;
  
  // 图像和显示配置
  onlyNMostRecentImages: number;
  hideScreenshots: boolean;
  tokenEfficientToolsBeta: boolean;
  
  // 系统提示配置
  customSystemPrompt: string;
  
  // 界面设置
  theme: 'light' | 'dark' | 'system';
  
  // 计算机工具选项
  computerToolOptions?: ComputerToolOptions;
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
  const [logViewerOpen, setLogViewerOpen] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseFloat(value);
      setSettings(prev => ({ ...prev, [name]: numValue }));
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
        "bg-[hsl(var(--background))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto",
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
              <label htmlFor="apiProvider" className="block text-sm font-medium">
                API 提供商
              </label>
              <select
                id="apiProvider"
                name="apiProvider"
                value={settings.apiProvider}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
              >
                <option value="anthropic">Anthropic</option>
                <option value="bedrock">AWS Bedrock</option>
                <option value="vertex">Google Vertex AI</option>
                <option value="mock">Mock</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium">
                API 密钥
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  id="apiKey"
                  name="apiKey"
                  value={settings.apiKey}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
                  placeholder={settings.apiProvider === 'anthropic' ? "sk-ant-api03-..." : "您的API密钥"}
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
                {settings.apiProvider === 'anthropic' && (
                  <>从 <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))] hover:underline">Anthropic Console</a> 获取 API 密钥</>
                )}
                {settings.apiProvider === 'bedrock' && (
                  <>从 AWS 控制台获取 Bedrock 访问凭证</>
                )}
                {settings.apiProvider === 'vertex' && (
                  <>从 Google Cloud 控制台获取 Vertex AI 访问凭证</>
                )}
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
                {settings.apiProvider === 'anthropic' && (
                  <>
                    <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
                    <option value="claude-3-5-sonnet-20240229">Claude 3.5 Sonnet</option>
                  </>
                )}
                {settings.apiProvider === 'bedrock' && (
                  <>
                    <option value="anthropic.claude-3-5-sonnet-20241022-v2:0">Claude 3.5 Sonnet (Bedrock)</option>
                    <option value="anthropic.claude-3-7-sonnet-20250219:0">Claude 3.7 Sonnet (Bedrock)</option>
                  </>
                )}
                {settings.apiProvider === 'vertex' && (
                  <>
                    <option value="claude-3-5-sonnet-v2@20241022">Claude 3.5 Sonnet (Vertex)</option>
                  </>
                )}
              </select>
            </div>
          </div>
          
          {/* 工具设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">工具设置</h3>
            
            <div className="space-y-2">
              <label htmlFor="toolVersion" className="block text-sm font-medium">
                工具版本
              </label>
              <select
                id="toolVersion"
                name="toolVersion"
                value={settings.toolVersion}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
              >
                <option value="computer_use_20250124">computer_use_20250124 (最新)</option>
                <option value="computer_use_20241022">computer_use_20241022</option>
              </select>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                不同版本的工具支持不同的功能集
              </p>
            </div>
            
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
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-[hsl(var(--background))] border rounded shadow-lg text-xs hidden group-hover:block z-10">
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
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-[hsl(var(--background))] border rounded shadow-lg text-xs hidden group-hover:block z-10">
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
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-[hsl(var(--background))] border rounded shadow-lg text-xs hidden group-hover:block z-10">
                    允许 AI 读取和修改文件
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 输出配置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">输出配置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="maxOutputTokens" className="block text-sm font-medium">
                  最大输出令牌数
                </label>
                <input
                  type="number"
                  id="maxOutputTokens"
                  name="maxOutputTokens"
                  value={settings.maxOutputTokens}
                  onChange={handleChange}
                  min={1024}
                  max={128000}
                  step={1024}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="defaultOutputTokens" className="block text-sm font-medium">
                  默认输出令牌数
                </label>
                <input
                  type="number"
                  id="defaultOutputTokens"
                  name="defaultOutputTokens"
                  value={settings.defaultOutputTokens}
                  onChange={handleChange}
                  min={1024}
                  max={settings.maxOutputTokens}
                  step={1024}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="thinkingEnabled"
                name="thinkingEnabled"
                checked={settings.thinkingEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-[hsl(var(--primary))] border-[hsl(var(--border))] rounded focus:ring-[hsl(var(--primary))]"
              />
              <label htmlFor="thinkingEnabled" className="ml-2 text-sm font-medium">
                启用思考功能
              </label>
              <div className="relative ml-1 group">
                <Info className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-[hsl(var(--background))] border rounded shadow-lg text-xs hidden group-hover:block z-10">
                  允许模型在回答前进行思考，仅支持 Claude 3.7 Sonnet
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="thinkingBudget" className="block text-sm font-medium">
                思考预算
              </label>
              <input
                type="number"
                id="thinkingBudget"
                name="thinkingBudget"
                value={settings.thinkingBudget}
                onChange={handleChange}
                min={1024}
                max={settings.maxOutputTokens}
                step={1024}
                disabled={!settings.thinkingEnabled}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))] disabled:opacity-50"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                分配给模型思考过程的令牌数量
              </p>
            </div>
          </div>
          
          {/* 图像和显示配置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">图像和显示配置</h3>
            
            <div className="space-y-2">
              <label htmlFor="onlyNMostRecentImages" className="block text-sm font-medium">
                仅发送最近 N 张图像
              </label>
              <input
                type="number"
                id="onlyNMostRecentImages"
                name="onlyNMostRecentImages"
                value={settings.onlyNMostRecentImages}
                onChange={handleChange}
                min={0}
                max={10}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                减少发送的图像数量以降低令牌消耗，设为 0 表示不限制
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hideScreenshots"
                name="hideScreenshots"
                checked={settings.hideScreenshots}
                onChange={handleChange}
                className="w-4 h-4 text-[hsl(var(--primary))] border-[hsl(var(--border))] rounded focus:ring-[hsl(var(--primary))]"
              />
              <label htmlFor="hideScreenshots" className="ml-2 text-sm font-medium">
                隐藏截图
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="tokenEfficientToolsBeta"
                name="tokenEfficientToolsBeta"
                checked={settings.tokenEfficientToolsBeta}
                onChange={handleChange}
                className="w-4 h-4 text-[hsl(var(--primary))] border-[hsl(var(--border))] rounded focus:ring-[hsl(var(--primary))]"
              />
              <label htmlFor="tokenEfficientToolsBeta" className="ml-2 text-sm font-medium">
                启用令牌高效工具测试版
              </label>
            </div>
          </div>
          
          {/* 系统提示配置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">系统提示配置</h3>
            
            <div className="space-y-2">
              <label htmlFor="customSystemPrompt" className="block text-sm font-medium">
                自定义系统提示后缀
              </label>
              <textarea
                id="customSystemPrompt"
                name="customSystemPrompt"
                value={settings.customSystemPrompt}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] bg-[hsl(var(--background))]"
                placeholder="添加到系统提示末尾的自定义指令..."
              ></textarea>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                这些指令将添加到系统提示的末尾，用于提供额外的上下文或指导
              </p>
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
          
          {/* 开发者工具 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">开发者工具</h3>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setLogViewerOpen(true)}
                className="flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                查看应用程序日志
              </Button>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                查看应用程序的运行日志，用于诊断问题
              </p>
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
      
      {/* 日志查看器模态框 */}
      <LogViewerModal
        isOpen={logViewerOpen}
        onClose={() => setLogViewerOpen(false)}
      />
    </div>
  );
}; 