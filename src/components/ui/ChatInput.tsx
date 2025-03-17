import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
}

export const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onSend, onStop, isLoading = false, ...props }, ref) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    
    // 将外部ref与内部ref合并
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(textareaRef.current);
      } else if (ref) {
        ref.current = textareaRef.current;
      }
    }, [ref]);

    // 自动调整高度
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, [message]);

    const handleSend = () => {
      if (message.trim() && !isLoading) {
        onSend(message.trim());
        setMessage('');
        // 重置高度
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div className={cn(
        "relative flex items-end w-full border rounded-lg bg-[hsl(var(--background))] focus-within:ring-2 focus-within:ring-[hsl(var(--primary))] focus-within:border-[hsl(var(--primary))]",
        className
      )}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          rows={1}
          className="flex-1 max-h-[200px] py-3 pl-4 pr-20 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
          disabled={isLoading}
          {...props}
        />
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {!isLoading ? (
            <>
              <button
                type="button"
                className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))/10] transition-colors"
                aria-label="附加文件"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))/10] transition-colors"
                aria-label="语音输入"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  message.trim() && !isLoading
                    ? "text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/10]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
                aria-label="发送消息"
              >
                <Send className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStop}
              className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors"
              aria-label="停止生成"
            >
              <Square className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput"; 