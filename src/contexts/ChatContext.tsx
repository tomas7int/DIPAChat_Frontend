import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage, DataSource } from '@/services/api';
import toast from 'react-hot-toast';

export interface AIPreferences {
  outputFormat?: 'text' | 'table' | 'list' | 'json';
  outputLanguage?: 'en' | 'lt';
  customInstructions?: string;
  provider?: 'openai' | 'claude' | 'google' | 'anthropic';
  model?: string;
  mode?: 'simple' | 'multi-agent';
  agents?: Array<{
    id: string;
    name: string;
    role: string;
    enabled: boolean;
  }>;
}

interface ChatContextType {
  messages: ChatMessage[];
  selectedDataSource: string | null;
  chatMode: 'chat' | 'agent';
  dataSources: DataSource[];
  loading: boolean;
  aiPreferences: AIPreferences | null;
  isLoadingFromHistory: boolean;
  addMessage: (message: ChatMessage) => void;
  sendMessage: (content: string) => Promise<void>;
  setSelectedDataSource: (source: string | null) => void;
  setChatMode: (mode: 'chat' | 'agent') => void;
  loadDataSources: () => Promise<void>;
  clearMessages: () => void;
  loadConversation: (messages: ChatMessage[]) => void;
  setAIPreferences: (preferences: AIPreferences) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'chat' | 'agent'>('chat');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingFromHistory, setIsLoadingFromHistory] = useState(false);
  const [aiPreferences, setAIPreferencesState] = useState<AIPreferences | null>(() => {
    const saved = localStorage.getItem('ai_preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure default agents are included if mode is multi-agent
        if (parsed.mode === 'multi-agent' && !parsed.agents) {
          parsed.agents = [
            { id: 'filter', name: 'Filter Agent', role: 'Filters and preprocesses user queries', enabled: true },
            { id: 'search', name: 'Search Agent', role: 'Searches and retrieves relevant documents', enabled: true },
            { id: 'critic', name: 'Critic Agent', role: 'Validates and verifies response accuracy', enabled: true },
          ];
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });


  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, { ...message, timestamp: new Date() }]);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);

    // Simulate API delay for UI testing
    setTimeout(() => {
      const response: ChatMessage = {
        role: 'assistant',
        content: `This is a mock response to: "${content.trim()}". This is UI/UX testing mode - no actual backend connection.`,
        timestamp: new Date(),
      };
      addMessage(response);
      setLoading(false);
    }, 1000);
  };

  const loadDataSources = async () => {
    // Mock data sources for UI testing
    const mockDataSources: DataSource[] = [
      { 
        name: 'Accounting Documents', 
        type: 'gcs', 
        enabled: true,
        config: {
          bucket_name: 'buhalteres-lt-test',
          path: 'documents/'
        }
      },
      { 
        name: 'Shared Drive Folder', 
        type: 'drive', 
        enabled: true,
        config: {
          folder_id: '1ABC123XYZ...'
        }
      },
      { 
        name: 'Company Website', 
        type: 'web', 
        enabled: false,
        config: {
          url: 'https://example.com/docs'
        }
      },
    ];
    setDataSources(mockDataSources);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const loadConversation = (conversationMessages: ChatMessage[]) => {
    setIsLoadingFromHistory(true);
    setMessages(conversationMessages);
    // Reset flag after messages are loaded and rendered
    setTimeout(() => setIsLoadingFromHistory(false), 100);
  };

  const setAIPreferences = (preferences: AIPreferences) => {
    setAIPreferencesState(preferences);
    localStorage.setItem('ai_preferences', JSON.stringify(preferences));
  };

  // Don't automatically load data sources - let user trigger it manually
  // React.useEffect(() => {
  //   loadDataSources();
  // }, []);

  const value: ChatContextType = {
    messages,
    selectedDataSource,
    chatMode,
    dataSources,
    loading,
    aiPreferences,
    isLoadingFromHistory,
    addMessage,
    sendMessage,
    setSelectedDataSource,
    setChatMode,
    loadDataSources,
    clearMessages,
    loadConversation,
    setAIPreferences,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

