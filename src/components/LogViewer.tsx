import React, { useState, useEffect } from 'react';
import { core } from '@tauri-apps/api';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

const { invoke } = core;

/**
 * 日志查看器组件
 * 用于显示应用程序日志
 */
const LogViewer: React.FC = () => {
  const [logContent, setLogContent] = useState<string>('');
  const [logPath, setLogPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 加载日志内容
  const loadLogContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 获取当前日志文件路径
      const path = await invoke<string>('get_log_file_path');
      setLogPath(path);
      
      try {
        // 读取日志文件内容
        const content = await invoke<string>('read_log_file');
        setLogContent(content);
      } catch (err) {
        console.error('读取日志文件失败:', err);
        setError(`无法读取日志文件: ${err}`);
        setLogContent('');
      }
    } catch (err) {
      console.error('获取日志文件路径失败:', err);
      setError(`无法获取日志文件路径: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载日志
  useEffect(() => {
    loadLogContent();
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">应用程序日志</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={loadLogContent}
          disabled={loading}
          className="flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-[hsl(var(--primary))] rounded-full"></div>
            <div className="h-2 w-2 bg-[hsl(var(--primary))] rounded-full"></div>
            <div className="h-2 w-2 bg-[hsl(var(--primary))] rounded-full"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] p-4 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium">加载日志失败</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">日志文件路径: {logPath}</p>
          <div className="relative">
            <pre className="bg-[hsl(var(--secondary))] p-4 rounded-md overflow-auto max-h-[500px] text-xs leading-relaxed whitespace-pre-wrap break-all">
              {logContent || '日志为空'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogViewer; 