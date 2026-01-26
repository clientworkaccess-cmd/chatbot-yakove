
import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { Attachment } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { fileToBase64 } from '../utils/fileUtils';

interface ChatInputProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((text.trim() || attachments.length > 0) && !disabled) {
      onSend(text, attachments);
      setText('');
      setAttachments([]);
      // Reset height
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    const newAttachments: Attachment[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is larger than 5MB.`);
        continue;
      }
      try {
        const base64Data = await fileToBase64(file);
        newAttachments.push({
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data
        });
      } catch (err) {
        console.error("Error processing file", err);
      }
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className={`relative transition-all ${isDragging ? 'ring-2 ring-blue-500 rounded-3xl p-1' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(Array.from(e.dataTransfer.files)); }}
    >
      <div className="flex flex-col gap-2 bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-gray-700 rounded-3xl shadow-[0_0_15px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {attachments.map((file) => (
              <div key={file.id} className="relative group p-2 pr-8 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs flex items-center gap-2">
                {file.type.startsWith('image/') ? (
                  <img src={file.data} className="w-6 h-6 object-cover rounded" />
                ) : (
                  <Paperclip size={14} className="text-gray-400" />
                )}
                <span className="truncate max-w-[120px] dark:text-gray-300">{file.name}</span>
                <button 
                  onClick={() => removeAttachment(file.id)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end p-2 md:p-3 pr-2">
          <div className="flex gap-1 mb-1">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title="Upload file (PDF, TXT, DOCX, Image)"
            >
              <Paperclip size={20} />
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              multiple 
              accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.docx"
              onChange={handleFileChange}
            />
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 max-h-[200px] resize-none bg-transparent border-0 focus:ring-0 text-gray-800 dark:text-gray-100 py-2.5 px-3 text-sm md:text-base outline-none"
            disabled={disabled}
          />

          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && attachments.length === 0)}
            className={`p-2.5 rounded-xl transition-all ${
              disabled || (!text.trim() && attachments.length === 0)
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-white bg-black dark:bg-white dark:text-black hover:opacity-80 scale-100 active:scale-90 shadow-md'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
