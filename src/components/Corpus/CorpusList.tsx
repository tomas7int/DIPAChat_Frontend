import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { CorpusCard } from './CorpusCard';
import { Corpus, CorpusInfo } from '@/services/api';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { Modal } from '@/components/Common/Modal';
import toast from 'react-hot-toast';
import { FileUpload } from './FileUpload';

export const CorpusList: React.FC = () => {
  const [corpora, setCorpora] = useState<Corpus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCorpus, setSelectedCorpus] = useState<CorpusInfo | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);

  const loadCorpora = async () => {
    setLoading(true);
    // Mock data for UI testing
    setTimeout(() => {
      const mockCorpora: Corpus[] = [
        { name: 'Main Corpus', documentCount: 1250 },
        { name: 'Research Papers', documentCount: 342 },
        { name: 'Company Docs', documentCount: 89 },
      ];
      setCorpora(mockCorpora);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadCorpora();
  }, []);

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete corpus "${name}"? This action cannot be undone.`))
      return;

    // Simulate API delay
    setTimeout(() => {
      toast.success('Corpus deleted successfully (UI Test Mode)');
      loadCorpora();
    }, 500);
  };

  const handleViewInfo = async (name: string) => {
    setInfoLoading(true);
    setIsInfoModalOpen(true);
    
    // Mock data for UI testing
    setTimeout(() => {
      const mockInfo: CorpusInfo = {
        name,
        documentCount: Math.floor(Math.random() * 1000) + 100,
        metadata: {
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          source: 'Google Drive',
        },
      };
      setSelectedCorpus(mockInfo);
      setInfoLoading(false);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="h-full w-full">
            <FileUpload />
          </div>
        )}
      </div>

      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedCorpus(null);
        }}
        title={selectedCorpus?.name || 'Corpus Information'}
        size="lg"
      >
        {infoLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : selectedCorpus ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Document Count</h3>
              <p className="text-lg font-semibold text-gray-100">{selectedCorpus.documentCount}</p>
            </div>
            {selectedCorpus.metadata && Object.keys(selectedCorpus.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Metadata</h3>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <pre className="text-sm text-gray-400 whitespace-pre-wrap">
                    {JSON.stringify(selectedCorpus.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

