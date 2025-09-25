'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Image as ImageIcon,
  Sparkles,
  Clock,
  Ban,
  Zap
} from 'lucide-react';

interface GenerationLoadingModalProps {
  isOpen: boolean;
  progress: string;
  includeBusinessInfo: boolean;
  imageCount: number;
}

const GenerationLoadingModal: React.FC<GenerationLoadingModalProps> = ({
  isOpen,
  progress,
  includeBusinessInfo,
  imageCount
}) => {
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [pulseAnimation, setPulseAnimation] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setProgressPercentage(0);
      setTimeElapsed(0);
      return;
    }

    // Timer for elapsed time
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgressPercentage(prev => Math.min(prev + 2, 95)); // Max 95% until completion
    }, 1000);

    // Pulse animation timer
    const pulseInterval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 1500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(progressInterval);
      clearInterval(pulseInterval);
    };
  }, [isOpen]);

  // Update progress based on actual progress message
  useEffect(() => {
    if (progress.includes('Preparing')) {
      setProgressPercentage(10);
    } else if (progress.includes('business context') || progress.includes('Analyzing')) {
      setProgressPercentage(25);
    } else if (progress.includes('Enhancing') || progress.includes('AI')) {
      setProgressPercentage(45);
    } else if (progress.includes('final prompt') || progress.includes('Creating')) {
      setProgressPercentage(65);
    } else if (progress.includes('Generating')) {
      setProgressPercentage(85);
    } else if (progress.includes('completed') || progress.includes('saving')) {
      setProgressPercentage(100);
    }
  }, [progress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const preventClose = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  // Prevent modal from closing
  useEffect(() => {
    if (isOpen) {
      // Disable Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Disable browser back button
      const handlePopState = (e: PopStateEvent) => {
        if (isOpen) {
          window.history.pushState(null, '', window.location.href);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('popstate', handlePopState);
      
      // Push a dummy state to prevent back navigation
      window.history.pushState(null, '', window.location.href);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={() => {}} // Prevent closing
    >
      <DialogContent 
        className="bg-black border border-[#72c306]/30 text-white max-w-lg p-0 [&>button]:hidden" // Hide close button, smaller width
        onPointerDownOutside={preventClose}
        onEscapeKeyDown={preventClose}
        onInteractOutside={preventClose}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center ${pulseAnimation ? 'animate-pulse' : ''}`}>
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
              Generating {imageCount} Images
            </h2>
            <p className="text-gray-400 text-sm">
              Creating high-quality images with Imagen 4.0
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Progress</span>
              <span className="text-[#72c306] font-bold">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-gray-800"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                <Clock className="h-3 w-3 inline mr-1" />
                {formatTime(timeElapsed)}
              </span>
              <span className="text-gray-400">
                <Zap className="h-3 w-3 inline mr-1" />
                {3 + imageCount + (includeBusinessInfo ? 1 : 0)} requests
              </span>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="text-[#72c306]">
                <div className="animate-spin">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  {progress || 'Initializing generation...'}
                </p>
              </div>
            </div>
          </div>

          {/* Critical Warning */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-red-400 font-medium flex items-center space-x-2">
                  <Ban className="h-4 w-4" />
                  <span>Do Not Close This Window</span>
                </h4>
                <div className="text-red-300 text-sm space-y-1">
                  <p>• Don't close browser or navigate away</p>
                  <p>• Don't refresh or close computer</p>
                </div>
                <div className="bg-red-500/20 border border-red-500/30 rounded p-2 mt-2">
                  <p className="text-red-200 text-xs font-medium">
                    ⚠️ Interrupting will NOT refund your requests!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerationLoadingModal;