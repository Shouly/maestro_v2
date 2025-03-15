import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  variant?: 'default' | 'accent' | 'gradient' | 'borderless';
  hover?: 'none' | 'scale' | 'shadow' | 'border';
  showDecoration?: boolean;
}

// Canva风格的特性卡片组件
const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ 
    className, 
    title, 
    description, 
    icon: Icon, 
    iconColor = "hsl(var(--primary))", 
    iconBgColor = "hsl(var(--primary)/0.1)",
    variant = 'default',
    hover = 'scale',
    showDecoration = true,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant={variant}
        hover={hover}
        className={cn("p-0 relative overflow-hidden", className)}
        {...props}
      >
        {/* Canva风格的装饰元素 */}
        {showDecoration && (
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--primary))/10] to-[hsl(var(--accent))/10] blur-xl" />
        )}
        
        <CardContent className="p-8 relative">
          {/* 图标容器 - Canva风格更加突出 */}
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm relative overflow-hidden group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: iconBgColor }}
          >
            {/* 图标背景装饰 */}
            {showDecoration && (
              <div className="absolute inset-0 opacity-50">
                <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white/20" />
                <div className="absolute -left-2 -bottom-2 w-4 h-4 rounded-full bg-white/10" />
              </div>
            )}
            
            <Icon className="h-7 w-7 relative z-10" style={{ color: iconColor }} />
          </div>
          
          {/* 标题 - Canva风格更加醒目 */}
          <h3 className="text-xl font-semibold mb-3">{title}</h3>
          
          {/* 描述 - Canva风格更加清晰 */}
          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
            {description}
          </p>
          
          {/* Canva风格的底部装饰 */}
          {showDecoration && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary))/30] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </CardContent>
      </Card>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export { FeatureCard }; 