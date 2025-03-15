"use client";

import { cn } from '@/lib/utils';
import { Command, Home, MessageSquare, Settings, X } from 'lucide-react';
import Link from 'next/link';

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
      "fixed inset-0 z-40 w-[280px] border-r bg-[hsl(var(--background))] md:hidden",
      "transform transition-transform duration-300 ease-in-out shadow",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo和关闭按钮 */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow">
            <Command className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg">Maestro</span>
        </Link>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[hsl(var(--secondary))] transition-colors"
          aria-label="关闭侧边栏"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 主导航菜单 - 移动版 */}
      <div className="p-3">
        <nav className="space-y-1">
          <Link href="/" className="block">
            <div
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-colors",
                currentPath === "/"
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
              )}
            >
              <Home className="w-5 h-5 mr-3" />
              <span className="font-medium">首页</span>
            </div>
          </Link>

          <Link href="/chat" className="block">
            <div
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-colors",
                currentPath === "/chat"
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
              )}
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              <span className="font-medium">对话</span>
            </div>
          </Link>

          <div
            className="flex items-center px-3 py-2.5 rounded-lg transition-colors text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] cursor-pointer"
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">设置</span>
          </div>
        </nav>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-[hsl(var(--background))]">
        <div className="flex items-center justify-center text-xs text-[hsl(var(--muted-foreground))]">
          <Command className="w-3 h-3 mr-1 opacity-70" />
          <span>Maestro AI 助手 © 2025</span>
        </div>
      </div>
    </div>
  );
} 