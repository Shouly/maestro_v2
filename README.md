# Maestro

Maestro是一个使用Tauri和Rust构建的跨平台桌面应用，通过Claude AI模型控制计算机执行各种任务。

## 技术栈

### 前端技术栈

- **Next.js** (v15) - React框架，提供路由、服务端渲染和优化
- **React** (v18+) - 用户界面库，构建交互式UI组件
- **Tailwind CSS** (v3.4+) - 实用优先的CSS框架，快速构建自定义设计
- **shadcn/ui** - 基于Radix UI的高质量组件库，提供可访问性和可定制性
- **Lucide React** - 简洁一致的图标库
- **Framer Motion** - 强大的动画库，提供流畅的过渡效果
- **Bun** - JavaScript运行时和包管理器

### 后端技术栈

- **Tauri** (2.0) - 跨平台桌面应用框架，连接Web前端和Rust后端
- **Rust** (2021 Edition) - 系统编程语言，提供安全性和性能
- **tokio** - 异步运行时，处理并发操作
- **screenshots** - 屏幕捕获库
- **enigo** - 键盘和鼠标控制库
- **reqwest** - HTTP客户端，与Anthropic API通信
- **serde** - 序列化和反序列化库
- **rusqlite** - SQLite数据库连接库

## 开发

### 安装依赖

```bash
# 安装前端依赖
bun install

# 安装Rust依赖
cd src-tauri
cargo build
```

### 开发模式

```bash
# 启动开发服务器
bun run tauri dev
```

### 构建应用

```bash
# 构建生产版本
bun run tauri build
```

## 功能

- 通过Claude AI模型控制计算机
- 屏幕捕获和分析
- 键盘和鼠标控制
- 命令行执行
- 文件编辑

## 许可证

MIT
