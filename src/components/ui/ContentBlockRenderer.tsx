import React from 'react';
import { ContentBlock, TextBlock, ToolUseBlock, ToolResultBlock, ThinkingBlock } from '@/lib/claude';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface ContentBlockRendererProps {
  block: ContentBlock;
  className?: string;
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
  block,
  className,
}) => {
  // 自定义组件，特别处理图片
  const markdownComponents = {
    img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <div className="my-2 overflow-hidden rounded-md border border-[hsl(var(--border))]">
        <img 
          src={src} 
          alt={alt || "图片"} 
          className="max-w-full h-auto" 
          {...props} 
        />
      </div>
    ),
    // 自定义代码块样式
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      return (
        <code className="px-1 py-0.5 bg-[hsl(var(--muted))] rounded text-xs" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre className="my-2 p-2 overflow-auto rounded-md bg-[hsl(var(--muted))] text-xs font-mono" {...props}>
        {children}
      </pre>
    ),
  };

  switch (block.type) {
    case 'text':
      const textBlock = block as TextBlock;
      return (
        <div className={cn("whitespace-pre-wrap break-words", className)}>
          <ReactMarkdown 
            components={markdownComponents}
            rehypePlugins={[rehypeRaw]} // 允许渲染HTML
          >
            {textBlock.text}
          </ReactMarkdown>
        </div>
      );
    
    case 'tool_use':
      const toolUseBlock = block as ToolUseBlock;
      return (
        <div className={cn("tool-use my-2", className)}>
          <div className="font-medium mb-1">🔧 正在执行: {toolUseBlock.name}</div>
          <pre className="p-2 bg-[hsl(var(--muted))] rounded-md text-xs overflow-auto">
            {JSON.stringify(toolUseBlock.input, null, 2)}
          </pre>
        </div>
      );
    
    case 'tool_result':
      const toolResultBlock = block as ToolResultBlock;
      return (
        <div className={cn("tool-result my-2", className)}>
          <div className="font-medium mb-1">
            {toolResultBlock.is_error ? '❌ ' : '✅ '}执行结果
          </div>
          {typeof toolResultBlock.content === 'string' ? (
            <pre className="p-2 bg-[hsl(var(--muted))] rounded-md text-xs overflow-auto">
              {toolResultBlock.content}
            </pre>
          ) : (
            <div>
              {toolResultBlock.content.map((item, index) => {
                if (item.type === 'text') {
                  return (
                    <div key={index} className="p-2 bg-[hsl(var(--muted))] rounded-md text-xs overflow-auto">
                      {item.text}
                    </div>
                  );
                } else if (item.type === 'image') {
                  return (
                    <div key={index} className="mt-2">
                      <img 
                        src={`data:image/png;base64,${item.source.data}`}
                        alt="截图结果"
                        className="max-w-full rounded-md border border-[hsl(var(--border))]"
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      );
    
    case 'thinking':
      const thinkingBlock = block as ThinkingBlock;
      return (
        <div className={cn("thinking my-2 italic text-[hsl(var(--muted-foreground))]", className)}>
          <div className="font-medium mb-1">🤔 思考中...</div>
          <div className="p-2 bg-[hsl(var(--muted))] rounded-md text-xs overflow-auto">
            {thinkingBlock.thinking}
          </div>
        </div>
      );
    
    default:
      return <div>未知内容类型</div>;
  }
}; 