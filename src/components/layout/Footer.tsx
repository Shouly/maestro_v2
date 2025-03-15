import React from 'react';
import Link from 'next/link';
import { Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  simplified?: boolean;
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

// 页脚链接组件
const FooterLink = ({ href, children }: FooterLinkProps) => {
  return (
    <Link 
      href={href} 
      className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
    >
      {children}
    </Link>
  );
};

// 页脚组件
const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, simplified = false, ...props }, ref) => {
    // 简化版页脚
    if (simplified) {
      return (
        <footer
          ref={ref}
          className={cn(
            "w-full border-t border-[hsl(var(--border))] py-6 px-6",
            className
          )}
          {...props}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                <Command className="w-4 h-4 text-white m-1" />
              </div>
              <span className="font-medium">Maestro</span>
            </div>
            <div className="flex space-x-6">
              <FooterLink href="https://github.com">GitHub</FooterLink>
              <FooterLink href="/docs">文档</FooterLink>
              <FooterLink href="/privacy">隐私政策</FooterLink>
            </div>
          </div>
        </footer>
      );
    }

    // 完整版页脚
    return (
      <footer
        ref={ref}
        className={cn(
          "w-full border-t border-[hsl(var(--border))] py-12 px-6 bg-[hsl(var(--secondary))]",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto">
          {/* 顶部区域 - Logo和描述 */}
          <div className="flex flex-col md:flex-row justify-between mb-12">
            <div className="mb-8 md:mb-0 max-w-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
                  <Command className="w-5 h-5 text-white m-1.5" />
                </div>
                <span className="font-bold text-lg">Maestro</span>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                使用Tauri和Rust构建的跨平台桌面应用，通过Claude AI模型控制计算机执行各种任务，提高工作效率
              </p>
            </div>
            
            {/* 链接区域 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-4 text-sm">产品</h4>
                <ul className="space-y-3">
                  <li><FooterLink href="/features">功能</FooterLink></li>
                  <li><FooterLink href="/download">下载</FooterLink></li>
                  <li><FooterLink href="/pricing">价格</FooterLink></li>
                  <li><FooterLink href="/roadmap">路线图</FooterLink></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4 text-sm">资源</h4>
                <ul className="space-y-3">
                  <li><FooterLink href="/docs">文档</FooterLink></li>
                  <li><FooterLink href="/guides">指南</FooterLink></li>
                  <li><FooterLink href="/api">API</FooterLink></li>
                  <li><FooterLink href="/faq">常见问题</FooterLink></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4 text-sm">公司</h4>
                <ul className="space-y-3">
                  <li><FooterLink href="/about">关于我们</FooterLink></li>
                  <li><FooterLink href="/blog">博客</FooterLink></li>
                  <li><FooterLink href="/contact">联系我们</FooterLink></li>
                  <li><FooterLink href="/careers">招聘</FooterLink></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 底部区域 - 版权和社交链接 */}
          <div className="pt-8 border-t border-[hsl(var(--border))] flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 md:mb-0">
              © {new Date().getFullYear()} Maestro. 保留所有权利。
            </p>
            <div className="flex space-x-6">
              <FooterLink href="/terms">服务条款</FooterLink>
              <FooterLink href="/privacy">隐私政策</FooterLink>
              <FooterLink href="/cookies">Cookie 政策</FooterLink>
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = "Footer";

export { Footer, FooterLink }; 