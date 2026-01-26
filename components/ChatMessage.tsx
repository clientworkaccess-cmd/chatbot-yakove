
import React, { useState } from 'react';
import { Message, Attachment } from '../types';
import { Copy, Check, FileText, Image as ImageIcon, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderAttachments = (attachments: Attachment[]) => {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {attachments.map((file) => {
          const isImage = file.type.startsWith('image/');
          return (
            <div key={file.id} className="relative group overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#2d2d2d] hover:bg-gray-100 dark:hover:bg-[#3d3d3d] transition-all">
              {isImage ? (
                <div className="w-32 h-32 flex items-center justify-center overflow-hidden">
                  <img src={file.data} alt={file.name} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="p-3 flex items-center gap-3 w-48">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <a href={file.data} download={file.name} className="p-2 bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 shadow-lg">
                  <Download size={16} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex gap-4 md:gap-6 group transition-colors ${
      isAssistant ? '' : 'justify-end'
    }`}>
      {isAssistant && (
        <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-sm bg-emerald-500 text-white shadow-sm font-bold text-xs">
          SG
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[85%] ${!isAssistant ? 'items-end' : ''}`}>
        <div className={`${
          isAssistant 
            ? 'w-full text-gray-800 dark:text-gray-200 leading-relaxed' 
            : 'px-4 py-3 bg-gray-100 dark:bg-[#2f2f2f] text-gray-800 dark:text-gray-200 rounded-2xl shadow-sm'
        }`}>
          <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div className="relative my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#0d0d0d] text-xs text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <span>{match ? match[1] : 'code'}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(String(children));
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <code 
                        className="block p-4 overflow-x-auto text-sm bg-white dark:bg-[#1a1a1a]" 
                        {...props}
                      >
                        {children}
                      </code>
                    </div>
                  ) : (
                    <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          {message.attachments && message.attachments.length > 0 && renderAttachments(message.attachments)}
        </div>
        
        {isAssistant && message.content && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
            <button 
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Copy message"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-sm font-bold text-xs">
          ME
        </div>
      )}
    </div>
  );
};
