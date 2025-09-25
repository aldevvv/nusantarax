'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistantPopup from '../ai-assistant/AIAssistantPopup';
import { Bot } from 'lucide-react';

const FloatingAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip repeatedly every 45 seconds
  useEffect(() => {
    const showTooltipInterval = setInterval(() => {
      if (!isOpen) {
        setShowTooltip(true);
      }
    }, 45000); // Show every 45 seconds

    // Initial show after 3 seconds
    const initialTimer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
      }
    }, 3000);

    return () => {
      clearInterval(showTooltipInterval);
      clearTimeout(initialTimer);
    };
  }, [isOpen]);

  // Auto hide tooltip after some time
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const toggleAIAssistant = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false); // Hide tooltip when chat is opened
  };

  const closeAIAssistant = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Tooltip Modal */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-4 z-[9999] pointer-events-auto"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-black/90 backdrop-blur-sm border border-[#72c306] text-[#72c306] px-4 py-2 rounded-full shadow-2xl shadow-[#72c306]/20 relative">
              {/* Speech bubble arrow */}
              <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-black/90"></div>
              
              <p className="text-sm font-medium whitespace-nowrap">
                Need marketing advice? Let's chat!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-6 right-6 z-[9998] pointer-events-auto cursor-pointer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 2 }}
        style={{ zIndex: 9998 }}
        onClick={toggleAIAssistant}
      >
        {/* AI Assistant Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] shadow-2xl shadow-[#72c306]/25 flex items-center justify-center pointer-events-auto"
        >
          <Bot className="h-8 w-8 text-white" />
        </motion.div>
      </motion.div>
      
      {/* AI Assistant Popup */}
      <AIAssistantPopup isOpen={isOpen} onClose={closeAIAssistant} />
    </>
  );
};

export default FloatingAIAssistant;