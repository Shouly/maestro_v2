"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Settings, Command } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MainNavigationProps {
  currentPath: string;
  onOpenSettings: () => void;
}

export function MainNavigation({ currentPath, onOpenSettings }: MainNavigationProps) {
  return (
    <div className={cn(
      "w-20 border-r bg-[hsl(var(--secondary))] hidden md:flex md:flex-col items-center",
      "transition-all duration-300 ease-in-out"
    )}>
      {/* Logo */}
      <div className="flex flex-col items-center py-6">
        <Link href="/" className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-sm mb-1">
            <Command className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium mt-1">Maestro</span>
        </Link>
      </div>
      
      {/* 主导航菜单 */}
      <div className="flex-1 w-full py-4">
        <nav className="flex flex-col items-center space-y-4">
          <Link href="/" className="w-full flex flex-col items-center px-2">
            <Button 
              variant="ghost" 
              className={cn(
                "w-12 h-12 rounded-xl flex flex-col justify-center items-center p-0",
                currentPath === "/" && "bg-[hsl(var(--accent))]"
              )} 
              size="sm"
            >
              <ArrowLeft className="w-5 h-5 mb-1" />
              <span className="text-xs">首页</span>
            </Button>
          </Link>
          <Link href="/chat" className="w-full flex flex-col items-center px-2">
            <Button 
              variant="ghost" 
              className={cn(
                "w-12 h-12 rounded-xl flex flex-col justify-center items-center p-0",
                currentPath === "/chat" && "bg-[hsl(var(--accent))]"
              )} 
              size="sm"
            >
              <MessageSquare className="w-5 h-5 mb-1" />
              <span className="text-xs">对话</span>
            </Button>
          </Link>
          <div className="w-full flex flex-col items-center px-2">
            <Button 
              variant="ghost" 
              className="w-12 h-12 rounded-xl flex flex-col justify-center items-center p-0" 
              size="sm"
              onClick={onOpenSettings}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-xs">设置</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
} 