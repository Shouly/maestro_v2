"use client";

import React from 'react';
import Link from 'next/link';
import { Command, ArrowUpRight, Instagram, Twitter, Github, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  simplified?: boolean;
  showDecoration?: boolean;
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

// 页脚链接组件
const FooterLink = ({ href, children, external = false }: FooterLinkProps) => {
  return (
    <Link 
      href={href} 
      className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors group flex items-center"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
      {external && (
        <ArrowUpRight className="ml-1 h-3 w-3 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      )}
    </Link>
  );
};

// 社交媒体链接组件
const SocialLink = ({ href, icon: Icon }: { href: string; icon: React.ElementType }) => {
  return (
    <Link 
      href={href} 
      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors p-2 rounded-full hover:bg-[hsl(var(--secondary))]"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
};

// 页脚组件
const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, simplified = false, showDecoration = true, ...props }, ref) => {
    const currentYear = new Date().getFullYear();
    
    // 简化版页脚
    if (simplified) {
      return (
        <footer
          ref={ref}
          className={cn(
            "w-full border-t border-[hsl(var(--border))] py-8 px-6 relative overflow-hidden",
            className
          )}
          {...props}
        >
          {/* Canva风格的装饰元素 */}
          {showDecoration && (
            <>
              <div className="absolute -z-10 bottom-0 right-0 w-1/4 h-1/2 bg-gradient-to-t from-[hsl(var(--primary))/5] to-transparent rounded-full blur-3xl" />
              <div className="absolute -z-10 top-0 left-0 w-1/4 h-1/2 bg-gradient-to-b from-[hsl(var(--accent))/5] to-transparent rounded-full blur-3xl" />
            </>
          )}
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-sm">
                <Command className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Maestro</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
              <div className="flex space-x-6 md:mr-8">
                <FooterLink href="https://github.com" external>GitHub</FooterLink>
                <FooterLink href="/docs">文档</FooterLink>
                <FooterLink href="/privacy">隐私政策</FooterLink>
              </div>
              
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                © {currentYear} Maestro. 保留所有权利。
              </div>
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
          "w-full border-t border-[hsl(var(--border))] py-16 px-6 bg-[hsl(var(--secondary))] relative overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Canva风格的装饰元素 */}
        {showDecoration && (
          <>
            <div className="absolute -z-10 bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-t from-[hsl(var(--primary))/10] to-transparent rounded-full blur-3xl" />
            <div className="absolute -z-10 top-0 left-0 w-1/3 h-1/2 bg-gradient-to-b from-[hsl(var(--accent))/10] to-transparent rounded-full blur-3xl" />
          </>
        )}
        
        <div className="max-w-7xl mx-auto">
          {/* 顶部区域 - Logo和描述 */}
          <div className="flex flex-col md:flex-row justify-between mb-16">
            <div className="mb-10 md:mb-0 max-w-sm">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-sm">
                  <Command className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Maestro</span>
              </div>
              <p className="text-[hsl(var(--muted-foreground))] mb-6">
                使用Tauri和Rust构建的跨平台桌面应用，通过Claude AI模型控制计算机执行各种任务，提高工作效率
              </p>
              
              {/* 社交媒体链接 */}
              <div className="flex space-x-2">
                <SocialLink href="https://github.com" icon={Github} />
                <SocialLink href="https://twitter.com" icon={Twitter} />
                <SocialLink href="https://instagram.com" icon={Instagram} />
                <SocialLink href="https://linkedin.com" icon={Linkedin} />
              </div>
            </div>
            
            {/* 链接区域 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              <div>
                <h4 className="font-semibold mb-5 text-sm">产品</h4>
                <ul className="space-y-4">
                  <li><FooterLink href="/features">功能</FooterLink></li>
                  <li><FooterLink href="/download">下载</FooterLink></li>
                  <li><FooterLink href="/pricing">价格</FooterLink></li>
                  <li><FooterLink href="/roadmap">路线图</FooterLink></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-5 text-sm">资源</h4>
                <ul className="space-y-4">
                  <li><FooterLink href="/docs">文档</FooterLink></li>
                  <li><FooterLink href="/guides">指南</FooterLink></li>
                  <li><FooterLink href="/api">API</FooterLink></li>
                  <li><FooterLink href="/faq">常见问题</FooterLink></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-5 text-sm">公司</h4>
                <ul className="space-y-4">
                  <li><FooterLink href="/about">关于我们</FooterLink></li>
                  <li><FooterLink href="/blog">博客</FooterLink></li>
                  <li><FooterLink href="/contact">联系我们</FooterLink></li>
                  <li><FooterLink href="/careers">招聘</FooterLink></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 底部区域 - 版权和社交链接 */}
          <div className="pt-8 border-t border-[hsl(var(--border))/50] flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 md:mb-0">
              © {currentYear} Maestro. 保留所有权利。
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <FooterLink href="/terms">服务条款</FooterLink>
              <FooterLink href="/privacy">隐私政策</FooterLink>
              <FooterLink href="/cookies">Cookie 政策</FooterLink>
              <FooterLink href="/accessibility">无障碍</FooterLink>
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = "Footer";

export { Footer, FooterLink }; 