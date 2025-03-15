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
  variant?: 'default' | 'accent' | 'gradient';
  hover?: 'none' | 'scale' | 'shadow' | 'border';
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
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant={variant}
        hover={hover}
        className={cn("p-0", className)}
        {...props}
      >
        <CardContent className="p-6">
          {/* 图标容器 */}
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className="h-6 w-6" style={{ color: iconColor }} />
          </div>
          
          {/* 标题 */}
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          
          {/* 描述 */}
          <p className="text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        </CardContent>
      </Card>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export { FeatureCard }; 