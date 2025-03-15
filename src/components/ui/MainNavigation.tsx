"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Settings, Command, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MainNavigationProps {
  currentPath: string;
  onOpenSettings: () => void;
}

export function MainNavigation({ currentPath, onOpenSettings }: MainNavigationProps) {
  return (
    <div className={cn(
      "w-16 border-r bg-[hsl(var(--background))] hidden md:flex md:flex-col items-center",
      "transition-all duration-300 ease-in-out"
    )}>
      {/* Logo */}
      <div className="flex flex-col items-center py-6 w-full border-b">
        <Link href="/" className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow">
            <Command className="w-5 h-5 text-white" />
          </div>
        </Link>
      </div>
      
      {/* 主导航菜单 */}
      <div className="flex-1 w-full py-6 flex flex-col items-center">
        <nav className="flex flex-col items-center space-y-6 w-full">
          <Link href="/" className="w-full flex justify-center">
            <div className="group relative flex items-center justify-center">
              <div 
                className={cn(
                  "w-10 h-10 rounded-xl flex justify-center items-center transition-all",
                  currentPath === "/" 
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" 
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                )}
              >
                <Home className="w-5 h-5" />
              </div>
              
              {/* 悬停提示 */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-[hsl(var(--popover))] rounded-md text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity shadow-md whitespace-nowrap z-50">
                首页
              </div>
            </div>
          </Link>
          
          <Link href="/chat" className="w-full flex justify-center">
            <div className="group relative flex items-center justify-center">
              <div 
                className={cn(
                  "w-10 h-10 rounded-xl flex justify-center items-center transition-all",
                  currentPath === "/chat" 
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" 
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                )}
              >
                <MessageSquare className="w-5 h-5" />
              </div>
              
              {/* 悬停提示 */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-[hsl(var(--popover))] rounded-md text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity shadow-md whitespace-nowrap z-50">
                对话
              </div>
            </div>
          </Link>
        </nav>
      </div>
      
      {/* 底部设置按钮 */}
      <div className="w-full py-6 flex justify-center border-t">
        <div 
          className="group relative flex items-center justify-center cursor-pointer"
          onClick={onOpenSettings}
        >
          <div className="w-10 h-10 rounded-xl flex justify-center items-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-all">
            <Settings className="w-5 h-5" />
          </div>
          
          {/* 悬停提示 */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-[hsl(var(--popover))] rounded-md text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity shadow-md whitespace-nowrap z-50">
            设置
          </div>
        </div>
      </div>
    </div>
  );
} 