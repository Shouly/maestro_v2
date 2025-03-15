import { Cpu, Sparkles, Zap, Globe, Palette, Layers } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[hsl(var(--background))]">
      {/* 顶部装饰元素 */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--primary))]"></div>
      
      <div className="z-10 max-w-6xl w-full items-center justify-center font-sans text-sm flex flex-col">
        {/* 标志和标题区域 */}
        <div className="flex items-center justify-center bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-8 rounded-2xl mb-10 shadow-lg transform hover:scale-105 transition-transform duration-300">
          <Sparkles className="h-16 w-16 text-white" />
        </div>
        
        <h1 className="text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
          欢迎使用 Maestro
        </h1>
        
        <p className="text-xl text-center mb-12 max-w-3xl">
          使用Tauri和Rust构建的跨平台桌面应用，通过Claude AI模型控制计算机执行各种任务
        </p>
        
        {/* 特性卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="bg-[hsl(var(--card))] rounded-2xl p-8 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-[hsl(var(--primary))]">
            <div className="bg-[hsl(var(--primary)/0.1)] p-4 rounded-full mb-6">
              <Cpu className="h-8 w-8 text-[hsl(var(--primary))]" />
            </div>
            <h2 className="text-xl font-semibold mb-3">强大的AI控制</h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              通过Claude AI模型智能控制您的计算机，执行各种复杂任务
            </p>
          </div>
          
          <div className="bg-[hsl(var(--card))] rounded-2xl p-8 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-[hsl(var(--accent))]">
            <div className="bg-[hsl(var(--accent)/0.1)] p-4 rounded-full mb-6">
              <Globe className="h-8 w-8 text-[hsl(var(--accent))]" />
            </div>
            <h2 className="text-xl font-semibold mb-3">跨平台支持</h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              支持Windows、macOS和Linux，提供一致的用户体验
            </p>
          </div>
          
          <div className="bg-[hsl(var(--card))] rounded-2xl p-8 flex flex-col items-center text-center shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-[hsl(var(--primary))]">
            <div className="bg-[hsl(var(--primary)/0.1)] p-4 rounded-full mb-6">
              <Zap className="h-8 w-8 text-[hsl(var(--primary))]" />
            </div>
            <h2 className="text-xl font-semibold mb-3">高效工作流</h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              自动化重复性任务，提高工作效率，释放创造力
            </p>
          </div>
        </div>
        
        {/* 底部装饰和CTA */}
        <div className="mt-16 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-10 rounded-2xl w-full max-w-5xl text-white text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">准备好开始使用 Maestro 了吗？</h2>
          <p className="mb-6">探索AI驱动的计算机控制的无限可能</p>
          <button className="bg-white text-[hsl(var(--primary))] font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-colors duration-300 shadow-md">
            开始体验
          </button>
        </div>
      </div>
      
      {/* 底部装饰元素 */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--primary))] to-[hsl(var(--accent))]"></div>
    </main>
  );
} 