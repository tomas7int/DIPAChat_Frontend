import React from 'react';
import { Database, Trash2, Power, PowerOff, Eye, ArrowRight, MapPin, Users, Star } from 'lucide-react';
import { DataSource } from '@/services/api';

interface DataSourceCardProps {
  dataSource: DataSource;
  onDelete: (name: string) => void;
  onToggle: (name: string, enabled: boolean) => void;
  index?: number;
  total?: number;
}

export const DataSourceCard: React.FC<DataSourceCardProps> = ({
  dataSource,
  onDelete,
  onToggle,
  index = 0,
  total = 0,
}) => {
  const typeLabels = {
    gcs: 'Google Cloud Storage',
    drive: 'Google Drive',
    web: 'Web Crawling',
  };

  const getTypeIcon = () => {
    switch (dataSource.type) {
      case 'gcs':
        return <Database className="w-5 h-5" />;
      case 'drive':
        return <Database className="w-5 h-5" />;
      case 'web':
        return <Database className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  // Regular card style
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:shadow-2xl transition-all relative z-10 flex flex-col shadow-lg">
      {/* Icon Badge at Top */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="w-10 h-10 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center shadow-lg">
          <div className="w-6 h-6 text-gray-300">
            {getTypeIcon()}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gray-900 px-5 pt-8 pb-5 flex-1 flex flex-col">
        <div className="mb-4 text-center">
          <h3 className="font-bold text-gray-100 mb-2 text-lg">{dataSource.name}</h3>
          
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{typeLabels[dataSource.type]}</span>
          </div>

          {dataSource.config && Object.keys(dataSource.config).length > 0 && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-2 px-2">
              {Object.entries(dataSource.config)
                .slice(0, 1)
                .map(([key, value]) => `${key}: ${String(value).substring(0, 40)}`)
                .join(', ')}
            </p>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              dataSource.enabled
                ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}>
              {dataSource.enabled ? (
                <div className="flex items-center gap-1.5">
                  <Power className="w-3 h-3" />
                  <span>Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <PowerOff className="w-3 h-3" />
                  <span>Inactive</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-800">
          <button
            onClick={() => onToggle(dataSource.name, !dataSource.enabled)}
            className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              dataSource.enabled
                ? 'bg-green-900/30 text-green-400 hover:bg-green-900/40 border border-green-800/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
            }`}
            aria-label={dataSource.enabled ? 'Disable' : 'Enable'}
          >
            {dataSource.enabled ? (
              <div className="flex items-center justify-center gap-1.5">
                <Power className="w-4 h-4" />
                <span>Disable</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <PowerOff className="w-4 h-4" />
                <span>Enable</span>
              </div>
            )}
          </button>
          <button
            onClick={() => onDelete(dataSource.name)}
            className="px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-red-900/30"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

