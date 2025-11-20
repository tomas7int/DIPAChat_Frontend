import React, { useState, useRef } from 'react';
import { MessageCircle, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/services/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FilePreviewModal } from './FilePreviewModal';

interface ChatMessageProps {
  message: ChatMessageType;
  isNew?: boolean; // Whether this is a newly added message (should animate)
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isNew = false }) => {
  const isUser = message.role === 'user';
  const messageRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<{
    agentThoughts: boolean;
    sources: boolean;
  }>({
    agentThoughts: false,
    sources: false,
  });
  const [previewFile, setPreviewFile] = useState<{ name: string; path?: string } | null>(null);

  const toggleSection = (section: 'agentThoughts' | 'sources') => {
    setExpandedSections((prev) => {
      const newState = {
        ...prev,
        [section]: !prev[section],
      };
      
      // Scroll into view after expansion animation completes
      if (newState[section]) {
        setTimeout(() => {
          messageRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }, 300); // Wait for animation to complete
      }
      
      return newState;
    });
  };

  const handleFileClick = (fileName: string) => {
    // Try to construct file path - check if it's a local file
    const filePath = fileName.includes('/') ? fileName : `/ai_prompt_test.pdf`;
    setPreviewFile({ name: fileName, path: filePath });
  };

  // Parse and format message content for better display
  const formatMessageContent = (content: string) => {
    if (!content) return content;

    // Split content into lines
    const lines = content.split('\n');
    const formatted: JSX.Element[] = [];
    let i = 0;
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType === 'ul' ? 'ul' : 'ol';
        formatted.push(
          <ListTag 
            key={`list-${i}`} 
            className={cn(
              "my-3 space-y-2",
              listType === 'ul' 
                ? "list-disc list-outside ml-6 marker:text-gray-400" 
                : "list-decimal list-outside ml-6 marker:text-gray-400"
            )}
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-200 leading-relaxed pl-2">{item.trim()}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
      inList = false;
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        formatted.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-800">
                  {tableRows[0]?.map((cell, idx) => (
                    <th key={idx} className="px-3 py-2 text-left text-sm font-semibold text-gray-200 border border-gray-700">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-sm text-gray-300 border border-gray-700">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check for table (markdown table with |)
      if (trimmedLine.includes('|') && trimmedLine.split('|').length >= 3) {
        if (!inTable) {
          flushList();
          inTable = true;
        }
        const cells = trimmedLine.split('|').map(c => c.trim()).filter(c => c);
        // Skip separator rows (markdown table separators like |---|---|)
        if (!cells.every(c => /^[-:]+$/.test(c))) {
          tableRows.push(cells);
        }
        i++;
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Check for bullet points (-, *, •)
      if (/^[-*•]\s+/.test(trimmedLine)) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(trimmedLine.replace(/^[-*•]\s+/, ''));
        i++;
        continue;
      }

      // Check for numbered lists (1., 2., etc. or 1), 2), etc.)
      // Handle both single items per line and multiple items on one line
      // Also handle lines that start with text before the numbered list
      if (/\d+[.)]\s*/.test(trimmedLine)) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        
        // Split by pattern that indicates new numbered item: ", " followed by number and ) or .
        // This handles cases like "1) item, 2) item" or "For Google Drive: 1) item, 2) item"
        const parts = trimmedLine.split(/,\s*(?=\d+[.)])/);
        
        // First part might have prefix text before the first numbered item
        const firstPart = parts[0];
        const firstNumberedMatch = firstPart.match(/(.+?)(\d+[.)]\s*.+)$/);
        
        if (firstNumberedMatch) {
          // Has prefix text before first numbered item
          const prefix = firstNumberedMatch[1].trim();
          if (prefix) {
            formatted.push(
              <p key={`before-list-${i}`} className="my-1 text-gray-200 leading-relaxed">
                {prefix}
              </p>
            );
          }
          // Add first numbered item
          const firstItem = firstNumberedMatch[2].replace(/^\d+[.)]\s*/, '').trim();
          if (firstItem) {
            listItems.push(firstItem);
          }
        } else {
          // No prefix, just numbered item
          const firstItem = firstPart.replace(/^\d+[.)]\s*/, '').trim();
          if (firstItem) {
            listItems.push(firstItem);
          }
        }
        
        // Add remaining numbered items
        for (let j = 1; j < parts.length; j++) {
          const item = parts[j].replace(/^\d+[.)]\s*/, '').trim();
          if (item) {
            listItems.push(item);
          }
        }
        
        i++;
        continue;
      }

      // Regular line
      if (inList) {
        flushList();
      }
      
      if (trimmedLine) {
        formatted.push(
          <p key={i} className="my-1 text-gray-200 leading-relaxed">
            {trimmedLine}
          </p>
        );
      } else {
        formatted.push(<br key={i} />);
      }
      i++;
    }

    // Flush any remaining list or table
    flushList();
    flushTable();

    return formatted.length > 0 ? formatted : [<p key="empty" className="text-gray-200">{content}</p>];
  };

  const hasAgentThoughts = message.metadata?.agentThoughts && message.metadata.agentThoughts.length > 0;
  const hasSources = message.metadata?.sources && message.metadata.sources.length > 0;

  return (
    <>
      <div ref={messageRef} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
        {!isUser && (
          <div className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img 
              src="/chatbot.jpg" 
              alt="Chatbot" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

      <div
        className={cn(
          "max-w-[60%] rounded-lg px-4 py-3",
          isUser
            ? "bg-gray-800 text-gray-100 border border-gray-700"
            : "bg-gray-900 border border-gray-800 text-gray-200"
        )}
      >
        {!isUser && message.metadata?.agent && (
          <div className="mb-2 pb-2 border-b border-gray-800 flex items-center gap-2">
            <img 
              src="/chatbot.jpg" 
              alt="Agent" 
              className="w-4 h-4 rounded object-cover"
              onError={(e) => {
                // Fallback if image doesn't load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-xs font-medium text-gray-400">
              {message.metadata.agent}
            </span>
          </div>
        )}

        <div className="break-words text-base leading-relaxed">
          {formatMessageContent(message.content)}
        </div>

        {/* Agent Thoughts Section - Expandable */}
        {hasAgentThoughts && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <button
              onClick={() => toggleSection('agentThoughts')}
              className="flex items-center gap-2 w-full text-left mb-2 hover:text-gray-200 transition-colors"
            >
              <motion.div
                animate={{ rotate: expandedSections.agentThoughts ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                <img 
                  src="/chatbot.jpg" 
                  alt="Agent" 
                  className="w-3 h-3 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                Agent Thoughts ({message.metadata!.agentThoughts!.length})
              </span>
            </button>
            <AnimatePresence>
              {expandedSections.agentThoughts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
                  className="overflow-hidden"
                >
                  <div className="relative pl-6 space-y-2">
                    {/* Vertical connecting line */}
                    <div className="absolute top-0 bottom-0 left-2 border-l-2 border-dashed border-gray-700" />
                    {message.metadata!.agentThoughts!.map((thought, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="bg-gray-950 border border-gray-800 rounded p-2 ml-4"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-300">{thought.agent}</span>
                          {thought.passedTo && (
                            <>
                              <span className="text-xs text-gray-500">→</span>
                              <span className="text-xs text-gray-400">{thought.passedTo}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{thought.thought}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Sources Section - Expandable */}
        {hasSources && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <button
              onClick={() => toggleSection('sources')}
              className="flex items-center gap-2 w-full text-left mb-2 hover:text-gray-200 transition-colors"
            >
              <motion.div
                animate={{ rotate: expandedSections.sources ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
              <span className="text-xs font-medium text-gray-400">📄 Referenced Files ({message.metadata!.sources!.length})</span>
            </button>
            <AnimatePresence>
              {expandedSections.sources && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }}
                  className="overflow-hidden"
                >
                  <div className="relative pl-6">
                    {/* Vertical connecting line */}
                    <div className="absolute top-0 bottom-0 left-2 border-l-2 border-dashed border-gray-700" />
                    <ul className="text-xs text-gray-400 space-y-1 ml-4">
                      {message.metadata!.sources!.map((source, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-3 h-3 text-gray-500 flex-shrink-0" />
                          <button
                            onClick={() => handleFileClick(source)}
                            className="truncate hover:text-gray-200 hover:underline transition-colors text-left"
                            title={`Click to preview: ${source}`}
                          >
                            {source}
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {message.timestamp && (
          <p className={cn(
            "text-xs mt-2",
            isUser ? "text-gray-400" : "text-gray-500"
          )}>
            {new Date(message.timestamp).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: false 
            })}
          </p>
        )}
      </div>

        {isUser && (
          <div className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>

      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileName={previewFile?.name || ''}
        filePath={previewFile?.path}
      />
    </>
  );
};

