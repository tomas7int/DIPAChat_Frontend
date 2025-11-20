import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  Search,
  Download,
  Copy,
  ExternalLink,
  Trash2,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Video,
  Music,
  File,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  List,
  Grid3x3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File; // Make optional for mock files
  preview?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (type: string, name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  
  if (type.includes('pdf') || ext === 'pdf' || type.includes('word') || ['doc', 'docx'].includes(ext) || type.includes('text') || ['txt', 'md'].includes(ext)) {
    return <FileText className="w-6 h-6 text-gray-400" />;
  }
  if (type.includes('zip') || type.includes('archive') || ['zip', 'rar', '7z', 'tar'].includes(ext)) {
    return <FileArchive className="w-6 h-6 text-gray-400" />;
  }
  if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className="w-6 h-6 text-gray-400" />;
  }
  if (type.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv'].includes(ext)) {
    return <Video className="w-6 h-6 text-gray-400" />;
  }
  if (type.startsWith('audio/') || ['mp3', 'wav', 'flac', 'm4a'].includes(ext)) {
    return <Music className="w-6 h-6 text-gray-400" />;
  }
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
    return <ImageIcon className="w-6 h-6 text-gray-400" />;
  }
  return <File className="w-6 h-6 text-gray-400" />;
};

const getFileTypeLabel = (type: string): string => {
  if (!type) return 'UNKNOWN';
  const parts = type.split('/');
  return (parts[1] || parts[0] || 'unknown').toUpperCase();
};

// Test file metadata - just labels, not real files
const testFileData = [
  { name: 'brochure.pdf', type: 'application/pdf', size: 528737 },
  { name: 'cover.png', type: 'image/png', size: 182873 },
  { name: 'report.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 352873 },
  { name: 'document.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 245123 },
  { name: 'presentation.pptx', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 678432 },
  { name: 'data.csv', type: 'text/csv', size: 45678 },
  { name: 'manual.pdf', type: 'application/pdf', size: 1234567 },
  { name: 'screenshot.jpg', type: 'image/jpeg', size: 456789 },
  { name: 'budget.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 234567 },
  { name: 'notes.txt', type: 'text/plain', size: 12345 },
];

// Create mock file items (just metadata, no actual File objects)
const createMockFileItem = (name: string, type: string, size: number): FileItem => {
  return {
    id: `${name}-${Date.now()}-${Math.random()}`,
    name,
    type,
    size,
    // No file object for mock files - just metadata
    preview: type.startsWith('image/') ? undefined : undefined,
  };
};

export const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  
  // Initialize test files on mount
  React.useEffect(() => {
    const testFiles = testFileData.map((data) => createMockFileItem(data.name, data.type, data.size));
    setFiles(testFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFiles = 20;
  const maxSize = 20 * 1024 * 1024; // 20MB

  const handleFileSelect = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: FileItem[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`File "${file.name}" exceeds maximum size of ${formatBytes(maxSize)}`);
        return;
      }

      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      newFiles.push({
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        file, // Real File object for uploaded files
        preview,
      });
    });

    if (errors.length > 0) {
      errors.forEach((error) => console.error(error));
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, [files.length, maxSize, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setSelectedFiles(new Set());
  }, [files]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedFiles.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.id)));
    }
  }, [selectedFiles.size]);

  const removeSelected = useCallback(() => {
    selectedFiles.forEach((id) => removeFile(id));
    setSelectedFiles(new Set());
  }, [selectedFiles, removeFile]);

  const copyLink = useCallback(async (file: FileItem) => {
    try {
      await navigator.clipboard.writeText(file.name);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleSort = useCallback((column: 'name' | 'type' | 'size') => {
    if (sortBy === column) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  }, [sortBy]);

  const getSortIcon = (column: 'name' | 'type' | 'size') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortDir === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-gray-300" />
      : <ArrowDown className="w-4 h-4 text-gray-300" />;
  };

  const downloadFile = useCallback((file: FileItem) => {
    if (!file.file) {
      console.warn('Cannot download mock file:', file.name);
      return;
    }
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const openFile = useCallback((file: FileItem) => {
    if (!file.file) {
      console.warn('Cannot open mock file:', file.name);
      return;
    }
    const url = URL.createObjectURL(file.file);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  const filteredFiles = React.useMemo(() => {
    let filtered = files;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.type.toLowerCase().includes(query) ||
          f.name.split('.').pop()?.toLowerCase().includes(query)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else {
        comparison = a.size - b.size;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [files, searchQuery, sortBy, sortDir]);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const allSelected = filteredFiles.length > 0 && filteredFiles.every((f) => selectedFiles.has(f.id));

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header - Moved to top */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-100">
            Files <span className="text-gray-400">({files.length})</span>
          </h3>
          <span className="text-sm text-gray-400">
            Total: {formatBytes(totalSize)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, type, or extension..."
              className="pl-10 pr-4 py-2.5 w-64 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 text-base"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'size')}
              className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 text-base"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="size">Size</option>
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

          {/* Actions */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-base font-medium"
          >
            <Upload className="w-5 h-5" />
            Add files
          </button>
          <button
            onClick={clearFiles}
            disabled={files.length === 0}
            className="px-5 py-2.5 bg-gray-900 text-gray-400 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-base font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Remove all
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 mx-4 transition-colors",
          isDragging
            ? "border-gray-600 bg-gray-900/50"
            : "border-gray-800 bg-gray-900/30"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept="*/*"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center">
              <File className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-base font-medium text-gray-200 mb-1">Drop files to upload</p>
              <p className="text-sm text-gray-400">
                Up to {maxFiles} files · {formatBytes(maxSize)} per file
              </p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-base font-medium"
          >
            <Upload className="w-5 h-5" />
            Select files
          </button>
        </div>
      </div>

      {/* Selection Bar */}
      {filteredFiles.length > 0 && (
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="flex-shrink-0"
                aria-label={allSelected ? "Unselect all" : "Select all"}
              />
              <span className="text-base text-gray-400">
                {selectedFiles.size}/{filteredFiles.length} selected
              </span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                selectedFiles.forEach((id) => {
                  const file = files.find((f) => f.id === id);
                  if (file) downloadFile(file);
                });
              }}
              disabled={selectedFiles.size === 0}
              className="px-5 py-2.5 bg-gray-900 text-gray-400 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-base font-medium"
            >
              <Download className="w-5 h-5" />
              Download selected
            </button>
            <button
              onClick={removeSelected}
              disabled={selectedFiles.size === 0}
              className="px-5 py-2.5 bg-gray-900 text-gray-400 border border-gray-800 rounded-lg hover:bg-gray-800 hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-base font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Remove selected
            </button>
          </div>
        </div>
      )}

      {/* File List */}
      {filteredFiles.length > 0 ? (
        viewMode === 'list' ? (
          <div className="flex-1 overflow-auto bg-gray-900 border border-gray-800 rounded-xl mx-4 mb-4">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-4 text-left border-b border-gray-800">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="flex-shrink-0"
                      aria-label={allSelected ? "Unselect all" : "Select all"}
                    />
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-base font-semibold text-gray-200 border-b border-gray-800 cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Name</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-base font-semibold text-gray-200 border-b border-gray-800 cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Type</span>
                      {getSortIcon('type')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-base font-semibold text-gray-200 border-b border-gray-800 cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => handleSort('size')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Size</span>
                      {getSortIcon('size')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right text-base font-semibold text-gray-200 border-b border-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => {
                  const name = file.name;
                  const type = file.type;
                  const size = file.size;
                  const isLast = index === filteredFiles.length - 1;

                  return (
                    <tr
                      key={file.id}
                      className={cn(
                        "hover:bg-gray-800/30 transition-colors",
                        selectedFiles.has(file.id) && "bg-gray-800/50",
                        !isLast && "border-b border-gray-800"
                      )}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleSelect(file.id)}
                          className="flex-shrink-0"
                          aria-label={`Select ${name}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type, file.name)}
                          <span className="text-base text-gray-200 font-medium">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-base text-gray-400">{getFileTypeLabel(file.type)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-base text-gray-400">{formatBytes(file.size)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openFile(file)}
                            disabled={!file.file}
                            className="p-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Open file"
                            title="Open"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            disabled={!file.file}
                            className="p-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Download file"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => copyLink(file)}
                            className="p-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
                            aria-label="Copy link"
                            title="Copy link"
                          >
                            {copiedId === file.id ? (
                              <Check className="w-5 h-5 text-green-400" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2.5 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                            aria-label="Remove file"
                            title="Remove"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 overflow-auto px-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all hover:shadow-lg",
                    selectedFiles.has(file.id) && "ring-2 ring-gray-700 border-gray-700"
                  )}
                >
                  {/* Preview/Icon Section - Larger in grid view */}
                  <div className="relative h-40 bg-gray-800/50 flex items-center justify-center border-b border-gray-800">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        {getFileIcon(file.type, file.name)}
                        <span className="text-xs text-gray-500 uppercase">
                          {getFileTypeLabel(file.type)}
                        </span>
                      </div>
                    )}
                    {/* Checkbox overlay */}
                    <label className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleSelect(file.id)}
                        className="flex-shrink-0"
                        aria-label={`Select ${file.name}`}
                      />
                    </label>
                  </div>
                  
                  {/* File Info Section */}
                  <div className="p-4">
                    <p className="text-base font-semibold text-gray-200 truncate mb-2" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                    
                    {/* Action Buttons - Horizontal layout in grid */}
                    <div className="flex items-center justify-between gap-1 pt-3 border-t border-gray-800">
                      <button
                        onClick={() => openFile(file)}
                        disabled={!file.file}
                        className="p-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Open"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadFile(file)}
                        disabled={!file.file}
                        className="p-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => copyLink(file)}
                        className="p-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        {copiedId === file.id ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2.5 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 px-4">
          <p className="text-base">
            {files.length === 0 ? 'No files yet. Add or drop files above.' : 'No files match your search.'}
          </p>
        </div>
      )}
    </div>
  );
};

