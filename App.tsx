
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatSession, Message, Attachment } from './types';
import { v4 as uuidv4 } from 'uuid';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Loader2, Lock, AlertTriangle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'somersetgrove_chat_sessions';
const THEME_KEY = 'somersetgrove_theme';

const MainApp: React.FC = () => {
  const { session, loading, isApproved, isAdmin, signOut, error: authError } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  // Initialize data from local storage
  useEffect(() => {
    const storedSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }

    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light') {
      setIsDarkMode(false);
    }
  }, []);

  // Sync sessions to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Sync theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const createNewChat = useCallback((initialText?: string, attachments: Attachment[] = []) => {
    const newId = uuidv4();
    const userMessages: Message[] = initialText ? [{
      id: uuidv4(),
      role: 'user',
      content: initialText,
      timestamp: Date.now(),
      attachments,
    }] : [];

    const newSession: ChatSession = {
      id: newId,
      title: initialText ? initialText.substring(0, 30) : 'New chat',
      messages: userMessages,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  }, [currentSessionId]);

  const renameSession = useCallback((id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  }, []);

  const updateMessages = useCallback((sessionId: string, newMessages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const title = s.title === 'New chat' && newMessages.length > 0 
          ? newMessages[0].content.substring(0, 30) 
          : s.title;
        return { 
          ...s, 
          messages: newMessages, 
          title,
          lastUpdated: Date.now() 
        };
      }
      return s;
    }));
  }, []);

  const clearAllChats = useCallback(() => {
    if (confirm('Are you sure you want to clear all conversations?')) {
      setSessions([]);
      setCurrentSessionId(null);
    }
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#212121]">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  // 2. Not Logged In
  if (!session) {
    return <AuthScreen />;
  }

  // 3. Database Error (e.g., Infinite Recursion)
  if (authError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#212121] p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Error</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          {authError}
        </p>
        <p className="text-sm text-gray-400 mb-8 max-w-md">
          This usually happens if the Database Row Level Security (RLS) policies are configured incorrectly. Please run the SQL fix provided in the chat.
        </p>
        <button 
          onClick={() => signOut()}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // 4. Logged in, but not approved
  if (!isApproved) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#212121] p-6 text-center">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mb-6">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Pending Approval</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          Your account has been created but requires administrator approval before you can access the chat application. Please check back later.
        </p>
        <button 
          onClick={() => signOut()}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // 5. Admin Dashboard
  if (showAdmin && isAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  // 6. Main Chat App
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#212121]">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        onNewChat={() => createNewChat()}
        onDeleteChat={deleteSession}
        onRenameChat={renameSession}
        onClearAll={clearAllChats}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenAdmin={() => setShowAdmin(true)}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <ChatArea 
          session={currentSession}
          onNewChat={createNewChat}
          updateMessages={(msgs) => currentSessionId && updateMessages(currentSessionId, msgs)}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
