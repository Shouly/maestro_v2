import React from 'react';
import Link from 'next/link';
import { Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  transparent?: boolean;
}

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

// 导航项组件
const NavItem = ({ href, children, active }: NavItemProps) => {
  return (
    <Link 
      href={href} 
      className={cn(
        "text-sm font-medium transition-colors hover:text-[hsl(var(--primary))]",
        active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]"
      )}
    >
      {children}
    </Link>
  );
};

// 默认Logo组件
const DefaultLogo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
      <Command className="w-5 h-5 text-white m-1.5" />
    </div>
    <span className="font-bold text-lg">Maestro</span>
  </div>
);

// 导航栏组件
const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, logo, transparent = false, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 py-4 px-6",
          transparent 
            ? "bg-transparent" 
            : "backdrop-blur-md bg-[hsl(var(--background))/80] border-b border-[hsl(var(--border))]",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo区域 */}
          {logo || <DefaultLogo />}
          
          {/* 导航链接 - 移动端隐藏 */}
          <div className="hidden md:flex space-x-6">
            <NavItem href="#features">功能</NavItem>
            <NavItem href="#docs">文档</NavItem>
            <NavItem href="#download">下载</NavItem>
            <NavItem href="#about">关于</NavItem>
          </div>
          
          {/* 行动按钮 */}
          <Button size="md">开始使用</Button>
        </div>
      </nav>
    );
  }
);

Navbar.displayName = "Navbar";

export { Navbar, NavItem }; 