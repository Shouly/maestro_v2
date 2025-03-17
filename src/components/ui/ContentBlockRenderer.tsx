import React from 'react';
import { ContentBlock, TextBlock, ToolUseBlock, ToolResultBlock, ThinkingBlock, ImageBlock } from '@/lib/claude';
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

  // 调试信息
  console.log('渲染内容块:', block);

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
      console.log('渲染工具使用块:', toolUseBlock);
      return (
        <div className={cn("tool-use my-2 p-4 bg-[hsl(var(--muted))/30] rounded-lg border border-[hsl(var(--border))]", className)}>
          <div className="font-medium mb-2 text-base flex items-center">
            <span className="mr-2">🔧</span>
            <span>Tool Use: {toolUseBlock.name}</span>
          </div>
          <div className="mt-2">
            <div className="font-medium text-sm mb-1">Input:</div>
            <pre className="p-2 bg-[hsl(var(--muted))] rounded-md text-xs overflow-auto">
              {JSON.stringify(toolUseBlock.input, null, 2)}
            </pre>
          </div>
        </div>
      );
    
    case 'tool_result':
      const toolResultBlock = block as ToolResultBlock;
      console.log('渲染工具结果块:', toolResultBlock);
      
      return (
        <div className={cn("tool-result my-2 p-4 bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]", className)}>
          <div className="font-medium mb-2 text-base">
            {toolResultBlock.is_error ? '❌ ' : '✅ '}执行结果
          </div>
          {typeof toolResultBlock.content === 'string' ? (
            <pre className="p-2 bg-[hsl(var(--muted))] rounded-md text-xs overflow-auto whitespace-pre-wrap">
              {toolResultBlock.content}
            </pre>
          ) : (
            <div className="space-y-2">
              {Array.isArray(toolResultBlock.content) && toolResultBlock.content.map((item: any, index) => {
                console.log('工具结果内容项:', item);
                if (item && item.type === 'text') {
                  return (
                    <div key={index} className="p-2 bg-[hsl(var(--muted))] rounded-md text-xs overflow-auto whitespace-pre-wrap">
                      <ReactMarkdown 
                        components={markdownComponents}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {item.text}
                      </ReactMarkdown>
                    </div>
                  );
                } else if (item && item.type === 'image') {
                  console.log('渲染图片:', item.source);
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
          <div className="p-2 bg-[hsl(var(--muted))] rounded-md text-xs overflow-auto whitespace-pre-wrap">
            {thinkingBlock.thinking}
          </div>
        </div>
      );
    
    case 'image':
      const imageBlock = block as ImageBlock;
      console.log('渲染独立图片块:', imageBlock);
      return (
        <div className={cn("my-2", className)}>
          <img 
            src={`data:image/png;base64,${imageBlock.source.data}`}
            alt="图像"
            className="max-w-full rounded-md border border-[hsl(var(--border))]"
          />
        </div>
      );
    
    default:
      console.warn('未知内容类型:', block);
      return <div>未知内容类型: {(block as any).type}</div>;
  }
}; 