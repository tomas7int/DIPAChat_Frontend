import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Globe, Database, Cloud, Trash2, Power, PowerOff, Eye, Search, ArrowUpDown, List, Grid3x3 } from 'lucide-react';
import { DataSourceTypeCard } from './DataSourceTypeCard';
import { AddDataSourceModal } from './AddDataSourceModal';
import { useChat } from '@/contexts/ChatContext';
import { BGPattern } from '@/components/ui/bg-pattern';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export const DataSourceList: React.FC = () => {
  const { dataSources, loadDataSources } = useChat();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'status'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  // Load data sources on mount
  useEffect(() => {
    loadDataSources();
  }, []);

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    toast.success('Data source deleted successfully (UI Test Mode)');
    loadDataSources();
  };

  const handleToggle = async (name: string, enabled: boolean) => {
    toast.success(`Data source ${enabled ? 'enabled' : 'disabled'} (UI Test Mode)`);
    loadDataSources();
  };

  const dataSourceTypes = [
    {
      type: 'gcs',
      title: 'Google Cloud Storage',
      description: 'Connect to a GCS bucket to sync documents from cloud storage. Configure bucket name and optional path.',
      icon: <Cloud className="w-6 h-6" />,
    },
    {
      type: 'drive',
      title: 'Google Drive',
      description: 'Link a Google Drive folder to sync documents. Provide the folder ID to connect.',
      icon: <Database className="w-6 h-6" />,
    },
    {
      type: 'web',
      title: 'Web Crawling',
      description: 'Crawl a website starting from a URL to index web content. Documents will be synced to your corpus.',
      icon: <Globe className="w-6 h-6" />,
    },
  ];

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  // Filter and sort data sources
  const filteredAndSortedDataSources = useMemo(() => {
    let filtered = dataSources;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ds) =>
          ds.name.toLowerCase().includes(query) ||
          ds.type.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (sortBy === 'status') {
        comparison = a.enabled === b.enabled ? 0 : a.enabled ? 1 : -1;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [dataSources, searchQuery, sortBy, sortDir]);

  return (
    <div className="h-full flex flex-col bg-gray-950 relative overflow-hidden">
      {/* Dotted Background */}
      <BGPattern 
        variant="dots" 
        mask="fade-center" 
        size={24} 
        fill="rgba(163, 163, 163, 0.15)"
        className="opacity-100"
      />
      
      <div className="relative z-10 flex-1 overflow-auto">
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-100">
                  Data Sources <span className="text-gray-400">({dataSources.length})</span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or type..."
                    className="pl-10 pr-4 py-2.5 w-64 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 text-base"
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'status')}
                    className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 text-base"
                  >
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 hover:bg-gray-800 transition-colors"
                    aria-label="Toggle sort direction"
                  >
                    <ArrowUpDown className="w-5 h-5" />
                  </button>
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2.5 rounded-lg transition-colors",
                      viewMode === 'list'
                        ? "bg-gray-800 text-gray-100 border border-gray-700"
                        : "bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800"
                    )}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2.5 rounded-lg transition-colors",
                      viewMode === 'grid'
                        ? "bg-gray-800 text-gray-100 border border-gray-700"
                        : "bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800"
                    )}
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                </div>

                {/* Add Data Source Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-base font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Data Source</span>
                </button>
              </div>
          </div>

          {/* Unified Grid Layout */}
          <div className={cn(
            "gap-4 px-6 pb-6",
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col"
          )}>
            {/* Existing Data Sources */}
            {filteredAndSortedDataSources.map((ds) => {
              const typeInfo = dataSourceTypes.find(t => t.type === ds.type);
              return (
                <div
                  key={ds.name}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all hover:shadow-lg flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 flex-shrink-0">
                        {typeInfo?.icon || <Database className="w-5 h-5 text-gray-300" />}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-100">{ds.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{ds.type}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                      ds.enabled
                        ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {ds.enabled ? 'On' : 'Off'}
                    </div>
                  </div>

                  {/* Configuration Details */}
                  {ds.config && (
                    <div className="mb-4 flex-1">
                      <div className="space-y-2 text-xs">
                        {ds.type === 'gcs' && (
                          <>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 min-w-[60px]">Bucket:</span>
                              <span className="text-gray-300 break-all">{ds.config.bucket_name}</span>
                            </div>
                            {ds.config.path && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-500 min-w-[60px]">Path:</span>
                                <span className="text-gray-300 break-all">{ds.config.path}</span>
                              </div>
                            )}
                          </>
                        )}
                        {ds.type === 'drive' && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 min-w-[60px]">Folder:</span>
                            <span className="text-gray-300 font-mono break-all text-xs">{ds.config.folder_id}</span>
                          </div>
                        )}
                        {ds.type === 'web' && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 min-w-[60px]">URL:</span>
                            <span className="text-gray-300 font-mono break-all text-xs">{ds.config.url}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
                    <button
                      onClick={() => handleToggle(ds.name, !ds.enabled)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                        ds.enabled
                          ? 'bg-green-900/30 text-green-400 hover:bg-green-900/40 border border-green-800/50'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      {ds.enabled ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <PowerOff className="w-3 h-3" />
                          <span>Disable</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <Power className="w-3 h-3" />
                          <span>Enable</span>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(ds.name)}
                      className="px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-red-900/30"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      className="px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700"
                      aria-label="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Data Source Type Cards */}
            {dataSourceTypes.map((sourceType) => {
              const isSelected = dataSources.some(ds => ds.type === sourceType.type);
              return (
                <DataSourceTypeCard
                  key={sourceType.type}
                  type={sourceType.type}
                  title={sourceType.title}
                  description={sourceType.description}
                  icon={sourceType.icon}
                  isSelected={isSelected}
                  onClick={() => handleTypeSelect(sourceType.type)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <AddDataSourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedType(null);
        }}
        onSuccess={loadDataSources}
        initialType={selectedType}
      />
    </div>
  );
};

