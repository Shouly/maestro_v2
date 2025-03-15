import { Cpu, Sparkles, Zap, Globe, Command, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-16 px-6 bg-[hsl(var(--background))]">
      {/* 顶部导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[hsl(var(--background))/80] border-b border-[hsl(var(--border))] py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
              <Command className="w-5 h-5 text-white m-1.5" />
            </div>
            <span className="font-bold text-lg">Maestro</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-sm font-medium hover:text-[hsl(var(--primary))] transition-colors">功能</a>
            <a href="#" className="text-sm font-medium hover:text-[hsl(var(--primary))] transition-colors">文档</a>
            <a href="#" className="text-sm font-medium hover:text-[hsl(var(--primary))] transition-colors">下载</a>
            <a href="#" className="text-sm font-medium hover:text-[hsl(var(--primary))] transition-colors">关于</a>
          </div>
          <button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-md text-sm font-medium hover:bg-[hsl(var(--primary))/90] transition-colors">
            开始使用
          </button>
        </div>
      </nav>
      
      {/* 英雄区域 */}
      <div className="w-full max-w-6xl mx-auto mt-16 mb-24 text-center">
        <div className="inline-block mb-6 p-2 bg-[hsl(var(--secondary))] rounded-full">
          <div className="flex items-center space-x-2 px-3 py-1 bg-[hsl(var(--background))] rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></span>
            <span className="text-sm font-medium">全新发布 v1.0</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
            AI驱动的计算机控制
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto mb-10">
          Maestro 使用 Tauri 和 Rust 构建，通过 Claude AI 模型让您的计算机执行各种任务，提高工作效率
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-6 py-3 rounded-lg font-medium hover:bg-[hsl(var(--primary))/90] transition-colors">
            立即下载
          </button>
          <button className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-6 py-3 rounded-lg font-medium hover:bg-[hsl(var(--secondary))/90] transition-colors">
            查看文档
          </button>
        </div>
        
        <div className="relative mx-auto w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))/20] to-[hsl(var(--accent))/20]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[hsl(var(--background))/80] backdrop-blur-md p-8 rounded-lg shadow-lg text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--primary))]" />
              <h3 className="text-xl font-semibold mb-2">应用界面预览</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">即将推出演示视频</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 特性部分 */}
      <div className="w-full bg-[hsl(var(--secondary))] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">强大功能，简洁界面</h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Maestro 提供了一系列强大的功能，帮助您更高效地完成工作
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[hsl(var(--background))] p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[hsl(var(--primary))/10] flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI 智能控制</h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                通过 Claude AI 模型智能控制您的计算机，执行各种复杂任务
              </p>
            </div>
            
            <div className="bg-[hsl(var(--background))] p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[hsl(var(--accent))/10] flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-[hsl(var(--accent))]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">跨平台支持</h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                支持 Windows、macOS 和 Linux，提供一致的用户体验
              </p>
            </div>
            
            <div className="bg-[hsl(var(--background))] p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[hsl(var(--primary))/10] flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">安全可靠</h3>
              <p className="text-[hsl(var(--muted-foreground))]">
                基于 Rust 构建，提供高性能和安全性，保护您的数据隐私
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部 CTA */}
      <div className="w-full max-w-6xl mx-auto py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">准备好开始使用 Maestro 了吗？</h2>
        <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-8">
          加入我们，探索 AI 驱动的计算机控制的无限可能
        </p>
        <button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-8 py-3 rounded-lg font-medium hover:bg-[hsl(var(--primary))/90] transition-colors">
          立即下载
        </button>
      </div>
      
      {/* 页脚 */}
      <footer className="w-full border-t border-[hsl(var(--border))] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
              <Command className="w-4 h-4 text-white m-1" />
            </div>
            <span className="font-medium">Maestro</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">GitHub</a>
            <a href="#" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">文档</a>
            <a href="#" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">隐私政策</a>
          </div>
        </div>
      </footer>
    </main>
  );
} 