import React from 'react';
import { Database } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

export const DataSourceSelector: React.FC = () => {
  const { dataSources, selectedDataSource, setSelectedDataSource, chatMode, setChatMode, loadDataSources } =
    useChat();
  const { isAdmin } = useAuth();
  
  // Load data sources on mount if empty
  React.useEffect(() => {
    if (dataSources.length === 0) {
      loadDataSources();
    }
  }, [dataSources.length, loadDataSources]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-gray-400" />
        <label className="text-sm font-medium text-gray-200">Chat Mode</label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setChatMode('chat')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chatMode === 'chat'
              ? 'bg-gray-800 text-gray-100 border border-gray-700'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setChatMode('agent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            chatMode === 'agent'
              ? 'bg-gray-800 text-gray-100 border border-gray-700'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-800'
          }`}
        >
          Agent (RAG)
        </button>
      </div>

      {chatMode === 'agent' && (
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Data Source (Optional)
          </label>
          <select
            value={selectedDataSource || ''}
            onChange={(e) => setSelectedDataSource(e.target.value || null)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
          >
            <option value="">All Sources</option>
            {dataSources
              .filter((ds) => ds.enabled)
              .map((ds) => (
                <option key={ds.name} value={ds.name}>
                  {ds.name} ({ds.type})
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

