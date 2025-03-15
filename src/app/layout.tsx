import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '../styles/globals.css';

// 使用Poppins字体，这是Canva常用的现代无衬线字体
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Maestro',
  description: '使用Tauri和Rust构建的跨平台桌面应用，通过Claude AI模型控制计算机执行各种任务',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={poppins.variable}>
      <body className={`font-sans antialiased ${poppins.className}`}>
        {children}
      </body>
    </html>
  );
} 