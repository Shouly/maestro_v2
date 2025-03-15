import React from 'react';
import { Terminal, Image, Code2, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToolType = 'command' | 'screenshot' | 'code' | 'file' | 'success' | 'error' | 'info';

export interface ToolOutputProps {
  type: ToolType;
  title: string;
  content: string | React.ReactNode;
  timestamp?: Date;
  className?: string;
}

export const ToolOutput: React.FC<ToolOutputProps> = ({
  type,
  title,
  content,
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
        return <Terminal className="w-5 h-5" />;
      case 'screenshot':
        return <Image className="w-5 h-5" />;
      case 'code':
        return <Code2 className="w-5 h-5" />;
      case 'file':
        return <FileText className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Terminal className="w-5 h-5" />;
    }
  };
  
  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-[hsl(var(--border))]';
    }
  };
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden mb-4",
      getBorderColor(),
      className
    )}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))]">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="font-medium">{title}</span>
        </div>
        {timestamp && (
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {formattedTime}
          </span>
        )}
      </div>
      
      {/* 内容区域 */}
      <div className={cn(
        "p-4",
        type === 'command' && "bg-black text-white font-mono text-sm",
        type === 'code' && "bg-[hsl(var(--secondary))] font-mono text-sm p-0"
      )}>
        {typeof content === 'string' ? (
          type === 'screenshot' ? (
            <div className="flex justify-center">
              <img 
                src={content} 
                alt={title} 
                className="max-w-full max-h-[500px] object-contain rounded" 
              />
            </div>
          ) : (
            <div className={cn(
              "whitespace-pre-wrap break-words",
              type === 'command' && "whitespace-pre overflow-x-auto"
            )}>
              {content}
            </div>
          )
        ) : (
          content
        )}
      </div>
    </div>
  );
}; 