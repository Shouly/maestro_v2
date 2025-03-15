import { Cpu, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <div className="flex items-center justify-center bg-gradient-to-b from-primary to-secondary p-8 rounded-full mb-8">
          <Sparkles className="h-16 w-16 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">欢迎使用 Maestro</h1>
        <p className="text-xl text-center mb-8">
          使用Tauri和Rust构建的跨平台桌面应用，通过Claude AI模型控制计算机执行各种任务
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="border border-border rounded-lg p-6 flex flex-col items-center text-center">
            <Cpu className="h-8 w-8 mb-4" />
            <h2 className="text-xl font-semibold mb-2">强大的AI控制</h2>
            <p className="text-muted-foreground">
              通过Claude AI模型智能控制您的计算机，执行各种复杂任务
            </p>
          </div>
          <div className="border border-border rounded-lg p-6 flex flex-col items-center text-center">
            <Sparkles className="h-8 w-8 mb-4" />
            <h2 className="text-xl font-semibold mb-2">跨平台支持</h2>
            <p className="text-muted-foreground">
              支持Windows、macOS和Linux，提供一致的用户体验
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 