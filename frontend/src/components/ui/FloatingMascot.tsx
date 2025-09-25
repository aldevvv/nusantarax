'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBotPopup from '../chatbot/ChatBotPopup';

const FloatingMascot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
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

  const toggleChatBot = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false); // Hide tooltip when chat is opened
  };

  const closeChatBot = () => {
    setIsOpen(false);
  };

  const handleImageError = () => {
    setImageError(true);
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
                Have any questions? I'm here to help!
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
        onClick={toggleChatBot}
      >
        {/* Main Mascot Image */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="h-20 w-20 shadow-2xl relative group pointer-events-auto">
            {/* Mascot Image */}
            {!imageError ? (
              <img
                src="/NusaX.png"
                alt="NusantaraX Mascot"
                className="w-full h-full object-contain drop-shadow-lg"
                onError={handleImageError}
                onLoad={() => setImageError(false)}
              />
            ) : (
              /* Fallback content when image fails to load */
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white font-bold text-xs rounded-lg">
                NusantaraX<br />Mascot
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      
      {/* ChatBot Popup */}
      <ChatBotPopup isOpen={isOpen} onClose={closeChatBot} />
    </>
  );
};

export default FloatingMascot;