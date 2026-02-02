
import React, { useRef, useEffect, useState } from 'react';
import { ChatSession, Message, Attachment } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { v4 as uuidv4 } from 'uuid';
import { sendToWebhook } from '../services/webhookService';
import { Sparkles, ArrowDown, PanelLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChatAreaProps {
  session?: ChatSession;
  onNewChat: (text?: string, attachments?: Attachment[]) => void;
  updateMessages: (messages: Message[]) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  session,
  onNewChat,
  updateMessages,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { profile } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const processedSessions = useRef<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isTyping]);

  // Effect to automatically trigger webhook if a chat is started with a message
  useEffect(() => {
    const handleInitialMessage = async () => {
      if (
        session && 
        session.messages.length === 1 && 
        session.messages[0].role === 'user' && 
        !isTyping &&
        !processedSessions.current.has(session.id) &&
        profile
      ) {
        processedSessions.current.add(session.id);
        const userMsg = session.messages[0];
        
        setIsTyping(true);
        try {
          const responseText = await sendToWebhook(
            userMsg.content, 
            userMsg.attachments || [], 
            session.id,
            profile.id,
            profile.email
          );
          const assistantMessage: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: responseText,
            timestamp: Date.now(),
          };
          updateMessages([...session.messages, assistantMessage]);
        } catch (error) {
          const errorMessage: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: "Sorry, I encountered an error connecting to the service. Please try again.",
            timestamp: Date.now(),
          };
          updateMessages([...session.messages, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }
    };

    handleInitialMessage();
  }, [session?.id, session?.messages.length, profile]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (!profile) return;

    if (!session) {
      // Create new session with the initial message
      onNewChat(text, attachments);
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    const newMessages = [...session.messages, userMessage];
    updateMessages(newMessages);
    setIsTyping(true);

    try {
      const responseText = await sendToWebhook(
        text, 
        attachments, 
        session.id,
        profile.id,
        profile.email
      );
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };

      updateMessages([...newMessages, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "Sorry, I encountered an error connecting to the service. Please try again.",
        timestamp: Date.now(),
      };
      updateMessages([...newMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-50 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-transparent rounded-md border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <PanelLeft size={20} />
        </button>
      )}

      {!session ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-xl w-full flex flex-col items-center">
            <div className="w-16 h-16 mb-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg animate-pulse">
               <Sparkles size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              What's on your mind today?
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              somersetgrove chatbot is here to help you with your tasks, questions, and creative ideas.
            </p>
            
            <div className="w-full max-w-2xl px-4">
              <ChatInput onSend={handleSendMessage} disabled={isTyping} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-8 md:px-0 scroll-smooth"
          >
            <div className="max-w-3xl mx-auto space-y-8 pb-32">
              {session.messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-20 animate-fadeIn">
                  <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
                  <p className="text-gray-500">How can I help you today?</p>
                </div>
              )}
              
              {session.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isTyping && (
                <div className="flex gap-4 md:gap-6 group animate-fadeIn">
                  <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-sm bg-emerald-500 text-white shadow-sm font-bold text-xs">
                     SG
                  </div>
                  <div className="flex flex-col gap-1 w-full mt-1">
                    <div className="flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {showScrollButton && (
            <button 
              onClick={scrollToBottom}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-white dark:bg-[#343541] border border-gray-200 dark:border-gray-600 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-[#40414f] transition-colors z-10"
            >
              <ArrowDown size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}

          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#212121] dark:via-[#212121]/90 dark:to-transparent pb-8 pt-10 px-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSend={handleSendMessage} disabled={isTyping} />
              <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-3">
                somersetgrove chatbot can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
