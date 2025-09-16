
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Eye, CheckCircle, Loader2, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Share } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { captionsAPI, Platform, CaptionFormat, ProductAnalysis, CaptionResult, validateCaptionFile, fileToBase64 } from '@/lib/captions-api';
import { handleApiError } from '@/lib/api';

const SmartCaptionsPage = () => {
  // Core states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Simplified flow states
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [platformResults, setPlatformResults] = useState<CaptionResult[]>([]);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  
  // Results states
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  
  
  // No analytics/history in simplified flow

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateCaptionFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    toast.success('Media image uploaded successfully');
    // Auto-run multilayered analysis after upload
    handleAnalyzeOnly(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', { value: input });
      handleImageSelect(changeEvent as any);
    }
  };

  const selectPlatform = (platform: Platform) => {
    setSelectedPlatform(platform);
  };

  const selectFormat = (format: CaptionFormat) => {
    setSelectedFormat(format);
  };

  const handleAnalyzeOnly = async (fileParam?: File) => {
    const file = fileParam || selectedImage;
    if (!file) {
      toast.error('Please select media image');
      return;
    }
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStage('Analyzing media/offering...');
    setProductAnalysis(null);
    try {
      const stages = [
        'Analyzing offering intelligence...',
        'Detecting target audience...',
        'Scoring brand tone & pricing...'
      ];
      let currentStage = 0;
      const progressInterval = setInterval(() => {
        if (currentStage < stages.length) {
          setProcessingStage(stages[currentStage]);
          setProcessingProgress((currentStage + 1) * (85 / stages.length));
          currentStage++;
        }
      }, 500);

      const imageData = await fileToBase64(file);
      const response = await captionsAPI.analyze({
        imageData,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);
      setProcessingStage('Complete!');
      if (response.success) {
        setProductAnalysis(response.data.productAnalysis);
        toast.success('Analysis completed');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProcessingProgress(0);
        setProcessingStage('');
      }, 1200);
    }
  };

  const openPlatformModal = async (platform: Platform) => {
    if (!productAnalysis) {
      toast.error('Run analysis first');
      return;
    }
    setActivePlatform(platform);
    setShowPlatformModal(true);
    setPlatformResults([]);
    try {
      const resp = await captionsAPI.generatePlatformCaptions({
        analysis: productAnalysis,
        platform,
        count: 3,
        format: CaptionFormat.MEDIUM
      });
      if (resp.success) {
        setPlatformResults(resp.data.results || []);
      } else {
        throw new Error(resp.message);
      }
    } catch (e: any) {
      toast.error(handleApiError(e));
      setShowPlatformModal(false);
    }
  };

  const copyToClipboard = (text: string, type: string = 'caption') => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  // helper removed (mass generated captions no longer shown)

  // Platform-specific post mockup components
  const InstagramPostMockup = ({ result, imageUrl }: { result: CaptionResult; imageUrl: string }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-sm mx-auto">
      {/* Instagram Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">your_brand</span>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-600" />
      </div>
      
      {/* Instagram Image */}
      <div className="aspect-square">
        <img src={imageUrl} alt="Media" className="w-full h-full object-cover" />
      </div>
      
      {/* Instagram Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Heart className="h-6 w-6 text-gray-700" />
            <MessageCircle className="h-6 w-6 text-gray-700" />
            <Send className="h-6 w-6 text-gray-700" />
          </div>
          <Bookmark className="h-6 w-6 text-gray-700" />
        </div>
        
        <div className="mb-2">
          <span className="font-semibold text-gray-900 text-sm">1,234 likes</span>
        </div>
        
        {/* Caption */}
        <div className="text-sm text-gray-900">
          <span className="font-semibold">your_brand</span>{' '}
          {result.caption}
        </div>
        
        {/* Hashtags */}
        {result.hashtags.length > 0 && (
          <div className="mt-2 text-sm">
            {result.hashtags.slice(0, 5).map((hashtag, idx) => (
              <span key={idx} className="text-blue-500 mr-1">
                {hashtag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500">2 hours ago</div>
      </div>
    </div>
  );

  const FacebookPostMockup = ({ result, imageUrl }: { result: CaptionResult; imageUrl: string }) => (
    <div className="bg-white rounded-lg shadow-lg max-w-lg mx-auto">
      {/* Facebook Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
          <span className="text-white font-bold">B</span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Your Brand</div>
          <div className="text-xs text-gray-500">2 hours ago • 🌍</div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-600" />
      </div>
      
      {/* Facebook Caption */}
      <div className="p-4">
        <p className="text-gray-900 text-sm leading-relaxed mb-3">{result.caption}</p>
        {result.hashtags.length > 0 && (
          <div className="mb-3">
            {result.hashtags.slice(0, 5).map((hashtag, idx) => (
              <span key={idx} className="text-blue-600 text-sm mr-2">
                {hashtag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Facebook Image */}
      <div className="aspect-video">
        <img src={imageUrl} alt="Media" className="w-full h-full object-cover" />
      </div>
      
      {/* Facebook Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
          <span>👍😍❤️ 124</span>
          <span>12 comments • 5 shares</span>
        </div>
        
        <div className="flex items-center justify-around border-t border-gray-200 pt-2">
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <span>👍</span>
            <span className="text-sm">Like</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">Comment</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <Share className="h-4 w-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );

  const TikTokPostMockup = ({ result, imageUrl }: { result: CaptionResult; imageUrl: string }) => (
    <div className="bg-black rounded-lg overflow-hidden shadow-lg max-w-xs mx-auto relative">
      {/* TikTok Video Area */}
      <div className="aspect-[9/16] relative">
        <img src={imageUrl} alt="Media" className="w-full h-full object-cover" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </div>
        
        {/* TikTok Right Side Actions */}
        <div className="absolute right-3 bottom-20 flex flex-col space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mb-1">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white -mt-3 mx-auto"></div>
          </div>
          
          <div className="text-center text-white">
            <Heart className="h-8 w-8 mx-auto mb-1" />
            <span className="text-xs">12.3K</span>
          </div>
          
          <div className="text-center text-white">
            <MessageCircle className="h-8 w-8 mx-auto mb-1" />
            <span className="text-xs">1,234</span>
          </div>
          
          <div className="text-center text-white">
            <Share className="h-8 w-8 mx-auto mb-1" />
            <span className="text-xs">567</span>
          </div>
        </div>
        
        {/* TikTok Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-white">
            <div className="font-semibold text-sm mb-1">@your_brand</div>
            <p className="text-sm leading-tight mb-2">{result.caption}</p>
            {result.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.hashtags.slice(0, 3).map((hashtag, idx) => (
                  <span key={idx} className="text-blue-300 text-xs">
                    {hashtag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // history UI removed in simplified flow

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto"
      >
        {/* Page Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Smart Captions Enterprise</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400">AI-powered caption generation with performance analytics</p>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[#72c306]/20 text-[#72c306] border border-[#72c306]/40 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" /> Best-Quality Consensus
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats removed */}
          </div>
        </motion.div>
        

        {/* Main Content - Full Width Layout */}
        <div className="space-y-6 mb-8">
          {/* Upload Section */}
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Upload className="h-5 w-5 mr-2 text-[#72c306]" />
              Media Image
            </h3>

            <div
              className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-[#72c306]/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Media preview"
                    className="max-h-40 mx-auto rounded-lg"
                  />
                  <div className="text-sm text-gray-400">
                    <p className="font-medium text-white">{selectedImage?.name}</p>
                    <p>{selectedImage && (selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview('');
                    }}
                    className="text-white border-gray-700 hover:bg-gray-800"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium">Drop media image here</p>
                    <p className="text-gray-400 text-sm">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="caption-image-upload"
                  />
                  <label htmlFor="caption-image-upload" className="cursor-pointer">
                    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#72c306]/50 bg-transparent text-[#72c306] hover:bg-[#72c306]/10 hover:text-[#72c306] hover:border-[#72c306] h-10 px-4 py-2">
                      Browse Files
                    </span>
                  </label>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WebP up to 10MB
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Platform Selection (hidden in simplified flow) */}
          {false && (
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Sparkles className="h-5 w-5 mr-2 text-[#72c306]" />
              Select Platforms
            </h3>

            <div className="space-y-3">
              {platforms.map((platform) => {
                const isSelected = selectedPlatform === platform.id;
                return (
                  <div
                    key={platform.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#72c306] bg-[#72c306]/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => selectPlatform(platform.id as Platform)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-[#72c306] bg-[#72c306]'
                          : 'border-gray-600'
                      }`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-white">{platform.name}</h4>
                        </div>
                        <p className="text-sm text-gray-400">{platform.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {platform.optimalLength} • {platform.hashtagStrategy}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
          )}

          {/* Format Selection (hidden - simplified flow) */}
          {false && (
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            ...
          </motion.div>
          )}
        </div>

        {/* AI Analysis Results */}
        {productAnalysis && (
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Eye className="h-5 w-5 mr-2 text-[#72c306]" />
              AI Offering Analysis (Product/Service/Digital/Event)
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Offering Intelligence</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">Offering: <span className="text-white">{productAnalysis.productType}</span></p>
                  <p className="text-gray-400">Category: <span className="text-white">{productAnalysis.productCategory}</span></p>
                  <p className="text-gray-400">Price Tier: <span className="text-white capitalize">{productAnalysis.priceIndicator}</span></p>
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Target Audience</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">Primary: <span className="text-white">{productAnalysis.targetAudience}</span></p>
          {/* Platforms quick generate (moved below) */}
                  <p className="text-gray-400">Brand Tone: <span className="text-white">{productAnalysis.brandTone}</span></p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {productAnalysis.emotionalTriggers.slice(0, 3).map((trigger, idx) => (
                      <span key={idx} className="px-2 py-1 bg-[#72c306]/20 text-[#72c306] text-xs rounded-full">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Key Features</h4>
                <div className="space-y-1">
                  {productAnalysis.keyFeatures.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-[#72c306]" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Platforms quick generate */}
        {productAnalysis && (
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Sparkles className="h-5 w-5 mr-2 text-[#72c306]" />
              Generate Captions by Platform
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[Platform.FACEBOOK, Platform.INSTAGRAM, Platform.TIKTOK].map((p) => (
                <button
                  key={p}
                  onClick={() => openPlatformModal(p)}
                  className="p-6 border border-gray-700 hover:border-[#72c306] rounded-lg bg-gray-800/40 hover:bg-[#72c306]/5 transition"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white text-xl font-bold">
                      {p === Platform.INSTAGRAM ? 'IG' : p === Platform.FACEBOOK ? 'FB' : 'TT'}
                    </div>
                    <div className="mt-2 text-white font-medium">{p}</div>
                    <div className="text-xs text-gray-400">Click to preview 3 variations</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Generated captions section removed in simplified flow */}

        {/* Platform Modal */}
        {showPlatformModal && (
          <motion.div
            variants={fadeInUp}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-5xl w-full mx-4 relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setShowPlatformModal(false)}
              >
                ✕
              </button>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {activePlatform} Preview — 3 Variations
                </h3>
                <p className="text-gray-400 text-sm">Rendered with platform layout preview</p>
              </div>

              {platformResults.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin inline-block mr-2 text-[#72c306]" />
                  Generating variations...
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {platformResults.map((result) => (
                    <div key={result.id} className="space-y-3">
                      <div className="text-sm text-gray-400">v{result.version}</div>
                      {activePlatform === Platform.INSTAGRAM && imagePreview && (
                        <InstagramPostMockup result={result} imageUrl={imagePreview} />
                      )}
                      {activePlatform === Platform.FACEBOOK && imagePreview && (
                        <FacebookPostMockup result={result} imageUrl={imagePreview} />
                      )}
                      {activePlatform === Platform.TIKTOK && imagePreview && (
                        <TikTokPostMockup result={result} imageUrl={imagePreview} />
                      )}
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-300">
                        <div className="font-medium text-white mb-1">Caption</div>
                        <div className="line-clamp-3">{result.caption}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <motion.div
            variants={fadeInUp}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Generating Smart Captions
                </h3>
                <p className="text-gray-400 mb-4">
                  {processingStage}
                </p>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {Math.round(processingProgress)}% Complete
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default SmartCaptionsPage;
                
