"use client";

import { Cpu, Globe, Shield, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/layout/Hero';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { Button } from '@/components/ui/Button';

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
          <div className="relative mx-auto w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-lg">
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
      <div className="w-full bg-[hsl(var(--secondary))] py-24 relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute -z-10 top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-[hsl(var(--primary))/10] to-transparent rounded-full blur-3xl" />
        <div className="absolute -z-10 bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-[hsl(var(--accent))/10] to-transparent rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1.5 bg-[hsl(var(--background))] rounded-full text-sm font-medium shadow-sm">
              强大功能
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">简洁界面，强大功能</h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Maestro 提供了一系列强大的功能，帮助您更高效地完成工作
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Cpu}
              title="AI 智能控制"
              description="通过 Claude AI 模型智能控制您的计算机，执行各种复杂任务，提高工作效率"
              hover="scale"
            />
            
            <FeatureCard
              icon={Globe}
              title="跨平台支持"
              description="支持 Windows、macOS 和 Linux，提供一致的用户体验，随时随地使用"
              iconColor="hsl(var(--accent))"
              iconBgColor="hsl(var(--accent)/0.1)"
              hover="scale"
            />
            
            <FeatureCard
              icon={Shield}
              title="安全可靠"
              description="基于 Rust 构建，提供高性能和安全性，保护您的数据隐私，让您安心使用"
              hover="scale"
            />
          </div>
        </div>
      </div>
      
      {/* 功能亮点部分 */}
      <div className="w-full py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <div className="inline-block mb-4 px-4 py-1.5 bg-[hsl(var(--secondary))] rounded-full text-sm font-medium">
                为什么选择 Maestro
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">让 AI 成为您的<br />得力助手</h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-8">
                Maestro 通过 Claude AI 模型让您的计算机执行各种任务，提高工作效率。无论是文件管理、数据分析还是自动化工作流程，Maestro 都能帮您轻松完成。
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 h-5 w-5 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center">
                    <Check className="h-3 w-3 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1">自然语言控制</h4>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">使用自然语言描述您的需求，Maestro 会自动执行相应操作</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 mt-1 h-5 w-5 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center">
                    <Check className="h-3 w-3 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1">自动化工作流</h4>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">创建自定义工作流，自动执行重复性任务，节省宝贵时间</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 mt-1 h-5 w-5 rounded-full bg-[hsl(var(--primary))/10] flex items-center justify-center">
                    <Check className="h-3 w-3 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1">持续更新</h4>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">我们不断改进 Maestro，添加新功能和优化性能</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <Button variant="gradient" rounded="full" size="lg" className="group">
                  了解更多功能
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="relative z-10 bg-[hsl(var(--card))] rounded-xl shadow-lg p-6 md:p-8 border border-[hsl(var(--border))]">
                <div className="absolute -z-10 -inset-4 bg-gradient-to-r from-[hsl(var(--primary))/20] to-[hsl(var(--accent))/20] rounded-xl blur-xl opacity-50"></div>
                <div className="aspect-video bg-[hsl(var(--secondary))] rounded-lg mb-6 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-[hsl(var(--primary))] opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">智能界面</h3>
                <p className="text-[hsl(var(--muted-foreground))] mb-4">
                  Maestro 提供直观的用户界面，让您轻松与 AI 交互，执行各种任务。
                </p>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="group">
                    查看演示
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
              
              <div className="absolute top-1/4 -right-4 w-24 h-24 rounded-full bg-[hsl(var(--primary))/10] animate-float" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1/4 -left-4 w-16 h-16 rounded-full bg-[hsl(var(--accent))/10] animate-float" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部 CTA */}
      <div className="w-full max-w-7xl mx-auto py-24 px-6 text-center relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute -z-10 top-0 left-0 w-full h-full bg-[hsl(var(--secondary))/50] rounded-3xl"></div>
        <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[hsl(var(--primary))/5] to-[hsl(var(--accent))/5] rounded-3xl"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-block mb-6 px-4 py-1.5 bg-[hsl(var(--background))] rounded-full text-sm font-medium shadow-sm">
            开始使用 Maestro
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            准备好提升您的工作效率了吗？
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10">
            加入我们，探索 AI 驱动的计算机控制的无限可能，让 Maestro 成为您的智能助手
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="gradient" rounded="full" className="group">
              立即下载
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" rounded="full">
              查看文档
            </Button>
          </div>
        </div>
      </div>
      
      {/* 页脚 */}
      <Footer simplified />
    </main>
  );
} 