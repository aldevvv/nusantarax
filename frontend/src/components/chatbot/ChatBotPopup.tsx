'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bot,
  Send,
  Loader2,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Mail,
  Phone,
  Building,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import LeadCaptureForm from './LeadCaptureForm';
import { chatBotAPI, handleApiError } from '@/lib/api';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  language?: 'EN' | 'ID';
}

interface ChatBotPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBotPopup: React.FC<ChatBotPopupProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [rateLimitReached, setRateLimitReached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_MESSAGES_PER_SESSION = 10;
  
  // Generate unique session ID for this chat session
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2)}`);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "Hello! I'm your NusantaraX Assistant. I'm here to help you learn about our AI-powered platform for Indonesian SMEs. Feel free to ask me anything!",
        isBot: true,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input and auto-scroll when popup opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        // Auto-scroll to latest message when popup opens
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  const detectLanguage = (text: string): 'ID' | 'EN' => {
    const indonesianKeywords = [
      'apa', 'bagaimana', 'kapan', 'dimana', 'mengapa', 'siapa',
      'dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'dalam',
      'saya', 'kamu', 'kami', 'mereka', 'ini', 'itu', 'yang',
      'bisa', 'dapat', 'akan', 'sudah', 'belum', 'masih',
      'harga', 'biaya', 'gratis', 'trial', 'coba', 'daftar',
      'layanan', 'fitur', 'platform', 'bisnis', 'perusahaan'
    ];
    
    const lowerText = text.toLowerCase();
    const indonesianMatches = indonesianKeywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;
    
    return indonesianMatches >= 2 ? 'ID' : 'EN';
  };

  const sendMessage = async (text: string, isQuickReply: boolean = false) => {
    if (!text.trim() || isLoading || rateLimitReached) return;

    // Check rate limit
    if (messageCount >= MAX_MESSAGES_PER_SESSION) {
      setRateLimitReached(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      // Call the real ChatBot API
      const response = await chatBotAPI.sendMessage({
        message: text,
        sessionId: sessionId
      });

      if (response.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.message,
          isBot: true,
          timestamp: new Date(),
          language: response.data.detectedLanguage
        };

        setTimeout(() => {
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          setIsLoading(false);

          // Show lead capture based on AI's recommendation
          if (response.data.showLeadCapture && !showLeadCapture && !isQuickReply) {
            setTimeout(() => setShowLeadCapture(true), 2000);
          }
        }, 800 + Math.random() * 800); // Realistic response time

      } else {
        throw new Error(response.message || 'Failed to get response');
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble right now. Please try again later or contact our support team at support@nusantarax.web.id",
        isBot: true,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        setIsLoading(false);
      }, 1000);
    }
  };


  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setMessageCount(0);
    setRateLimitReached(false);
    setShowLeadCapture(false);
    setInputMessage('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-end p-0 lg:p-6 lg:items-end lg:justify-end pointer-events-auto"
        style={{ zIndex: 9999 }}
      >
        {/* Background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/10 pointer-events-auto"
          onClick={onClose}
        />

        {/* Chatbot popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full h-full lg:max-w-md lg:h-[520px] bg-black border-0 lg:border lg:border-[#72c306]/30 rounded-none lg:rounded-3xl shadow-2xl shadow-[#72c306]/20 flex flex-col overflow-hidden z-[10000] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ zIndex: 10000 }}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-[#72c306]/20 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">NusantaraX Assistant</h3>
                  <p className="text-gray-400 text-sm">Online • 24/7 Support</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20 scrollbar-hide">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            {/* Lead capture form */}
            {showLeadCapture && !rateLimitReached && (
              <LeadCaptureForm onClose={() => setShowLeadCapture(false)} />
            )}

            {/* Rate limit message */}
            {rateLimitReached && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center"
              >
                <p className="text-red-400 text-sm">
                  You've reached the message limit for this session. 
                  Please contact our support team for more assistance.
                </p>
                <Button
                  className="mt-3 bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white"
                  size="sm"
                  asChild
                >
                  <a href="mailto:support@nusantarax.web.id">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 p-4 border-t border-[#72c306]/20 bg-black/95 backdrop-blur-sm">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question here..."
                disabled={isLoading || rateLimitReached}
                className="flex-1 bg-gray-800/50 border-gray-600/50 focus:border-[#72c306] text-white placeholder-gray-400"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || rateLimitReached}
                className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Powered by indicator */}
            <div className="flex items-center justify-center mt-2">
              <span className="text-xs text-gray-500">
                Powered by NusantaraX AI • {messageCount}/{MAX_MESSAGES_PER_SESSION} messages
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatBotPopup;