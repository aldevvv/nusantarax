'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const AIAssistantTypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex items-start space-x-3"
    >
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      </div>
      
      <div className="bg-gray-800/50 text-white border border-gray-700/50 p-3 rounded-2xl rounded-bl-sm max-w-xs">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">AI Assistant is thinking</span>
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-[#72c306] rounded-full"
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantTypingIndicator;