import React from 'react';
import { User, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentBlock } from '@/lib/claude';
import { ContentBlockRenderer } from './ContentBlockRenderer';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface BlockBasedChatMessageProps {
  role: MessageRole;
  blocks: ContentBlock[];
  timestamp?: Date;
  isLoading?: boolean;
  className?: string;
  tools?: any[];
}

export const BlockBasedChatMessage: React.FC<BlockBasedChatMessageProps> = ({
  role,
  blocks,
  timestamp,
  isLoading = false,
  className,
}) => {
  const isUser = role === 'user';
  const formattedTime = timestamp ? new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp) : '';

  return (
    <div className={cn(
      "w-full mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300",
      className
    )}>
      {/* 消息部分 */}
      <div className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}>
        <div className={cn(
          "flex max-w-[80%] md:max-w-[70%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* 头像 */}
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isUser 
              ? "bg-[hsl(var(--primary))] text-white ml-2" 
              : "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] mr-2"
          )}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          
          {/* 消息内容 */}
          <div className={cn(
            "flex flex-col",
            isUser ? "items-end" : "items-start"
          )}>
            <div className={cn(
              "px-4 py-2 rounded-lg",
              isUser 
                ? "bg-[hsl(var(--primary))] text-white rounded-tr-none" 
                : "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-tl-none",
              "prose prose-sm max-w-none" // 使用Tailwind Typography
            )}>
              {isLoading && !blocks.some(b => b.type === 'thinking') && blocks.filter(b => b.type === 'text').length === 0 ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>思考中...</span>
                </div>
              ) : (
                <div>
                  {isUser ? (
                    // 用户消息只显示文本块
                    blocks.filter(block => block.type === 'text').map((block, index) => (
                      <ContentBlockRenderer key={index} block={block} />
                    ))
                  ) : (
                    // AI消息显示所有类型的块
                    blocks.map((block, index) => (
                      <ContentBlockRenderer key={index} block={block} />
                    ))
                  )}
                </div>
              )}
            </div>
            
            {/* 时间戳 */}
            {timestamp && (
              <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                {formattedTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 