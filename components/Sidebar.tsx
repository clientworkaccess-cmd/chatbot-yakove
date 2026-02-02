
import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Moon, 
  Sun, 
  PanelLeft, 
  Check, 
  X,
  Search,
  LogOut,
  Shield,
  Briefcase
} from 'lucide-react';
import { ChatSession } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenAdmin?: () => void;
  onOpenTaskUpdate?: () => void;
  activeView?: 'chat' | 'admin' | 'task-update';
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  setCurrentSessionId,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onClearAll,
  isOpen,
  setIsOpen,
  isDarkMode,
  toggleTheme,
  onOpenAdmin,
  onOpenTaskUpdate,
  activeView
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { signOut, isAdmin, profile } = useAuth();

  const handleStartEdit = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditValue(session.title);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editValue.trim()) {
      onRenameChat(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside 
      className={`relative h-full bg-[#f9f9f9] dark:bg-[#171717] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
        isOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-[260px] flex flex-col h-full">
        <div className="p-3 flex items-center justify-between">
          <button 
            onClick={onNewChat}
            className="flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-800 dark:text-white bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors"
          >
            <Plus size={16} />
            New chat
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="ml-2 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-md transition-colors"
          >
            <PanelLeft size={18} />
          </button>
        </div>

        <div className="px-3 mb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#2d2d2d] text-sm text-gray-900 dark:text-white py-2 pl-9 pr-3 rounded-md border border-transparent focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {/* Tool Section (Only for non-admins) */}
          {!isAdmin && onOpenTaskUpdate && (
            <div className="mb-4">
               <div className="px-3 py-2 mt-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Tools
              </div>
              
              <div 
                onClick={onOpenTaskUpdate}
                className={`group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  activeView === 'task-update'
                    ? 'bg-gray-200 dark:bg-[#2d2d2d] text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#212121]'
                }`}
              >
                <Briefcase size={16} className="shrink-0" />
                <span className="flex-1 text-sm">Task Update</span>
              </div>
            </div>
          )}

          <div className="px-3 py-2 mt-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Your chats
          </div>
          {filteredSessions.length === 0 ? (
            <div className="px-3 py-4 text-xs text-gray-400 italic">
              No chats found
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  activeView === 'chat' && currentSessionId === session.id 
                    ? 'bg-gray-200 dark:bg-[#2d2d2d] text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#212121]'
                }`}
              >
                <MessageSquare size={16} className="shrink-0" />
                
                {editingId === session.id ? (
                  <input 
                    autoFocus
                    className="bg-transparent border-b border-blue-500 outline-none flex-1 text-sm overflow-hidden whitespace-nowrap"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(e as any)}
                  />
                ) : (
                  <span className="flex-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                    {session.title}
                  </span>
                )}

                <div className={`absolute right-2 flex items-center gap-1 ${
                  editingId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'
                }`}>
                  {editingId === session.id ? (
                    <>
                      <button onClick={handleSaveEdit} className="p-1 hover:text-green-500">
                        <Check size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => handleStartEdit(session, e)} className="p-1 hover:text-blue-500">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteChat(session.id); }} className="p-1 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {isAdmin && (
            <button 
              onClick={onOpenAdmin}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors font-medium ${
                activeView === 'admin' ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/10' : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              <Shield size={16} />
              Admin Dashboard
            </button>
          )}

          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-md transition-colors"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
          
          <button 
            onClick={onClearAll}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-md transition-colors"
          >
            <Trash2 size={16} />
            Clear conversations
          </button>
          
          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
            <div className="px-3 py-2 flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {profile?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                {profile?.full_name && (
                  <p className="text-xs font-semibold truncate text-gray-800 dark:text-gray-100">{profile.full_name}</p>
                )}
                <p className="text-[10px] truncate text-gray-500 dark:text-gray-400">{profile?.email}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-md transition-colors"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
