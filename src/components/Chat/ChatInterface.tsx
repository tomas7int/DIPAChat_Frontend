import React, { useState } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ConversationHistory } from './ConversationHistory';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatInterface: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex h-full bg-gray-800">
      {/* Conversation History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <ConversationHistory />
            </motion.div>
            {/* Overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowHistory(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
        <MessageList showHistory={showHistory} onToggleHistory={() => setShowHistory(!showHistory)} />

        <ChatInput />
      </div>
    </div>
  );
};

