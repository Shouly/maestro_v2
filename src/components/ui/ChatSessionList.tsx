import React from 'react';
import { MessageSquare, Plus, MoreVertical, Trash2, Edit, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  isActive: boolean;
}

interface ChatSessionListProps {
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onExportSession: (sessionId: string) => void;
  className?: string;
}

export const ChatSessionList: React.FC<ChatSessionListProps> = ({
  sessions,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onExportSession,
  className,
}) => {
  const [menuOpen, setMenuOpen] = React.useState<string | null>(null);
  const [editingSession, setEditingSession] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  
  const handleRename = (sessionId: string) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
      setEditingSession(null);
    }
  };
  
  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSession(session.id);
    setEditTitle(session.title);
    setMenuOpen(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      handleRename(sessionId);
    } else if (e.key === 'Escape') {
      setEditingSession(null);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 新建会话按钮 */}
      <button
        onClick={onCreateSession}
        className="flex items-center justify-center w-full p-3 mb-4 border border-dashed rounded-lg border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5] transition-colors group"
      >
        <Plus className="w-5 h-5 mr-2 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
        <span className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]">新建会话</span>
      </button>
      
      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
            <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
            <p>没有会话记录</p>
            <p className="text-sm">点击上方按钮创建新会话</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.id} className="relative">
                <div
                  onClick={() => {
                    if (editingSession !== session.id) {
                      onSelectSession(session.id);
                      setMenuOpen(null);
                    }
                  }}
                  className={cn(
                    "flex items-center p-3 rounded-lg cursor-pointer group",
                    session.isActive
                      ? "bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))]"
                      : "hover:bg-[hsl(var(--accent))/50] text-[hsl(var(--foreground))]"
                  )}
                >
                  <MessageSquare className="w-5 h-5 mr-3 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    {editingSession === session.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleRename(session.id)}
                        onKeyDown={(e) => handleKeyDown(e, session.id)}
                        autoFocus
                        className="w-full bg-transparent border-b border-[hsl(var(--primary))] focus:outline-none"
                      />
                    ) : (
                      <>
                        <div className="font-medium truncate">{session.title}</div>
                        {session.lastMessage && (
                          <div className="text-xs truncate text-[hsl(var(--muted-foreground))]">
                            {session.lastMessage}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {!editingSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === session.id ? null : session.id);
                      }}
                      className={cn(
                        "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                        menuOpen === session.id ? "opacity-100 bg-[hsl(var(--accent))]" : ""
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* 下拉菜单 */}
                  {menuOpen === session.id && (
                    <div className="absolute right-0 z-10 mt-1 bg-[hsl(var(--background))] border rounded-md shadow-lg top-full w-48">
                      <ul className="py-1">
                        <li>
                          <button
                            onClick={(e) => startEditing(session, e)}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            重命名
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onExportSession(session.id);
                              setMenuOpen(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            导出会话
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                              setMenuOpen(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除会话
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 