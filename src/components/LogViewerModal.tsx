import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import LogViewer from './LogViewer';
import { Button } from './ui/Button';

interface LogViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const LogViewerModal: React.FC<LogViewerModalProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={cn(
        "bg-[hsl(var(--background))] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto",
        className
      )}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">应用程序日志</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[hsl(var(--accent))]"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 日志查看器 */}
        <div className="p-6">
          <LogViewer />
        </div>
        
        {/* 底部按钮 */}
        <div className="flex justify-end px-6 py-4 border-t">
          <Button
            variant="primary"
            onClick={onClose}
          >
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogViewerModal; 