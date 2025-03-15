"use client";

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 按钮样式变体定义
const buttonVariants = cva(
  // 基础样式
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Canva风格的主要按钮 - 鲜艳的蓝色
        primary: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))/90]",
        // 次要按钮 - 柔和的灰色背景
        secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))/80]",
        // 强调按钮 - 紫色
        accent: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))/90]",
        // 轮廓按钮 - 透明背景带边框
        outline: "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary-foreground))]",
        // 幽灵按钮 - 完全透明
        ghost: "bg-transparent hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary-foreground))]",
        // 链接按钮 - 看起来像链接
        link: "text-[hsl(var(--primary))] underline-offset-4 hover:underline bg-transparent",
        // 危险按钮 - 红色
        destructive: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))/90]",
        // 渐变按钮 - Canva风格的渐变效果
        gradient: "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white hover:opacity-90",
      },
      size: {
        // 不同尺寸
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-6 py-2.5 text-base",
        xl: "h-12 px-8 py-3 text-lg",
        // 图标按钮
        icon: "h-10 w-10",
      },
      rounded: {
        // 圆角选项
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "default",
    },
  }
);

// 按钮组件属性
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// 按钮组件
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants }; 