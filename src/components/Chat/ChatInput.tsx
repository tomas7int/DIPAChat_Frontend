import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowUpIcon, Paperclip, Brain } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { AITrainingModal } from './AITrainingModal';

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      // Temporarily shrink to get the right scrollHeight
      textarea.style.height = `${minHeight}px`;

      // Calculate new height
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    // Set initial height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAITrainingModal, setShowAITrainingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, loading } = useChat();
  const { t } = useLanguage();

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || loading) return;

    const messageToSend = message.trim();
    setMessage('');
    adjustHeight(true);
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        handleSubmit();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, DOCX, and TXT files are supported');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    // TODO: Implement file upload to backend
    toast.success('File upload will be implemented with backend integration');
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="px-4 pt-4 pb-4 bg-gray-950">
      <div className="relative bg-gray-900 rounded-xl border border-gray-800">
        <div className="overflow-y-auto">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('askQuestion')}
            disabled={loading}
            className={cn(
              'w-full px-4 py-3',
              'resize-none',
              'bg-transparent',
              'border-none',
              'text-gray-100 text-base',
              'focus:outline-none',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-gray-500 placeholder:text-base',
              'min-h-[60px]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{
              overflow: 'hidden',
            }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isUploading}
              className="group p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4 text-gray-200" />
              <span className="text-xs text-gray-400 hidden group-hover:inline transition-opacity">
                {t('attach')}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {/* Train AI Button */}
            <button
              type="button"
              onClick={() => setShowAITrainingModal(true)}
              disabled={loading}
              className="group p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              aria-label="Train AI preferences"
              title="Train AI"
            >
              <Brain className="w-4 h-4 text-gray-200" />
              <span className="text-xs text-gray-400 hidden group-hover:inline transition-opacity">
                {t('trainAI')}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!message.trim() || loading}
              className={cn(
                'px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-gray-700 hover:border-gray-600 hover:bg-gray-800 flex items-center justify-between gap-1',
                message.trim()
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-400',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Send message"
            >
              <ArrowUpIcon
                className={cn(
                  'w-4 h-4',
                  message.trim() ? 'text-gray-900' : 'text-gray-400'
                )}
              />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>
      </div>

      <AITrainingModal
        isOpen={showAITrainingModal}
        onClose={() => setShowAITrainingModal(false)}
      />
    </div>
  );
};

