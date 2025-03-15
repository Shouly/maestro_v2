import { Cpu, Globe, Shield, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/layout/Hero';
import { FeatureCard } from '@/components/ui/FeatureCard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[hsl(var(--background))]">
      {/* 导航栏 */}
      <Navbar />
      
      {/* 英雄区域 */}
      <Hero
        className="mt-16"
        badge="全新发布 v1.0"
        title="AI驱动的计算机控制"
        description="Maestro 使用 Tauri 和 Rust 构建，通过 Claude AI 模型让您的计算机执行各种任务，提高工作效率"
        primaryAction={{
          text: "立即下载",
          href: "#download"
        }}
        secondaryAction={{
          text: "查看文档",
          href: "#docs"
        }}
        image={
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
        }
      />
      
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
            <FeatureCard
              icon={Cpu}
              title="AI 智能控制"
              description="通过 Claude AI 模型智能控制您的计算机，执行各种复杂任务"
              hover="scale"
            />
            
            <FeatureCard
              icon={Globe}
              title="跨平台支持"
              description="支持 Windows、macOS 和 Linux，提供一致的用户体验"
              iconColor="hsl(var(--accent))"
              iconBgColor="hsl(var(--accent)/0.1)"
              hover="scale"
            />
            
            <FeatureCard
              icon={Shield}
              title="安全可靠"
              description="基于 Rust 构建，提供高性能和安全性，保护您的数据隐私"
              hover="scale"
            />
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
      <Footer simplified />
    </main>
  );
} 