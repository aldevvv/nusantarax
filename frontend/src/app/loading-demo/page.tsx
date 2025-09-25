'use client';

import React, { useState } from 'react';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LoadingDemoPage = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [showLoadingWithProgress, setShowLoadingWithProgress] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const handleShowSimpleLoading = () => {
    setShowLoading(true);
    // Auto hide after 5 seconds for demo
    setTimeout(() => setShowLoading(false), 5000);
  };

  const handleShowProgressLoading = () => {
    setShowLoadingWithProgress(true);
    // Auto hide after 10 seconds for demo
    setTimeout(() => setShowLoadingWithProgress(false), 10000);
  };

  const handleShowCustomLoading = () => {
    const message = customMessage || 'Authenticating user...';
    setShowLoading(true);
    // Auto hide after 6 seconds for demo
    setTimeout(() => setShowLoading(false), 6000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent mb-4">
              NusantaraX Loading Screen Demo
            </h1>
            <p className="text-gray-400 text-lg">
              Test the new loading screen component with different configurations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Simple Loading */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/50 border border-[#72c306]/20 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-xl font-bold text-[#72c306]">Simple Loading</h3>
              <p className="text-gray-400 text-sm">
                Basic loading screen with default message and animations
              </p>
              <Button
                onClick={handleShowSimpleLoading}
                className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
              >
                Show Simple Loading
              </Button>
            </motion.div>

            {/* Loading with Progress */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/50 border border-[#72c306]/20 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-xl font-bold text-[#72c306]">With Progress Bar</h3>
              <p className="text-gray-400 text-sm">
                Loading screen with animated progress bar
              </p>
              <Button
                onClick={handleShowProgressLoading}
                className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
              >
                Show Progress Loading
              </Button>
            </motion.div>

            {/* Custom Message */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900/50 border border-[#72c306]/20 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-xl font-bold text-[#72c306]">Custom Message</h3>
              <input
                type="text"
                placeholder="Enter custom message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white text-sm focus:border-[#72c306] focus:outline-none"
              />
              <Button
                onClick={handleShowCustomLoading}
                className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
              >
                Show Custom Loading
              </Button>
            </motion.div>
          </div>

          <div className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <ul className="space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#72c306] rounded-full"></div>
                  <span className="text-gray-300">Pure Black background matching theme</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#72c306] rounded-full"></div>
                  <span className="text-gray-300">Animated NusantaraX logo with rotation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#72c306] rounded-full"></div>
                  <span className="text-gray-300">Interactive 3D globe animation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#72c306] rounded-full"></div>
                  <span className="text-gray-300">Consistent Neon Green color scheme</span>
                </li>
              </ul>
              <ul className="space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#8fd428] rounded-full"></div>
                  <span className="text-gray-300">Customizable loading messages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#8fd428] rounded-full"></div>
                  <span className="text-gray-300">Optional progress bar display</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#8fd428] rounded-full"></div>
                  <span className="text-gray-300">Animated background elements</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#8fd428] rounded-full"></div>
                  <span className="text-gray-300">Responsive design for all devices</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Click any button above to see the loading screen in action. It will auto-dismiss after a few seconds.
            </p>
          </div>
        </motion.div>

        {/* Loading Screens */}
        {showLoading && (
          <NusantaraLoadingScreen
            message={customMessage || "Loading..."}
          />
        )}

        {showLoadingWithProgress && (
          <NusantaraLoadingScreen
            message="Processing your request"
            showProgress={true}
          />
        )}
      </div>
    </div>
  );
};

export default LoadingDemoPage;