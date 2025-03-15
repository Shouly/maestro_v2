import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface HeroProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: string;
  primaryAction?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  image?: React.ReactNode;
  align?: 'center' | 'left';
  fullHeight?: boolean;
}

// Canva风格的英雄区域组件
const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ 
    className, 
    title, 
    description, 
    badge,
    primaryAction,
    secondaryAction,
    image,
    align = 'center',
    fullHeight = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-6xl mx-auto px-6 py-16 md:py-24",
          fullHeight && "min-h-[calc(100vh-80px)] flex flex-col justify-center",
          className
        )}
        {...props}
      >
        <div className={cn(
          "w-full",
          align === 'center' && "text-center",
          align === 'left' && "text-left max-w-3xl"
        )}>
          {/* 徽章 */}
          {badge && (
            <div className={cn(
              "inline-block mb-6 p-2 bg-[hsl(var(--secondary))] rounded-full",
              align === 'center' && "mx-auto"
            )}>
              <div className="flex items-center space-x-2 px-3 py-1 bg-[hsl(var(--background))] rounded-full">
                <span className="flex h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></span>
                <span className="text-sm font-medium">{badge}</span>
              </div>
            </div>
          )}
          
          {/* 标题 */}
          <div className={cn(
            "text-4xl md:text-6xl font-bold tracking-tight mb-6",
            typeof title === 'string' && "bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"
          )}>
            {title}
          </div>
          
          {/* 描述 */}
          {description && (
            <div className={cn(
              "text-lg md:text-xl text-[hsl(var(--muted-foreground))] mb-10",
              align === 'center' && "max-w-3xl mx-auto"
            )}>
              {description}
            </div>
          )}
          
          {/* 按钮区域 */}
          {(primaryAction || secondaryAction) && (
            <div className={cn(
              "flex flex-col sm:flex-row gap-4 mb-12",
              align === 'center' && "justify-center",
              align === 'left' && "justify-start"
            )}>
              {primaryAction && (
                <Button 
                  size="lg" 
                  onClick={primaryAction.onClick}
                  {...(primaryAction.href ? { as: 'a', href: primaryAction.href } : {})}
                >
                  {primaryAction.text}
                </Button>
              )}
              
              {secondaryAction && (
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={secondaryAction.onClick}
                  {...(secondaryAction.href ? { as: 'a', href: secondaryAction.href } : {})}
                >
                  {secondaryAction.text}
                </Button>
              )}
            </div>
          )}
          
          {/* 图像区域 */}
          {image && (
            <div className="mt-8">
              {image}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Hero.displayName = "Hero";

export { Hero }; 