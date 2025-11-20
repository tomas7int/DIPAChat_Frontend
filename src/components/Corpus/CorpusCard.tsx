import React from 'react';
import { FileText, Trash2, Info } from 'lucide-react';
import { Corpus } from '@/services/api';

interface CorpusCardProps {
  corpus: Corpus;
  onDelete: (name: string) => void;
  onViewInfo: (name: string) => void;
}

export const CorpusCard: React.FC<CorpusCardProps> = ({ corpus, onDelete, onViewInfo }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <FileText className="w-5 h-5 text-gray-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100 mb-1">{corpus.name}</h3>
            <p className="text-sm text-gray-400">
              {corpus.documentCount !== undefined
                ? `${corpus.documentCount} documents`
                : 'Loading...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewInfo(corpus.name)}
            className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700 hover:text-gray-200"
            aria-label="View info"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(corpus.name)}
            className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700 hover:text-gray-200"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

