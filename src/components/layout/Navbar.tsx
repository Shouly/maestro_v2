"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Command, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  transparent?: boolean;
  sticky?: boolean;
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
        "text-sm font-medium transition-all relative group",
        active 
          ? "text-[hsl(var(--primary))]" 
          : "text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]"
      )}
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--primary))] group-hover:w-full transition-all duration-300" />
    </Link>
  );
};

// 默认Logo组件
const DefaultLogo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-sm">
      <Command className="w-5 h-5 text-white" />
    </div>
    <span className="font-bold text-lg">Maestro</span>
  </div>
);

// 导航栏组件
const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, logo, transparent = false, sticky = true, ...props }, ref) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 监听滚动事件
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
      <nav
        ref={ref}
        className={cn(
          "w-full z-50 py-4 px-6 transition-all duration-300",
          sticky && "fixed top-0 left-0 right-0",
          isScrolled || !transparent 
            ? "backdrop-blur-md bg-[hsl(var(--background))/90] border-b border-[hsl(var(--border))] shadow-sm" 
            : "bg-transparent",
          isMobileMenuOpen && "bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo区域 */}
          <Link href="/" className="z-10">
            {logo || <DefaultLogo />}
          </Link>
          
          {/* 导航链接 - 移动端隐藏 */}
          <div className="hidden md:flex space-x-8">
            <NavItem href="/">首页</NavItem>
            <NavItem href="/chat">对话</NavItem>
            <NavItem href="#features">功能</NavItem>
            <NavItem href="#download">下载</NavItem>
          </div>
          
          {/* 行动按钮 - 移动端隐藏 */}
          <div className="hidden md:block">
            <Button size="md" variant="gradient" rounded="full">
              开始使用
            </Button>
          </div>
          
          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden z-10 p-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          {/* 移动端菜单 */}
          <div className={cn(
            "fixed inset-0 bg-[hsl(var(--background))] flex flex-col items-center justify-center space-y-8 transition-all duration-300 md:hidden",
            isMobileMenuOpen 
              ? "opacity-100 pointer-events-auto" 
              : "opacity-0 pointer-events-none"
          )}>
            <NavItem href="/">首页</NavItem>
            <NavItem href="/chat">对话</NavItem>
            <NavItem href="#features">功能</NavItem>
            <NavItem href="#download">下载</NavItem>
            <div className="pt-4">
              <Button size="lg" variant="gradient" rounded="full">
                开始使用
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }
);

Navbar.displayName = "Navbar";

export { Navbar, NavItem }; 