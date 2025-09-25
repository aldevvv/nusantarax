'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from '@/components/ui/globe';

interface NusantaraLoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

const NusantaraLoadingScreen: React.FC<NusantaraLoadingScreenProps> = ({
  message = "Loading...",
  showProgress = false
}) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animated dots for loading text
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    // Progress animation if enabled
    let progressInterval: NodeJS.Timeout;
    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 3;
        });
      }, 200);
    }

    return () => {
      clearInterval(dotsInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [showProgress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-[#72c306]/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-[#8fd428]/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2], 
            rotate: [360, 180, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl"
          animate={{ 
            x: [0, 100, -100, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.5, 0.8, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 px-6">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center items-center mb-4"
        >
          {/* Logo Only - Larger and Centered */}
          <motion.img
            src="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png"
            alt="NusantaraX Logo"
            className="h-24 w-24 object-contain"
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>

        {/* Globe Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative w-[350px] h-[350px] max-w-[70vw] max-h-[35vh]"
        >
          <Globe
            config={{
              width: 350,
              height: 350,
              onRender: () => {},
              devicePixelRatio: 2,
              phi: 0,
              theta: 0.3,
              dark: 1,
              diffuse: 0.4,
              mapSamples: 16000,
              mapBrightness: 1.2,
              baseColor: [0.3, 0.3, 0.3],
              markerColor: [114 / 255, 195 / 255, 6 / 255],
              glowColor: [114 / 255, 195 / 255, 6 / 255],
              markers: [
                { location: [-6.2, 106.816], size: 0.1 }, // Jakarta, Indonesia
                { location: [-7.797, 110.370], size: 0.08 }, // Yogyakarta, Indonesia
                { location: [-7.257, 112.752], size: 0.08 }, // Surabaya, Indonesia
                { location: [3.597, 98.678], size: 0.06 }, // Medan, Indonesia
                { location: [-5.135, 119.423], size: 0.07 }, // Makassar, Indonesia
                { location: [1.290, 103.851], size: 0.08 }, // Singapore
                { location: [3.139, 101.687], size: 0.07 }, // Kuala Lumpur, Malaysia
                { location: [14.599, 120.984], size: 0.06 }, // Manila, Philippines
                { location: [13.756, 100.501], size: 0.07 }, // Bangkok, Thailand
                { location: [10.823, 106.629], size: 0.06 }, // Ho Chi Minh City, Vietnam
              ],
            }}
          />
          
          {/* Glow Effect around Globe */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 blur-xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="text-white text-lg font-medium">
            {message}{dots}
          </div>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="w-64 max-w-[80vw]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm text-[#72c306] font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  className="h-2 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
          
          {/* Pulsing dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-[#72c306] rounded-full"
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.4, 1, 0.4],
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
        </motion.div>
      </div>
    </div>
  );
};

export default NusantaraLoadingScreen;