"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Settings, Command, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onOpenSettings: () => void;
}

export function MobileNavigation({ 
  isOpen, 
  onClose, 
  currentPath, 
  onOpenSettings 
}: MobileNavigationProps) {
  return (
    <div className={cn(
      "fixed inset-0 z-40 w-72 border-r bg-[hsl(var(--secondary))] md:hidden",
      "transform transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo和关闭按钮 */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-sm">
            <Command className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base">Maestro</span>
        </Link>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-[hsl(var(--accent))]"
          aria-label="关闭侧边栏"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* 主导航菜单 - 移动版 */}
      <div className="p-3 border-b">
        <nav className="space-y-1">
          <Link href="/">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start",
                currentPath === "/" && "bg-[hsl(var(--accent))]"
              )} 
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              首页
            </Button>
          </Link>
          <Link href="/chat">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start",
                currentPath === "/chat" && "bg-[hsl(var(--accent))]"
              )} 
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              对话
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            size="sm"
            onClick={onOpenSettings}
          >
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
        </nav>
      </div>
    </div>
  );
} 