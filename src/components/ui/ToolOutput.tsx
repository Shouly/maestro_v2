import React from 'react';
import { Terminal, Image, Code2, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolType = 'command' | 'screenshot' | 'code' | 'file' | 'success' | 'error' | 'info';

export interface ToolOutputProps {
  type: ToolType;
  title: string;
  content: string | React.ReactNode;
  imageData?: string;
  timestamp?: Date;
  className?: string;
}

export const ToolOutput: React.FC<ToolOutputProps> = ({
  type,
  title,
  content,
  imageData,
  timestamp,
  className,
}) => {
  const formattedTime = timestamp ? new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp) : '';
  
  const getIcon = () => {
    switch (type) {
      case 'command':
        return <Terminal className="h-5 w-5" />;
      case 'screenshot':
        return <Image className="h-5 w-5" />;
      case 'code':
        return <Code2 className="h-5 w-5" />;
      case 'file':
        return <FileText className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'info':
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/20';
      case 'error':
        return 'border-red-500/20';
      case 'info':
        return 'border-blue-500/20';
      default:
        return 'border-[hsl(var(--border))]';
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/5';
      case 'error':
        return 'bg-red-500/5';
      case 'info':
        return 'bg-blue-500/5';
      default:
        return 'bg-[hsl(var(--card))]';
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case 'command':
        return 'text-[hsl(var(--primary))]';
      case 'screenshot':
        return 'text-[hsl(var(--accent))]';
      case 'code':
        return 'text-[hsl(var(--primary))]';
      case 'file':
        return 'text-[hsl(var(--muted-foreground))]';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-[hsl(var(--foreground))]';
    }
  };
  
  return (
    <div className={cn(
      'mb-4 rounded-lg border p-4',
      getBorderColor(),
      getBackgroundColor(),
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={cn('mr-2', getIconColor())}>
            {getIcon()}
          </div>
          <h3 className="font-medium">{title}</h3>
        </div>
        {timestamp && (
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {formattedTime}
          </span>
        )}
      </div>
      
      {/* 内容区域 */}
      <div className="mt-2">
        {typeof content === 'string' ? (
          <div className="whitespace-pre-wrap break-words text-sm">
            {content}
          </div>
        ) : (
          content
        )}
        
        {/* 图片显示 */}
        {imageData && type === 'screenshot' && (
          <div className="mt-3 overflow-hidden rounded-md border border-[hsl(var(--border))]">
            <img 
              src={`data:image/png;base64,${imageData}`} 
              alt="Screenshot" 
              className="w-full h-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}; 