'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  language?: 'EN' | 'ID';
}

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Function to parse bold text (**text**)
  const parseMessage = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** markers and make bold
        const boldText = part.slice(2, -2);
        return (
          <span key={index} className="font-bold">
            {boldText}
          </span>
        );
      }
      return part;
    });
  };

  if (message.isBot) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
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

        {/* Message Content */}
        <div className="flex-1 max-w-[75%] sm:max-w-[80%]">
          <div className="bg-gray-800/80 border border-[#72c306]/30 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg w-fit min-w-[60px]">
            <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-line">
              {parseMessage(message.text)}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-xs text-gray-500">
              NusantaraX Assistant
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // User message
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start space-x-3 justify-end"
    >
      {/* Message Content */}
      <div className="flex-1 max-w-[75%] sm:max-w-[80%] flex justify-end">
        <div className="bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-2xl rounded-tr-md px-4 py-3 shadow-lg w-fit min-w-[60px]">
          <p className="text-white text-sm leading-relaxed whitespace-pre-line">
            {parseMessage(message.text)}
          </p>
        </div>
        <div className="flex items-center justify-end mt-1 px-1">
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <div className="h-full w-full rounded-full bg-gray-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </Avatar>
      </div>
    </motion.div>
  );
};

export default ChatBubble;