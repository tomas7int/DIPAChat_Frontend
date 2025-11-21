import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/Common/Modal';
import { Download, X, FileText, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  filePath?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileName,
  filePath,
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (isOpen && fileName) {
      setLoading(true);
      setError(null);
      setPreviewError(false);
      
      // Try to load the file - check if it's a local file or URL
      if (filePath) {
        setFileUrl(filePath);
        setLoading(false);
      } else {
        // Try to find the file in the public directory
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        const publicPath = fileName.startsWith('/') ? fileName : `/${fileName}`;
        
        // Check if file exists
        fetch(publicPath, { method: 'HEAD' })
          .then((res) => {
            if (res.ok) {
              setFileUrl(publicPath);
              setLoading(false);
            } else {
              setError('File not found');
              setLoading(false);
            }
          })
          .catch(() => {
            setError('Failed to load file');
            setLoading(false);
          });
      }
    }
  }, [isOpen, fileName, filePath]);

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  const isPdf = fileExtension === 'pdf';
  const isExcel = ['xlsx', 'xls'].includes(fileExtension);
  const isCsv = fileExtension === 'csv';

  // For Excel files, use Microsoft Office Online viewer
  // For CSV, we'll load and display as a table
  // For PDF, we'll use iframe
  const getPreviewUrl = () => {
    if (!fileUrl) return null;
    
    if (isExcel) {
      // Use Microsoft Office Online viewer
      // Construct full URL - if fileUrl is relative, make it absolute
      const fullUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${window.location.origin}${fileUrl}`;
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
    } else if (isCsv) {
      // For CSV, we'll load and display as a table
      return fileUrl;
    } else if (isPdf) {
      return fileUrl;
    }
    return null;
  };

  const [csvContent, setCsvContent] = useState<string[][]>([]);
  const [loadingCsv, setLoadingCsv] = useState(false);

  // Load CSV content
  useEffect(() => {
    if (isOpen && isCsv && fileUrl) {
      setLoadingCsv(true);
      fetch(fileUrl)
        .then(res => res.text())
        .then(text => {
          // Simple CSV parsing (handles basic cases)
          const lines = text.split('\n').filter(line => line.trim());
          const parsed = lines.map(line => {
            // Simple CSV parsing - split by comma, handle quoted values
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            return values;
          });
          setCsvContent(parsed);
          setLoadingCsv(false);
        })
        .catch(() => {
          setError('Failed to load CSV file');
          setLoadingCsv(false);
        });
    }
  }, [isOpen, isCsv, fileUrl]);

  const previewUrl = getPreviewUrl();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={fileName} size="xl">
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* File Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-950 rounded-lg border border-gray-800 mb-4">
          {loading || loadingCsv ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-400">Loading file...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            </div>
          ) : isCsv && csvContent.length > 0 ? (
            <div className="p-4 overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  {csvContent[0] && (
                    <tr className="border-b border-gray-700">
                      {csvContent[0].map((header, idx) => (
                        <th key={idx} className="text-left p-2 text-gray-300 font-semibold bg-gray-900">
                          {header}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {csvContent.slice(1).map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-800 hover:bg-gray-900/50">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="p-2 text-gray-400">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : previewUrl && !previewError ? (
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[600px] border-0"
              title={fileName}
              onError={() => setPreviewError(true)}
              onLoad={(e) => {
                // Check if iframe loaded successfully
                try {
                  const iframe = e.target as HTMLIFrameElement;
                  // Office Online viewer might show an error page, but we can't detect it easily
                  // So we'll just let it try to load
                } catch {
                  setPreviewError(true);
                }
              }}
            />
          ) : previewError || (isExcel && !previewUrl) ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <FileSpreadsheet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-sm text-gray-400 mb-2">Excel preview unavailable</p>
                <p className="text-xs text-gray-500 mb-4">The file may need to be publicly accessible for online preview</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download to View
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-sm text-gray-400">Preview not available for this file type</p>
                <p className="text-xs text-gray-500 mt-2">You can download the file to view it</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            onClick={handleDownload}
            disabled={!fileUrl || loading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border",
              fileUrl && !loading
                ? "bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700"
                : "bg-gray-800/50 text-gray-500 border-gray-800 cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

