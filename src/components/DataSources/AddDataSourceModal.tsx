import React, { useState } from 'react';
import { Modal } from '@/components/Common/Modal';
import { DataSource } from '@/services/api';
import toast from 'react-hot-toast';

interface AddDataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: string | null;
}

export const AddDataSourceModal: React.FC<AddDataSourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: (initialType || 'gcs') as 'gcs' | 'drive' | 'web',
    config: {} as Record<string, any>,
  });
  const [loading, setLoading] = useState(false);

  // Update type when initialType changes
  React.useEffect(() => {
    if (initialType && isOpen) {
      setFormData(prev => ({ ...prev, type: initialType as any, config: {} }));
    }
  }, [initialType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      toast.success('Data source added successfully (UI Test Mode)');
      onSuccess();
      onClose();
      setFormData({ name: '', type: 'gcs' as const, config: {} });
      setLoading(false);
    }, 500);
  };

  const updateConfig = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Data Source" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:outline-none"
            placeholder="my-data-source"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any, config: {} })
            }
            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:outline-none"
          >
            <option value="gcs">Google Cloud Storage</option>
            <option value="drive">Google Drive</option>
            <option value="web">Web Crawling</option>
          </select>
        </div>

        {formData.type === 'gcs' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-200">GCS Configuration</label>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Bucket Name *</label>
              <input
                type="text"
                value={formData.config.bucket_name || ''}
                onChange={(e) => updateConfig('bucket_name', e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:outline-none"
                placeholder="my-bucket"
              />
              <p className="text-xs text-gray-500 mt-1">e.g., "buhalteres-lt-test"</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Path (optional)</label>
              <input
                type="text"
                value={formData.config.path || ''}
                onChange={(e) => updateConfig('path', e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:outline-none"
                placeholder="documents/"
              />
              <p className="text-xs text-gray-500 mt-1">e.g., "documents/invoices/"</p>
            </div>
          </div>
        )}

        {formData.type === 'drive' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-200">Google Drive Configuration</label>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Folder ID *</label>
              <input
                type="text"
                value={formData.config.folder_id || ''}
                onChange={(e) => updateConfig('folder_id', e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:outline-none"
                placeholder="1ABC123XYZ..."
              />
              <p className="text-xs text-gray-500 mt-1">The Google Drive folder ID from the folder URL</p>
            </div>
          </div>
        )}

        {formData.type === 'web' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-200">Web Crawler Configuration</label>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Starting URL *</label>
              <input
                type="url"
                value={formData.config.url || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:outline-none"
                placeholder="https://example.com/docs"
              />
              <p className="text-xs text-gray-500 mt-1">The starting URL to crawl (must start with http:// or https://)</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding...' : 'Add Data Source'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

