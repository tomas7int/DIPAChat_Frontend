import React, { useState, useEffect } from 'react';
import { History, Trash2, Plus, MessageSquare, Clock, Search, GripVertical } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChatMessage } from '@/services/api';
import { cn } from '@/lib/utils';
import { Reorder, motion } from 'framer-motion';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages?: ChatMessage[];
}

const getHardcodedConversations = (): Conversation[] => {
    const now = new Date();
    
    const createMessages = (id: string, title: string): ChatMessage[] => {
      const baseMessages: Record<string, ChatMessage[]> = {
        'conv-1': [
          { role: 'user', content: 'How to implement authentication in React?', timestamp: new Date(now.getTime() - 30 * 60000) },
          { role: 'assistant', content: 'You can use Firebase Authentication or implement a custom JWT-based solution. Firebase provides easy integration with multiple providers like Google, GitHub, and email/password.', timestamp: new Date(now.getTime() - 30 * 60000 + 2000) },
          { role: 'user', content: 'What are the advantages of using Firebase?', timestamp: new Date(now.getTime() - 30 * 60000 + 5000) },
          { role: 'assistant', content: 'Firebase Authentication offers several advantages: built-in security, multiple provider support, easy integration, and automatic token management. It also provides MFA support out of the box.', timestamp: new Date(now.getTime() - 30 * 60000 + 7000) },
          { role: 'user', content: 'How do I set up JWT authentication manually?', timestamp: new Date(now.getTime() - 30 * 60000 + 10000) },
          { role: 'assistant', content: 'For JWT authentication, you\'ll need to: 1) Create a backend API that validates credentials, 2) Generate JWT tokens upon successful login, 3) Store tokens securely (httpOnly cookies or localStorage), 4) Include tokens in API requests via headers, 5) Validate tokens on protected routes.', timestamp: new Date(now.getTime() - 30 * 60000 + 12000) },
          { role: 'user', content: 'Which approach is better for production?', timestamp: new Date(now.getTime() - 30 * 60000 + 15000) },
          { role: 'assistant', content: 'For production, Firebase is better if you want quick setup and don\'t need custom auth logic. Custom JWT is better if you need full control, specific security requirements, or want to avoid vendor lock-in. Consider your team\'s expertise and project requirements.', timestamp: new Date(now.getTime() - 30 * 60000 + 17000) },
        ],
        'conv-2': [
          { role: 'user', content: 'Best practices for RAG implementation', timestamp: new Date(now.getTime() - 2 * 3600000) },
          { role: 'assistant', content: 'For RAG (Retrieval Augmented Generation), you should focus on chunking strategies, embedding models, and vector database selection. Start with semantic chunking for better context preservation.', timestamp: new Date(now.getTime() - 2 * 3600000 + 2000) },
          { role: 'user', content: 'What chunking strategy should I use?', timestamp: new Date(now.getTime() - 2 * 3600000 + 5000) },
          { role: 'assistant', content: 'Use semantic chunking for documents with clear sections, fixed-size chunks with overlap for uniform content, or hybrid approaches. The key is maintaining context while keeping chunks manageable (typically 200-500 tokens).', timestamp: new Date(now.getTime() - 2 * 3600000 + 7000) },
          { role: 'user', content: 'Which embedding model is recommended?', timestamp: new Date(now.getTime() - 2 * 3600000 + 10000) },
          { role: 'assistant', content: 'For general use, OpenAI\'s text-embedding-ada-002 or Cohere\'s embed models work well. For domain-specific content, consider fine-tuned models. Sentence transformers like all-MiniLM-L6-v2 are good open-source alternatives.', timestamp: new Date(now.getTime() - 2 * 3600000 + 12000) },
        ],
        'conv-3': [
          { role: 'user', content: 'Setting up data sources for document processing', timestamp: new Date(now.getTime() - 5 * 3600000) },
          { role: 'assistant', content: 'To set up data sources, navigate to the Data Sources section and configure your Google Drive, GCS Bucket, or Web Crawler connections. Each source type has specific authentication requirements.', timestamp: new Date(now.getTime() - 5 * 3600000 + 2000) },
          { role: 'user', content: 'How do I connect Google Drive?', timestamp: new Date(now.getTime() - 5 * 3600000 + 5000) },
          { role: 'assistant', content: 'For Google Drive: 1) Enable Google Drive API in your project, 2) Create OAuth credentials, 3) Request appropriate scopes (drive.readonly), 4) Implement OAuth flow, 5) Use Drive API to list and download files.', timestamp: new Date(now.getTime() - 5 * 3600000 + 7000) },
        ],
        'conv-4': [
          { role: 'user', content: 'Understanding vector embeddings and similarity search', timestamp: new Date(now.getTime() - 24 * 3600000) },
          { role: 'assistant', content: 'Vector embeddings convert text into numerical representations in high-dimensional space. Similarity search uses cosine similarity or Euclidean distance to find related content.', timestamp: new Date(now.getTime() - 24 * 3600000 + 2000) },
        ],
        'conv-5': [
          { role: 'user', content: 'How to optimize document chunking for better retrieval?', timestamp: new Date(now.getTime() - 2 * 24 * 3600000) },
          { role: 'assistant', content: 'Optimal chunking depends on your document type. For technical docs, use semantic chunking. For structured data, consider fixed-size chunks with overlap.', timestamp: new Date(now.getTime() - 2 * 24 * 3600000 + 2000) },
        ],
        'conv-6': [
          { role: 'user', content: 'Configuring MFA for enhanced security', timestamp: new Date(now.getTime() - 3 * 24 * 3600000) },
          { role: 'assistant', content: 'Multi-factor authentication adds an extra layer of security. You can enable it in the Settings section under Account Security.', timestamp: new Date(now.getTime() - 3 * 24 * 3600000 + 2000) },
        ],
        'conv-7': [
          { role: 'user', content: 'API rate limiting and error handling strategies', timestamp: new Date(now.getTime() - 5 * 24 * 3600000) },
          { role: 'assistant', content: 'Implement exponential backoff for retries, use circuit breakers for failing services, and set appropriate rate limits based on your use case.', timestamp: new Date(now.getTime() - 5 * 24 * 3600000 + 2000) },
        ],
        'conv-8': [
          { role: 'user', content: 'What are the key features of React 18?', timestamp: new Date(now.getTime() - 6 * 24 * 3600000) },
          { 
            role: 'assistant', 
            content: 'React 18 introduces several key features including:\n\n1. **Concurrent Rendering** - Allows React to interrupt rendering work to handle higher priority updates\n2. **Automatic Batching** - Groups multiple state updates into a single re-render\n3. **Suspense Improvements** - Better support for data fetching and code splitting\n4. **New Hooks** - useId, useTransition, useDeferredValue, and useSyncExternalStore\n5. **Strict Mode Updates** - Enhanced development warnings and double-invocation of effects',
            timestamp: new Date(now.getTime() - 6 * 24 * 3600000 + 3000),
            metadata: {
              sources: [
                'react-18-release-notes.pdf',
                'react-docs/concurrent-features.md',
                'tech-blog/react-18-overview.docx'
              ],
              agent: 'RAG Search Agent'
            }
          },
        ],
        'conv-9': [
          { role: 'user', content: 'Explain how to implement authentication with JWT tokens', timestamp: new Date(now.getTime() - 7 * 24 * 3600000) },
          { 
            role: 'assistant', 
            content: 'JWT (JSON Web Token) authentication involves several steps:\n\n1. **User Login**: Client sends credentials to server\n2. **Token Generation**: Server validates credentials and generates JWT with user info\n3. **Token Storage**: Client stores token (localStorage, sessionStorage, or httpOnly cookie)\n4. **Token Transmission**: Client includes token in Authorization header for protected routes\n5. **Token Validation**: Server validates token signature and expiration on each request\n\nBest practices include using short expiration times, refresh tokens, and secure storage methods.',
            timestamp: new Date(now.getTime() - 7 * 24 * 3600000 + 4000),
            metadata: {
              sources: [
                'auth-guide/jwt-implementation.pdf',
                'security-best-practices.md'
              ],
              agent: 'RAG Search Agent'
            }
          },
        ],
        'conv-10': [
          { role: 'user', content: 'What are the best practices for database indexing?', timestamp: new Date(now.getTime() - 8 * 24 * 3600000) },
          { 
            role: 'assistant', 
            content: 'Database indexing best practices include:\n\n1. **Index Frequently Queried Columns** - Add indexes on columns used in WHERE, JOIN, and ORDER BY clauses\n2. **Avoid Over-Indexing** - Too many indexes slow down INSERT/UPDATE operations\n3. **Composite Indexes** - Use for queries filtering multiple columns\n4. **Monitor Index Usage** - Remove unused indexes to improve write performance\n5. **Consider Index Type** - Choose B-tree, hash, or full-text indexes based on query patterns',
            timestamp: new Date(now.getTime() - 8 * 24 * 3600000 + 5000),
            metadata: {
              sources: [
                'database-optimization-guide.pdf',
                'example.xlsx',
                'indexing-strategies.docx'
              ],
              agent: 'RAG Search Agent',
              agentThoughts: [
                {
                  agent: 'Filter Agent',
                  thought: 'Query is about database indexing best practices. Filtering out irrelevant context.',
                  passedTo: 'Search Agent'
                },
                {
                  agent: 'Search Agent',
                  thought: 'Found 3 relevant documents about database indexing. Extracting key information.',
                  passedTo: 'Critic Agent'
                },
                {
                  agent: 'Critic Agent',
                  thought: 'Verified response accuracy against source documents. All information is correct and well-structured.',
                  passedTo: undefined
                }
              ]
            }
          },
        ],
        'conv-11': [
          { role: 'user', content: 'Compare different AI models for our use case', timestamp: new Date(now.getTime() - 9 * 24 * 3600000) },
          { 
            role: 'assistant', 
            content: 'Here\'s a comparison of popular AI models for different use cases:\n\n| Model | Provider | Best For | Cost | Speed |\n|-------|----------|----------|------|-------|\n| GPT-4o | OpenAI | General purpose, complex reasoning | High | Fast |\n| GPT-4 Turbo | OpenAI | Large context windows, detailed analysis | Medium | Very Fast |\n| Claude 3.5 Sonnet | Anthropic | Long documents, ethical AI | Medium | Medium |\n| Claude 3 Opus | Anthropic | Most capable, complex tasks | High | Slow |\n| Gemini Pro | Google | Multimodal, cost-effective | Low | Fast |\n| GPT-3.5 Turbo | OpenAI | Simple tasks, cost-effective | Low | Very Fast |\n\nFor most business applications, GPT-4 Turbo offers the best balance of capability and speed. For cost-sensitive projects, GPT-3.5 Turbo or Gemini Pro are excellent choices.',
            timestamp: new Date(now.getTime() - 9 * 24 * 3600000 + 5000),
            metadata: {
              sources: [
                'ai-models-comparison.pdf',
                'model-benchmarks.xlsx'
              ],
              agent: 'RAG Search Agent',
              agentThoughts: [
                {
                  agent: 'Filter Agent',
                  thought: 'User wants to compare AI models. Filtering for relevant comparison data.',
                  passedTo: 'Search Agent'
                },
                {
                  agent: 'Search Agent',
                  thought: 'Found comparison documents. Extracting model specifications and creating structured table.',
                  passedTo: 'Critic Agent'
                },
                {
                  agent: 'Critic Agent',
                  thought: 'Verified table accuracy and formatting. All model information is up-to-date and correctly presented.',
                  passedTo: undefined
                }
              ]
            }
          },
        ],
      };
      return baseMessages[id] || [
        { role: 'user', content: title, timestamp: new Date() },
        { role: 'assistant', content: 'This is a sample conversation. Click to load the full history.', timestamp: new Date() },
      ];
    };

    return [
      {
        id: 'conv-1',
        title: 'How to implement authentication in React?',
        lastMessage: 'You can use Firebase Authentication or implement a custom JWT-based solution. Firebase provides easy integration with multiple providers...',
        timestamp: new Date(now.getTime() - 30 * 60000),
        messageCount: 8,
        messages: createMessages('conv-1', 'How to implement authentication in React?'),
      },
      {
        id: 'conv-2',
        title: 'Best practices for RAG implementation',
        lastMessage: 'For RAG (Retrieval Augmented Generation), you should focus on chunking strategies, embedding models, and vector database selection...',
        timestamp: new Date(now.getTime() - 2 * 3600000),
        messageCount: 12,
        messages: createMessages('conv-2', 'Best practices for RAG implementation'),
      },
      {
        id: 'conv-3',
        title: 'Setting up data sources for document processing',
        lastMessage: 'To set up data sources, navigate to the Data Sources section and configure your Google Drive, GCS Bucket, or Web Crawler connections...',
        timestamp: new Date(now.getTime() - 5 * 3600000),
        messageCount: 6,
        messages: createMessages('conv-3', 'Setting up data sources for document processing'),
      },
      {
        id: 'conv-4',
        title: 'Understanding vector embeddings and similarity search',
        lastMessage: 'Vector embeddings convert text into numerical representations in high-dimensional space. Similarity search uses cosine similarity or Euclidean distance...',
        timestamp: new Date(now.getTime() - 24 * 3600000),
        messageCount: 15,
        messages: createMessages('conv-4', 'Understanding vector embeddings and similarity search'),
      },
      {
        id: 'conv-5',
        title: 'How to optimize document chunking for better retrieval?',
        lastMessage: 'Optimal chunking depends on your document type. For technical docs, use semantic chunking. For structured data, consider fixed-size chunks with overlap...',
        timestamp: new Date(now.getTime() - 2 * 24 * 3600000),
        messageCount: 10,
        messages: createMessages('conv-5', 'How to optimize document chunking for better retrieval?'),
      },
      {
        id: 'conv-6',
        title: 'Configuring MFA for enhanced security',
        lastMessage: 'Multi-factor authentication adds an extra layer of security. You can enable it in the Settings section under Account Security...',
        timestamp: new Date(now.getTime() - 3 * 24 * 3600000),
        messageCount: 7,
        messages: createMessages('conv-6', 'Configuring MFA for enhanced security'),
      },
      {
        id: 'conv-7',
        title: 'API rate limiting and error handling strategies',
        lastMessage: 'Implement exponential backoff for retries, use circuit breakers for failing services, and set appropriate rate limits based on your use case...',
        timestamp: new Date(now.getTime() - 5 * 24 * 3600000),
        messageCount: 9,
        messages: createMessages('conv-7', 'API rate limiting and error handling strategies'),
      },
      {
        id: 'conv-8',
        title: 'What are the key features of React 18?',
        lastMessage: 'React 18 introduces several key features including Concurrent Rendering, Automatic Batching, Suspense Improvements...',
        timestamp: new Date(now.getTime() - 6 * 24 * 3600000),
        messageCount: 2,
        messages: createMessages('conv-8', 'What are the key features of React 18?'),
      },
      {
        id: 'conv-9',
        title: 'Explain how to implement authentication with JWT tokens',
        lastMessage: 'JWT (JSON Web Token) authentication involves several steps: User Login, Token Generation, Token Storage...',
        timestamp: new Date(now.getTime() - 7 * 24 * 3600000),
        messageCount: 2,
        messages: createMessages('conv-9', 'Explain how to implement authentication with JWT tokens'),
      },
      {
        id: 'conv-10',
        title: 'What are the best practices for database indexing?',
        lastMessage: 'Database indexing best practices include: Index Frequently Queried Columns, Avoid Over-Indexing...',
        timestamp: new Date(now.getTime() - 8 * 24 * 3600000),
        messageCount: 2,
        messages: createMessages('conv-10', 'What are the best practices for database indexing?'),
      },
      {
        id: 'conv-11',
        title: 'Compare different AI models for our use case',
        lastMessage: 'Here\'s a comparison of popular AI models for different use cases...',
        timestamp: new Date(now.getTime() - 9 * 24 * 3600000),
        messageCount: 2,
        messages: createMessages('conv-11', 'Compare different AI models for our use case'),
      },
    ];
};

export const ConversationHistory: React.FC = () => {
  const { messages, clearMessages, loadConversation } = useChat();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load conversations from localStorage or use hardcoded data
  useEffect(() => {
    const saved = localStorage.getItem('chat_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loaded = parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        }));
        // If loaded conversations don't have messages, merge with hardcoded ones
        const hardcoded = getHardcodedConversations();
        const merged = loaded.map((conv: Conversation) => {
          const hardcodedConv = hardcoded.find(h => h.id === conv.id);
          return hardcodedConv ? { ...conv, messages: hardcodedConv.messages } : conv;
        });
        // Add any hardcoded conversations that aren't in saved data
        const hardcodedIds = new Set(loaded.map((c: Conversation) => c.id));
        const newHardcoded = hardcoded.filter(h => !hardcodedIds.has(h.id));
        const allConversations = [...merged, ...newHardcoded];
        // Filter out conversations without messages
        const withMessages = allConversations.filter(
          (conv) => conv.messages && Array.isArray(conv.messages) && conv.messages.length > 0
        );
        setConversations(withMessages);
        setFilteredConversations(withMessages);
        // Update localStorage if any conversations were filtered out
        if (withMessages.length !== allConversations.length) {
          localStorage.setItem('chat_conversations', JSON.stringify(withMessages));
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        // Fallback to hardcoded data on error
        const hardcoded = getHardcodedConversations();
        setConversations(hardcoded);
        setFilteredConversations(hardcoded);
      }
    } else {
      // Use hardcoded conversations if no saved data
      const hardcoded = getHardcodedConversations();
      setConversations(hardcoded);
      setFilteredConversations(hardcoded);
    }
  }, []);

  // Filter conversations based on search query
  useEffect(() => {
    // First filter out conversations without messages
    const withMessages = conversations.filter(
      (conv) => conv.messages && Array.isArray(conv.messages) && conv.messages.length > 0
    );
    
    // Update conversations if any were filtered out
    if (withMessages.length !== conversations.length) {
      setConversations(withMessages);
      localStorage.setItem('chat_conversations', JSON.stringify(withMessages));
    }
    
    // Then apply search filter
    if (!searchQuery.trim()) {
      setFilteredConversations(withMessages);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = withMessages.filter(
        (conv) =>
          conv.title.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query)
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  // Handle reordering conversations
  const handleReorder = (newOrder: Conversation[]) => {
    // If searching, we need to update the main conversations array based on the new order
    if (searchQuery.trim()) {
      // Find the indices of reordered items in the original array
      const newConversations = [...conversations];
      const reorderedIds = newOrder.map(c => c.id);
      
      // Reorder the main array to match the filtered order
      const reorderedConversations = reorderedIds.map(id => 
        newConversations.find(c => c.id === id)!
      ).filter(Boolean);
      
      // Keep conversations not in search results at the end
      const notInSearch = newConversations.filter(c => !reorderedIds.includes(c.id));
      const finalOrder = [...reorderedConversations, ...notInSearch];
      
      setConversations(finalOrder);
      setFilteredConversations(newOrder);
      localStorage.setItem('chat_conversations', JSON.stringify(finalOrder));
    } else {
      // If not searching, directly update both arrays
      setConversations(newOrder);
      setFilteredConversations(newOrder);
      localStorage.setItem('chat_conversations', JSON.stringify(newOrder));
    }
  };

  // Save current conversation when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const conversation: Conversation = {
        id: selectedConversation || `conv-${Date.now()}`,
        title: messages[0]?.content?.substring(0, 50) || t('newConversation'),
        lastMessage: messages[messages.length - 1]?.content?.substring(0, 100) || '',
        timestamp: new Date(),
        messageCount: messages.length,
        messages: messages, // Include messages in the conversation
      };

      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== conversation.id);
        // Filter out any conversations without messages before adding the new one
        const withoutEmpty = filtered.filter((c) => c.messages && Array.isArray(c.messages) && c.messages.length > 0);
        const updated = [conversation, ...withoutEmpty].slice(0, 20); // Keep last 20
        localStorage.setItem('chat_conversations', JSON.stringify(updated));
        return updated;
      });

      if (!selectedConversation) {
        setSelectedConversation(conversation.id);
      }
    }
  }, [messages.length, selectedConversation]);

  const handleNewConversation = () => {
    clearMessages();
    setSelectedConversation(null);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem('chat_conversations', JSON.stringify(updated));
    
    if (selectedConversation === id) {
      clearMessages();
      setSelectedConversation(null);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    // Format date without AM/PM and without seconds
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-100">{t('history')}</h3>
          </div>
          <button
            onClick={handleNewConversation}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchConversations')}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm text-center">
              {searchQuery ? t('noConversations') : t('noConversations')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Start chatting to create one'}
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={filteredConversations}
            onReorder={handleReorder}
            className="space-y-1"
          >
            {filteredConversations.map((conversation) => (
              <Reorder.Item
                key={conversation.id}
                value={conversation}
                className="cursor-move"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    // Don't trigger click if dragging
                    if ((e.target as HTMLElement).closest('.drag-handle')) {
                      return;
                    }
                    setSelectedConversation(conversation.id);
                    // Load conversation messages if available
                    if (conversation.messages && conversation.messages.length > 0) {
                      loadConversation(conversation.messages);
                    }
                  }}
                  className={cn(
                    "group relative p-3 rounded-lg cursor-pointer transition-colors",
                    selectedConversation === conversation.id
                      ? "bg-gray-800 border border-gray-700"
                      : "hover:bg-gray-800/50 border border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="drag-handle mt-0.5 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-400 transition-colors">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <h4 className="text-sm font-medium text-gray-200 truncate">
                            {conversation.title}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(conversation.timestamp)}</span>
                          </div>
                          <span>{conversation.messageCount} messages</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded transition-all"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
};

