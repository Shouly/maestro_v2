import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight } from 'lucide-react';

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
  showDecorations?: boolean;
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
    showDecorations = true,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-7xl mx-auto px-6 py-16 md:py-24 relative overflow-hidden",
          fullHeight && "min-h-[calc(100vh-80px)] flex flex-col justify-center",
          className
        )}
        {...props}
      >
        {/* Canva风格的装饰元素 */}
        {showDecorations && (
          <>
            <div className="absolute top-20 right-10 w-24 h-24 rounded-full bg-[hsl(var(--primary))/10] animate-float" />
            <div className="absolute bottom-20 left-10 w-16 h-16 rounded-full bg-[hsl(var(--accent))/10] animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full bg-[hsl(var(--primary))/5] animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-[hsl(var(--accent))/5] animate-float" style={{ animationDelay: '1.5s' }} />
            <div className="absolute -z-10 top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[hsl(var(--primary))/10] to-transparent rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-[hsl(var(--accent))/10] to-transparent rounded-full blur-3xl" />
          </>
        )}

        <div className={cn(
          "w-full relative z-10",
          align === 'center' && "text-center",
          align === 'left' && "text-left max-w-3xl"
        )}>
          {/* 徽章 - Canva风格更加突出 */}
          {badge && (
            <div className={cn(
              "inline-block mb-8 p-2 bg-[hsl(var(--secondary))] rounded-full shadow-sm",
              align === 'center' && "mx-auto"
            )}>
              <div className="flex items-center space-x-2 px-4 py-1.5 bg-[hsl(var(--background))] rounded-full">
                <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="text-sm font-medium">{badge}</span>
              </div>
            </div>
          )}
          
          {/* 标题 - Canva风格更加大胆 */}
          <div className={cn(
            "text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight",
            typeof title === 'string' ? "gradient-text" : ""
          )}>
            {title}
          </div>
          
          {/* 描述 - Canva风格更加清晰 */}
          {description && (
            <div className={cn(
              "text-lg md:text-xl text-[hsl(var(--muted-foreground))] mb-10",
              align === 'center' && "max-w-3xl mx-auto"
            )}>
              {description}
            </div>
          )}
          
          {/* 按钮区域 - Canva风格更加突出 */}
          {(primaryAction || secondaryAction) && (
            <div className={cn(
              "flex flex-col sm:flex-row gap-5 mb-12",
              align === 'center' && "justify-center",
              align === 'left' && "justify-start"
            )}>
              {primaryAction && (
                <Button 
                  size="lg" 
                  variant="gradient"
                  rounded="full"
                  onClick={primaryAction.onClick}
                  className="group"
                  {...(primaryAction.href ? { as: 'a', href: primaryAction.href } : {})}
                >
                  <span>{primaryAction.text}</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
              
              {secondaryAction && (
                <Button 
                  variant="outline" 
                  size="lg"
                  rounded="full"
                  onClick={secondaryAction.onClick}
                  className="group"
                  {...(secondaryAction.href ? { as: 'a', href: secondaryAction.href } : {})}
                >
                  <span>{secondaryAction.text}</span>
                  <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </div>
          )}
          
          {/* 图像区域 - Canva风格更加动感 */}
          {image && (
            <div className="mt-8 card-hover">
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