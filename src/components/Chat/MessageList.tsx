import React, { useEffect, useRef, useState } from 'react';
import { History, Cpu } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { TextShimmer } from '@/components/ui/text-shimmer';

const providers = {
  openai: {
    name: 'OpenAI',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o', description: 'Latest GPT-4 optimized model' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Fast GPT-4 variant' },
      { value: 'gpt-4', label: 'GPT-4', description: 'Standard GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    ],
  },
  claude: {
    name: 'Claude (Anthropic)',
    models: [
      { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Latest Claude model' },
      { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Most capable Claude 3' },
      { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Balanced performance' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku', description: 'Fast and efficient' },
    ],
  },
  google: {
    name: 'Google',
    models: [
      { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google Gemini Pro' },
      { value: 'gemini-ultra', label: 'Gemini Ultra', description: 'Most capable Gemini' },
    ],
  },
};

const getModelLabel = (provider: 'openai' | 'claude' | 'google' | 'anthropic' | undefined, model: string | undefined): string => {
  if (!provider || !model) return 'Not selected';
  // Map 'anthropic' to 'claude' as they are the same
  const mappedProvider = provider === 'anthropic' ? 'claude' : provider;
  const providerData = providers[mappedProvider as keyof typeof providers];
  if (!providerData) return model;
  const modelData = providerData.models.find(m => m.value === model);
  return modelData ? modelData.label : model;
};

const getProviderName = (provider: 'openai' | 'claude' | 'google' | 'anthropic' | undefined): string => {
  if (!provider) return '';
  // Map 'anthropic' to 'claude' as they are the same
  const mappedProvider = provider === 'anthropic' ? 'claude' : provider;
  return providers[mappedProvider as keyof typeof providers]?.name || provider;
};

interface MessageListProps {
  showHistory: boolean;
  onToggleHistory: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({ showHistory, onToggleHistory }) => {
  const { messages, loading, aiPreferences, isLoadingFromHistory } = useChat();
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Only auto-scroll when new messages are added, not when loading a conversation
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;
    
    // If messages increased (new message added), scroll to bottom
    // If messages changed but length is same or less, it's likely a conversation load - don't scroll
    if (currentLength > prevLength && !isLoadingConversation) {
      scrollToBottom();
    }
    
    prevMessagesLengthRef.current = currentLength;
  }, [messages.length, isLoadingConversation]);

  // Track when conversation is being loaded (when messages change but length stays same or decreases)
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;
    
    // If messages were replaced (same or fewer messages), it's a conversation load
    if (currentLength > 0 && currentLength <= prevLength && prevLength > 0) {
      setIsLoadingConversation(true);
      // Reset flag after transition completes
      setTimeout(() => setIsLoadingConversation(false), 300);
    } else if (currentLength === 0) {
      setIsLoadingConversation(false);
    }
  }, [messages.length]);

  return (
    <>
      <div className="flex-1 overflow-hidden px-4 pb-4 pt-4 bg-gray-950">
            <div className="relative h-full overflow-y-auto bg-gray-900 rounded-xl border border-gray-800">
          {/* Top buttons - sticky */}
          <div className="sticky top-0 z-20 pt-3 px-3 pb-2 bg-gray-900/95 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2">
                {/* History button */}
                <button
                  onClick={onToggleHistory}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border",
                    showHistory
                      ? "bg-gray-800 text-gray-100 border-gray-700"
                      : "bg-gray-800/80 text-gray-400 border-gray-700 hover:text-gray-200 hover:bg-gray-800"
                  )}
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('history')}</span>
                </button>
              </div>

              {/* Selected LLM Model Display */}
              {aiPreferences && (aiPreferences.provider || aiPreferences.model) && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700">
                  <Cpu className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    {aiPreferences.provider && (
                      <span className="text-xs text-gray-400">
                        {getProviderName(aiPreferences.provider)}
                      </span>
                    )}
                    {aiPreferences.model && (
                      <span className="text-xs font-medium text-gray-300">
                        {getModelLabel(aiPreferences.provider, aiPreferences.model)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mx-3 border-b border-gray-800"></div>
          </div>
          <div ref={messagesContainerRef} className="p-3 space-y-2">
          {messages.length === 0 && !loading && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-sm">{t('startConversation')}</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              // Determine if this is a new message (last message and not loading from history)
              // Only animate if it's the last message, not loading, and not loading from history
              const isNewMessage = index === messages.length - 1 && !isLoadingFromHistory && !isLoadingConversation && !loading;
              return (
                <motion.div
                  key={`${message.timestamp ? (message.timestamp instanceof Date ? message.timestamp.getTime() : new Date(message.timestamp).getTime()) : index}-${index}`}
                  initial={{ opacity: 0, y: isLoadingConversation || isLoadingFromHistory ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <ChatMessage message={message} isNew={isNewMessage} />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <div className="space-y-2">
              {aiPreferences?.mode === 'multi-agent' && aiPreferences.agents ? (
                <>
                  {aiPreferences.agents.filter(a => a.enabled).map((agent, idx) => {
                    const thinkingText = idx === 0 ? 'Filtering query...' : idx === 1 ? 'Searching documents...' : 'Validating response...';
                    return (
                      <div key={agent.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                          <LoadingSpinner size="sm" className="text-gray-200" />
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                            <img 
                              src="/chatbot.jpg" 
                              alt="Agent" 
                              className="w-3 h-3 rounded object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            {agent.name}
                          </p>
                          <TextShimmer className="text-sm text-gray-300">
                            {thinkingText}
                          </TextShimmer>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                    <LoadingSpinner size="sm" className="text-gray-200" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                    <TextShimmer className="text-sm text-gray-300">
                      {t('thinking')}
                    </TextShimmer>
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
      </div>
    </>
  );
};

