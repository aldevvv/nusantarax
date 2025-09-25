'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start space-x-3"
    >
      {/* Bot Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </Avatar>
      </div>

      {/* Typing Animation */}
      <div className="flex-1 max-w-xs sm:max-w-sm">
        <div className="bg-gray-800/80 border border-[#72c306]/30 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
          <div className="flex items-center space-x-1">
            <motion.div
              className="w-2 h-2 bg-[#72c306] rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0
              }}
            />
            <motion.div
              className="w-2 h-2 bg-[#72c306] rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.2
              }}
            />
            <motion.div
              className="w-2 h-2 bg-[#72c306] rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.4
              }}
            />
            <span className="text-gray-400 text-sm ml-2">typing...</span>
          </div>
        </div>
        <div className="mt-1 px-1">
          <span className="text-xs text-gray-500">
            NusantaraX Assistant
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;