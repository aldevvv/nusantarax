'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  inputTokens?: number;
  outputTokens?: number;
}

interface AIAssistantChatBubbleProps {
  message: Message;
}

const AIAssistantChatBubble: React.FC<AIAssistantChatBubbleProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!message.isUser && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${message.isUser ? 'order-first' : ''}`}>
        <div
          className={`p-3 rounded-2xl ${
            message.isUser
              ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white ml-auto'
              : 'bg-gray-800/50 text-white border border-gray-700/50'
          } ${message.isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
        >
          {message.imageUrl && (
            <div className="mb-2">
              <img
                src={message.imageUrl}
                alt="User upload"
                className="max-w-full h-auto rounded-lg border border-gray-600"
              />
            </div>
          )}
          
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          {(message.inputTokens || message.outputTokens) && !message.isUser && (
            <div className="mt-2 pt-2 border-t border-gray-600/30">
              <div className="flex items-center space-x-3 text-xs text-gray-400">
                {message.inputTokens && (
                  <span>In: {message.inputTokens}</span>
                )}
                {message.outputTokens && (
                  <span>Out: {message.outputTokens}</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-400 ${
          message.isUser ? 'justify-end' : 'justify-start'
        }`}>
          <Clock className="h-3 w-3" />
          <span>{message.timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
      </div>

      {message.isUser && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-300" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AIAssistantChatBubble;