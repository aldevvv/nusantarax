'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bot,
  Send,
  Loader2,
  Settings,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIAssistantChatBubble from './AIAssistantChatBubble';
import AIAssistantTypingIndicator from './AIAssistantTypingIndicator';
import AIAssistantSettingsModal from './AIAssistantSettingsModal';
import { aiAssistantAPI, handleApiError } from '@/lib/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  inputTokens?: number;
  outputTokens?: number;
}

interface AIAssistantPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistantPopup: React.FC<AIAssistantPopupProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize session when popup opens
  useEffect(() => {
    if (isOpen && !session) {
      initializeSession();
    }
  }, [isOpen]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && session) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hello! I'm your NusantaraX AI Assistant, powered by Gemini 2.5 Pro. I'm specialized in digital marketing strategies for Indonesian SMEs. How can I help you grow your business today?",
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, session]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, activeTab]);

  const initializeSession = async () => {
    try {
      const sessionResponse = await aiAssistantAPI.getSession();
      if (sessionResponse.success) {
        setSession(sessionResponse.data);
        // Load existing messages if any
        if (sessionResponse.data.messages && sessionResponse.data.messages.length > 0) {
          const formattedMessages = sessionResponse.data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.role === 'user',
            timestamp: new Date(msg.createdAt),
            imageUrl: msg.imageUrl,
            inputTokens: msg.inputTokens,
            outputTokens: msg.outputTokens
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast.error('Failed to initialize AI Assistant');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are supported');
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim() || '[Image uploaded]',
      isUser: true,
      timestamp: new Date(),
      imageUrl: previewUrl || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', inputMessage.trim());
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await aiAssistantAPI.sendMessage(formData);

      if (response.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          isUser: false,
          timestamp: new Date(),
          inputTokens: response.data.inputTokens,
          outputTokens: response.data.outputTokens
        };

        setTimeout(() => {
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          setIsLoading(false);
          
          // Update session data
          if (response.data.session) {
            setSession(response.data.session);
          }
        }, 800 + Math.random() * 800);

      } else {
        throw new Error(response.message || 'Failed to get response');
      }

    } catch (error: any) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble right now. Please try again later or check your connection.",
        isUser: false,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        setIsLoading(false);
      }, 1000);

      toast.error('Failed to send message');
    } finally {
      removeSelectedImage();
    }
  };

  const handleSendMessage = () => {
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
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

        {/* AI Assistant popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full h-full lg:max-w-md lg:h-[580px] bg-black border-0 lg:border lg:border-[#72c306]/30 rounded-none lg:rounded-3xl shadow-2xl shadow-[#72c306]/20 flex flex-col overflow-hidden z-[10000] pointer-events-auto"
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
                  <h3 className="text-white font-semibold">AI Assistant</h3>
                  <p className="text-gray-400 text-sm">Marketing Expert • Gemini 2.5 Pro</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSettings}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
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
          </div>

          {/* Tabs */}
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 gap-1 mx-4 mt-2 flex-shrink-0">
                <TabsTrigger
                  value="chat"
                  className="flex items-center justify-center space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-3 py-2 border border-transparent hover:border-[#72c306]/30 transition-colors text-sm"
                >
                  <Bot className="h-4 w-4" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="flex items-center justify-center space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-3 py-2 border border-transparent hover:border-[#72c306]/30 transition-colors text-sm"
                >
                  <Settings className="h-4 w-4" />
                  <span>Stats</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-2">
                {/* Chat messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20 scrollbar-hide">
                  {messages.map((message) => (
                    <AIAssistantChatBubble key={message.id} message={message} />
                  ))}
                  
                  {isTyping && <AIAssistantTypingIndicator />}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Image preview */}
                {previewUrl && (
                  <div className="px-4 py-2">
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border border-[#72c306]/30"
                      />
                      <button
                        onClick={removeSelectedImage}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input area */}
                <div className="flex-shrink-0 p-4 border-t border-[#72c306]/20 bg-black/95 backdrop-blur-sm">
                  <div className="flex space-x-2">
                    <div className="flex space-x-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about digital marketing..."
                      disabled={isLoading}
                      className="flex-1 bg-gray-800/50 border-gray-600/50 focus:border-[#72c306] text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white px-4"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Stats indicator */}
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-xs text-gray-500">
                      {session ? `Session: ${session.totalMessages || 0} messages, ${session.totalTokens || 0} tokens` : 'Loading session...'}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="flex-1 p-4 overflow-y-auto">
                {session ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-white font-semibold mb-4">Session Statistics</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-sm">Messages</p>
                        <p className="text-white font-bold text-xl">{session.totalMessages || 0}</p>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-sm">Total Tokens</p>
                        <p className="text-white font-bold text-xl">{session.totalTokens || 0}</p>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-sm">Input Tokens</p>
                        <p className="text-white font-bold text-xl">{session.inputTokens || 0}</p>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-sm">Output Tokens</p>
                        <p className="text-white font-bold text-xl">{session.outputTokens || 0}</p>
                      </div>
                    </div>
                    {session.lastMessageAt && (
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">
                          Last activity: {new Date(session.lastMessageAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    Loading statistics...
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>

      {/* Settings Modal */}
      <AIAssistantSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </AnimatePresence>
  );
};

export default AIAssistantPopup;