"use client";

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 卡片容器样式变体
const cardVariants = cva(
  // 基础样式
  "rounded-lg border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm",
  {
    variants: {
      variant: {
        // 默认卡片
        default: "border-[hsl(var(--border))]",
        // 无边框卡片
        borderless: "border-transparent",
        // 强调卡片 - 带有主色调边框
        accent: "border-[hsl(var(--primary))]",
        // 渐变边框 - Canva风格的渐变边框
        gradient: "border-transparent bg-gradient-to-r p-[1px] from-[hsl(var(--primary))] to-[hsl(var(--accent))]",
      },
      hover: {
        // 悬停效果
        none: "",
        scale: "transition-transform duration-300 hover:scale-[1.02]",
        shadow: "transition-shadow duration-300 hover:shadow-md",
        border: "transition-colors duration-300 hover:border-[hsl(var(--primary))]",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
    },
  }
);

// 卡片内容容器
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

// 卡片标题
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// 卡片描述
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[hsl(var(--muted-foreground))]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// 卡片页脚
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// 卡片头部
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// 卡片图标容器
const CardIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-12 h-12 rounded-lg bg-[hsl(var(--primary))/10] flex items-center justify-center mb-4", className)}
    {...props}
  />
));
CardIcon.displayName = "CardIcon";

// 卡片组件属性
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

// 卡片组件
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, ...props }, ref) => {
    // 对于渐变边框卡片，需要特殊处理内容容器
    if (variant === 'gradient') {
      return (
        <div className={cn(cardVariants({ variant, hover, className }))}>
          <div className="rounded-[calc(0.5rem-1px)] bg-[hsl(var(--card))] p-6 h-full w-full" {...props} ref={ref} />
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover, className }))}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardIcon }; 