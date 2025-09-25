'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Clock,
  Ban,
  Zap,
  Facebook,
  Instagram,
  Music
} from 'lucide-react';

interface UniversalLoadingModalProps {
  isOpen: boolean;
  progress: string;
  serviceType: 'image' | 'caption';
  includeBusinessInfo: boolean;
  imageCount?: number; // For image generation
  platform?: string; // For caption generation
}

const UniversalLoadingModal: React.FC<UniversalLoadingModalProps> = ({
  isOpen,
  progress,
  serviceType,
  includeBusinessInfo,
  imageCount = 1,
  platform = 'INSTAGRAM'
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
    if (progress.includes('Uploading') || progress.includes('Preparing')) {
      setProgressPercentage(10);
    } else if (progress.includes('business context') || progress.includes('Analyzing')) {
      setProgressPercentage(25);
    } else if (progress.includes('Enhancing') || progress.includes('AI') || progress.includes('Creating variations')) {
      setProgressPercentage(45);
    } else if (progress.includes('final prompt') || progress.includes('Creating') || progress.includes('Generating captions')) {
      setProgressPercentage(65);
    } else if (progress.includes('Generating') || progress.includes('Evaluating')) {
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK':
        return <Facebook className="h-4 w-4 text-blue-500" />;
      case 'INSTAGRAM':
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'TIKTOK':
        return <Music className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  // Calculate total requests based on service type
  const getTotalRequests = () => {
    if (serviceType === 'image') {
      // Image: 1 analysis + 1 prompt creation + number of images + business info (optional)
      return 2 + imageCount + (includeBusinessInfo ? 1 : 0);
    } else {
      // Caption: 2 fixed requests + business info (optional)
      return 2 + (includeBusinessInfo ? 1 : 0);
    }
  };

  // Get service-specific content
  const getServiceContent = () => {
    if (serviceType === 'image') {
      return {
        icon: <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
        title: `Generating ${imageCount} Image${imageCount > 1 ? 's' : ''}`,
        subtitle: 'Creating high-quality images with Imagen 4.0',
        aiModel: 'Gemini 2.5 Pro + Imagen 4.0'
      };
    } else {
      return {
        icon: <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
        title: `Generating Captions for ${platform}`,
        subtitle: 'Creating engaging captions with AI analysis',
        aiModel: 'Gemini 2.5 Pro'
      };
    }
  };

  const serviceContent = getServiceContent();

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={() => {}} // Prevent closing
    >
      <DialogContent
        className="bg-black border border-[#72c306]/30 text-white max-w-[90vw] w-full max-h-[85vh] sm:max-h-[90vh] p-0 [&>button]:hidden overflow-y-auto"
        onPointerDownOutside={preventClose}
        onEscapeKeyDown={preventClose}
        onInteractOutside={preventClose}
      >
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3">
            <div className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center ${pulseAnimation ? 'animate-pulse' : ''}`}>
              {serviceContent.icon}
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
              {serviceContent.title}
            </h2>
            <div className="text-gray-400 text-xs sm:text-sm flex items-center justify-center space-x-2">
              <span>{serviceContent.subtitle}</span>
              {serviceType === 'caption' && getPlatformIcon(platform)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-sm sm:text-base">Progress</span>
              <span className="text-[#72c306] font-bold text-sm sm:text-base">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-gray-800"
            />
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-400">
                <Clock className="h-3 w-3 inline mr-1" />
                {formatTime(timeElapsed)}
              </span>
              <span className="text-gray-400">
                <Zap className="h-3 w-3 inline mr-1" />
                {getTotalRequests()} requests
              </span>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="text-[#72c306] flex-shrink-0">
                <div className="animate-spin">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-xs sm:text-sm break-words">
                  {progress || `Initializing ${serviceType === 'image' ? 'image generation' : 'caption generation'}...`}
                </p>
              </div>
            </div>
          </div>

          {/* Service-specific Process Steps */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 sm:p-4">
            <h4 className="text-white font-medium text-sm mb-2 sm:mb-3">AI Processing Steps</h4>
            <div className="space-y-2">
              {serviceType === 'image' ? (
                <>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="h-4 w-4 rounded-full bg-[#72c306]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#72c306] font-bold text-xs">1</span>
                    </div>
                    <span className="text-gray-300">Analyze & enhance your prompt</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold text-xs">2</span>
                    </div>
                    <span className="text-gray-300">Create optimized final prompt</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="h-4 w-4 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 font-bold text-xs">3</span>
                    </div>
                    <span className="text-gray-300">Generate {imageCount} high-quality images</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="h-4 w-4 rounded-full bg-[#72c306]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#72c306] font-bold text-xs">1</span>
                    </div>
                    <span className="text-gray-300">Analyze image & generate 3 captions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm">
                    <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold text-xs">2</span>
                    </div>
                    <span className="text-gray-300">Evaluate engagement & performance</span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-700 text-center">
              <span className="text-[#72c306] text-xs font-medium">
                Powered by {serviceContent.aiModel}
              </span>
            </div>
          </div>

          {/* Critical Warning - Compact */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 sm:space-y-3 flex-1">
                <h4 className="text-red-400 font-bold text-sm sm:text-lg">
                  Do Not Close This Window
                </h4>
                <div className="text-red-300 text-xs sm:text-sm space-y-1 sm:space-y-2">
                  <p>• Don't close browser or navigate away</p>
                  <p>• Don't refresh the page or close computer</p>
                  <p>• {serviceType === 'image' ? 'Image generation' : 'Caption generation'} is processing with AI</p>
                </div>
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 sm:p-3">
                  <p className="text-red-200 text-xs sm:text-sm font-medium leading-relaxed">
                    ⚠️ <strong>IMPORTANT:</strong> Interrupting this process will result in loss of your AI requests. Please wait until completion.
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

export default UniversalLoadingModal;