'use client';

import React, { useState } from 'react';
import FloatingChatButton from './FloatingChatButton';
import ChatBotPopup from './ChatBotPopup';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatBot = () => {
    setIsOpen(!isOpen);
  };

  const closeChatBot = () => {
    setIsOpen(false);
  };

  return (
    <>
      <FloatingChatButton onClick={toggleChatBot} isOpen={isOpen} />
      <ChatBotPopup isOpen={isOpen} onClose={closeChatBot} />
    </>
  );
};

export default ChatBot;