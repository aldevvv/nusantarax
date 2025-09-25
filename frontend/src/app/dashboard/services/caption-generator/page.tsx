'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UniversalLoadingModal from '@/components/ui/UniversalLoadingModal';
import CaptionHistoryTab from './components/CaptionHistoryTab';
import { captionGeneratorAPI, billingAPI, handleApiError } from '@/lib/api';
import {
  MessageSquare,
  Upload,
  Info,
  Settings,
  Hash,
  Eye,
  Sparkles,
  History,
  Facebook,
  Instagram,
  Music,
  Clock,
  Zap,
  AlertCircle,
  Crown,
  X,
  ImageIcon,
  Smile,
  Camera,
  Palette
} from 'lucide-react';

const CaptionGeneratorPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    selectedImage: null as File | null,
    platform: 'INSTAGRAM',
    captionIdea: '',
    targetAudience: '',
    tone: 'CASUAL',
    captionLength: 'MEDIUM',
    language: 'EN',
    includeBusinessInfo: false,
    useEmojis: true,
    useHashtags: true,
  });

  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await billingAPI.getCurrentSubscription();
      
      if (response.success && response.data) {
        setSubscriptionInfo(response.data);
      } else {
        console.error('Failed to load subscription info:', response.message);
      }
    } catch (error: any) {
      console.error('Error loading subscription info:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const checkRequestLimits = (requestsNeeded: number): { canGenerate: boolean; message?: string } => {
    if (!subscriptionInfo) {
      return { canGenerate: false, message: 'Unable to verify subscription limits. Please try again.' };
    }

    if (subscriptionInfo.requestsLimit === -1) {
      return { canGenerate: true };
    }

    if (subscriptionInfo.requestsRemaining < requestsNeeded) {
      const planName = subscriptionInfo.plan.displayName;
      return {
        canGenerate: false,
        message: `Not enough requests remaining. You need ${requestsNeeded} requests but only have ${subscriptionInfo.requestsRemaining} remaining on your ${planName} plan.`
      };
    }

    return { canGenerate: true };
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-[#72c306]';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-[#72c306]';
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, selectedImage: file }));
      } else {
        toast.error('Please upload a valid image file');
      }
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, selectedImage: null }));
    toast.success('Image removed');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleGenerate = async () => {
    if (!formData.selectedImage) {
      toast.error('Please upload an image first');
      return;
    }

    // Check subscription limits (2 requests needed)
    const requestsNeeded = 2 + (formData.includeBusinessInfo ? 1 : 0);
    const limitCheck = checkRequestLimits(requestsNeeded);

    if (!limitCheck.canGenerate) {
      toast.error(limitCheck.message, {
        action: {
          label: 'Upgrade Plan',
          onClick: () => {
            window.location.href = '/dashboard/billing';
          },
        },
        duration: 8000,
      });
      return;
    }

    if (subscriptionInfo && subscriptionInfo.requestsLimit !== -1 && subscriptionInfo.requestsRemaining <= 10) {
      toast.warning(`Warning: Only ${subscriptionInfo.requestsRemaining} requests remaining. Consider upgrading your plan.`, {
        action: {
          label: 'View Plans',
          onClick: () => {
            window.location.href = '/dashboard/billing';
          },
        },
        duration: 6000,
      });
    }

    setLoading(true);
    setShowLoadingModal(true);
    setProgress('Preparing image upload...');

    try {
      // Step 1: Upload and start processing
      setProgress('Uploading image to server...');
      
      const generateData = {
        image: formData.selectedImage,
        captionIdea: formData.captionIdea || undefined,
        platform: formData.platform as 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK',
        targetAudience: formData.targetAudience || undefined,
        tone: formData.tone as 'PROFESSIONAL' | 'CASUAL' | 'FUNNY' | 'INSPIRING' | 'SALES' | 'EDUCATIONAL' | 'STORYTELLING',
        captionLength: formData.captionLength as 'SHORT' | 'MEDIUM' | 'LONG',
        language: formData.language as 'ID' | 'EN',
        useEmojis: formData.useEmojis,
        useHashtags: formData.useHashtags,
        includeBusinessInfo: formData.includeBusinessInfo,
      };

      // 🔍 DEBUG: Log what we're sending to the API
      console.log('🔍 DEBUG Frontend API Call Data:', {
        hasImage: !!generateData.image,
        language: generateData.language,
        languageType: typeof generateData.language,
        platform: generateData.platform,
        tone: generateData.tone,
        fullGenerateData: generateData
      });

      // Step 2: Analyze image and generate captions
      setProgress('Analyzing image with AI...');
      
      // Call API
      const response = await captionGeneratorAPI.generateCaptions(generateData);
      
      if (response.success) {
        setProgress('Caption generation completed!');
        toast.success('Captions generated successfully!');
        
        // Wait a moment to show completion
        setTimeout(() => {
          setShowLoadingModal(false);
          // Navigate to result page
          router.push(`/dashboard/services/caption-generator/result/${response.data.requestId}`);
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to generate captions');
      }
    } catch (error: any) {
      console.error('Caption generation failed:', error);
      setShowLoadingModal(false);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
      loadSubscriptionInfo(); // Refresh subscription info after generation
      setTimeout(() => setProgress(''), 3000);
    }
  };

  const PlatformCard = ({ platform, icon, selected, onClick, description }: any) => (
    <Card
      className={`cursor-pointer transition-all h-full ${
        selected
          ? 'bg-[#72c306]/20 border-[#72c306] shadow-lg shadow-[#72c306]/20'
          : 'bg-gray-900/50 border-gray-700 hover:border-[#72c306]/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="py-4 h-full">
        <div className="text-center space-y-2 flex flex-col justify-between h-full min-h-[80px]">
          <div className="flex flex-col items-center space-y-2">
            <div className={`mx-auto h-8 w-8 rounded-lg flex items-center justify-center ${
              selected ? 'bg-[#72c306]' : 'bg-gray-600'
            }`}>
              {icon}
            </div>
            <p className={`font-medium ${selected ? 'text-[#72c306]' : 'text-white'}`}>
              {platform}
            </p>
          </div>
          <p className="text-xs text-gray-400 leading-tight">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center justify-between">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 w-full">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                  Caption Generator
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-1 leading-relaxed">
                  Generate engaging social media captions with AI analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information Toggle */}
        <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10 mb-4">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Info className="h-4 w-4 text-[#72c306]" />
                <div>
                  <Label htmlFor="business-info-toggle" className="text-white font-medium">
                    Include Business Information
                  </Label>
                  <p className="text-sm text-gray-400">
                    Add your business context to generate more relevant captions
                  </p>
                </div>
              </div>
              <Switch
                id="business-info-toggle"
                checked={formData.includeBusinessInfo}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, includeBusinessInfo: checked }))
                }
                className="data-[state=checked]:bg-[#72c306] data-[state=unchecked]:bg-gray-600 border-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="generate" className="space-y-6 w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 gap-2 sm:gap-4">
            <TabsTrigger
              value="generate"
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-3 py-3 sm:px-6 sm:py-4 border border-transparent hover:border-[#72c306]/30 transition-colors w-full min-h-[50px] sm:min-h-[60px]"
            >
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium">Generate</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-3 py-3 sm:px-6 sm:py-4 border border-transparent hover:border-[#72c306]/30 transition-colors w-full min-h-[50px] sm:min-h-[60px]"
            >
              <History className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            {/* Subscription Status Card */}
            {!subscriptionLoading && subscriptionInfo && (
              <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
                <CardContent className="py-4 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-base sm:text-lg">
                          {subscriptionInfo.plan.displayName}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-1 sm:space-y-0">
                          <span className={`text-sm font-medium ${getUsageColor(subscriptionInfo.usagePercentage)}`}>
                            {subscriptionInfo.requestsUsed} / {subscriptionInfo.requestsLimit === -1 ? '∞' : subscriptionInfo.requestsLimit} requests
                          </span>
                          <span className="text-gray-400 text-sm">
                            {subscriptionInfo.requestsLimit === -1 ? 'Unlimited' : `${subscriptionInfo.requestsRemaining} remaining`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {subscriptionInfo.requestsLimit !== -1 && (
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        {subscriptionInfo.requestsRemaining <= 5 && (
                          <div className="flex items-center justify-center sm:justify-start space-x-2 text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Low on requests!</span>
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={() => window.location.href = '/dashboard/billing'}
                          className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 w-full sm:w-auto px-4 py-2 text-sm font-medium h-10"
                        >
                          <Crown className="h-4 w-4 mr-1" />
                          Upgrade
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {subscriptionInfo.requestsLimit !== -1 && (
                    <div className="w-full bg-gray-800 rounded-full h-2 mt-4">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getUsageBarColor(subscriptionInfo.usagePercentage)}`}
                        style={{ width: `${Math.min(subscriptionInfo.usagePercentage, 100)}%` }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10 w-full">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-white text-lg sm:text-xl">Generate Social Media Captions</CardTitle>
                <CardDescription className="text-gray-400 text-sm sm:text-base">
                  Upload an image and let AI create engaging captions for your social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-4 sm:px-6">
                
                {/* Image Upload - Enhanced with Preview */}
                <div className="space-y-2">
                  <Label className="text-white font-medium">Upload Image *</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer min-h-[200px] flex items-center justify-center ${
                      dragActive
                        ? 'border-[#72c306] bg-[#72c306]/10 scale-105 shadow-lg shadow-[#72c306]/20'
                        : formData.selectedImage
                        ? 'border-[#72c306] bg-[#72c306]/5 hover:bg-[#72c306]/10'
                        : 'border-gray-600 hover:border-[#72c306]/50 hover:bg-gray-800/30'
                    }`}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                    
                    {formData.selectedImage ? (
                      <div className="space-y-4 w-full relative">
                        {/* Remove Button */}
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 z-10 h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        
                        {/* Image Preview - Enhanced */}
                        <div className="mx-auto max-w-sm">
                          <div className="relative group">
                            <img
                              src={URL.createObjectURL(formData.selectedImage)}
                              alt="Uploaded preview"
                              className="w-full max-h-40 object-contain rounded-xl border-2 border-[#72c306]/40 shadow-xl bg-gray-900/20 p-2"
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                              <div className="text-center space-y-1">
                                <ImageIcon className="h-6 w-6 text-white mx-auto" />
                                <p className="text-white text-sm font-medium">Click to change</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* File Info - Enhanced */}
                        <div className="bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg p-3 space-y-1">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="h-4 w-4 rounded-full bg-[#72c306]/30 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-[#72c306]"></div>
                            </div>
                            <p className="text-[#72c306] font-medium">{formData.selectedImage.name}</p>
                          </div>
                          <p className="text-center text-gray-400 text-sm">
                            {(formData.selectedImage.size / 1024 / 1024).toFixed(2)} MB • {formData.selectedImage.type}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto h-20 w-20 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600">
                          <Upload className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                          <p className="text-white font-medium text-lg">Drop your image here</p>
                          <p className="text-gray-400 text-sm">or</p>
                          <p className="text-[#72c306] font-medium">Click to browse</p>
                          <p className="text-gray-400 text-sm">
                            (Max 10MB with supported formats JPG, PNG, WebP)
                          </p>
                          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Camera className="h-3 w-3" />
                              <span>Best For Products</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Palette className="h-3 w-3" />
                              <span>High Quality Recommended</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label className="text-white font-medium">Platform *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <PlatformCard
                      platform="Facebook"
                      icon={<Facebook className="h-4 w-4 text-white" />}
                      selected={formData.platform === 'FACEBOOK'}
                      onClick={() => setFormData(prev => ({ ...prev, platform: 'FACEBOOK' }))}
                      description="Storytelling & engagement"
                    />
                    <PlatformCard
                      platform="Instagram"
                      icon={<Instagram className="h-4 w-4 text-white" />}
                      selected={formData.platform === 'INSTAGRAM'}
                      onClick={() => setFormData(prev => ({ ...prev, platform: 'INSTAGRAM' }))}
                      description="Visual & trendy content"
                    />
                    <PlatformCard
                      platform="TikTok"
                      icon={<Music className="h-4 w-4 text-white" />}
                      selected={formData.platform === 'TIKTOK'}
                      onClick={() => setFormData(prev => ({ ...prev, platform: 'TIKTOK' }))}
                      description="Short & punchy hooks"
                    />
                  </div>
                </div>

                {/* Caption Length Selection */}
                <div className="space-y-2">
                  <Label className="text-white font-medium">Caption Length *</Label>
                  <Select
                    value={formData.captionLength}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, captionLength: value }))}
                  >
                    <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                      <SelectValue placeholder="Select caption length" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-[#72c306]/30 backdrop-blur-xl">
                      <SelectItem value="SHORT" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                        <div className="flex items-center justify-between w-full">
                          <span>Short</span>
                          <span className="text-xs text-gray-400 ml-4">50-100 chars</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="MEDIUM" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                        <div className="flex items-center justify-between w-full">
                          <span>Medium</span>
                          <span className="text-xs text-gray-400 ml-4">150-250 chars</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="LONG" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                        <div className="flex items-center justify-between w-full">
                          <span>Long</span>
                          <span className="text-xs text-gray-400 ml-4">350+ chars</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone Selection */}
                <div className="space-y-2">
                  <Label className="text-white font-medium">Tone *</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}
                  >
                    <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-[#72c306]/30 backdrop-blur-xl">
                      <SelectItem value="PROFESSIONAL" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">Professional</SelectItem>
                      <SelectItem value="CASUAL" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">Casual & Friendly</SelectItem>
                      <SelectItem value="FUNNY" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">Funny & Entertaining</SelectItem>
                      <SelectItem value="INSPIRING" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">Inspiring & Motivational</SelectItem>
                      <SelectItem value="SALES" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">Sales & Promotional</SelectItem>
                      <SelectItem value="EDUCATIONAL" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">Educational</SelectItem>
                      <SelectItem value="STORYTELLING" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">Storytelling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label className="text-white font-medium">Output Language *</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                      <SelectValue placeholder="Select output language" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-[#72c306]/30 backdrop-blur-xl">
                      <SelectItem value="EN" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                        <div className="flex items-center space-x-2">
                          <span>🇺🇸</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ID" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                        <div className="flex items-center space-x-2">
                          <span>🇮🇩</span>
                          <span>Bahasa Indonesia</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Caption Idea (Optional)</Label>
                    <Textarea
                      placeholder="Describe what you want to say about this image..."
                      rows={3}
                      value={formData.captionIdea}
                      onChange={(e) => setFormData(prev => ({ ...prev, captionIdea: e.target.value }))}
                      className="w-full bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/30 text-white placeholder-gray-400 rounded-xl focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 hover:border-[#72c306]/40 transition-all duration-300 resize-none text-base leading-relaxed shadow-inner backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Target Audience (Optional)</Label>
                    <Input
                      placeholder="e.g., Young professionals, Food lovers..."
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="h-12 sm:h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/30 text-white placeholder-gray-400 rounded-xl focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 hover:border-[#72c306]/40 transition-all duration-300 shadow-inner backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Content Preferences - Enhanced with Neon Gradient */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-[#72c306]" />
                    <Label className="text-white font-medium">Content Preferences</Label>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Emoji Toggle - Enhanced */}
                    <Card className="bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/30 shadow-lg shadow-[#72c306]/10 hover:border-[#72c306]/50 transition-all duration-300">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-500/40 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                              <Smile className="h-4 w-4 text-yellow-400" />
                            </div>
                            <div className="min-w-0">
                              <Label className="text-white font-medium text-sm sm:text-base">Use Emojis</Label>
                              <p className="text-xs text-gray-400">Add emojis to make captions more engaging</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.useEmojis}
                            onCheckedChange={(checked) =>
                              setFormData(prev => ({ ...prev, useEmojis: checked }))
                            }
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#72c306] data-[state=checked]:to-[#8fd428] flex-shrink-0"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Hashtags Toggle - Enhanced */}
                    <Card className="bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/30 shadow-lg shadow-[#72c306]/10 hover:border-[#72c306]/50 transition-all duration-300">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/40 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                              <Hash className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <Label className="text-white font-medium text-sm sm:text-base">Use Hashtags</Label>
                              <p className="text-xs text-gray-400">Generate relevant hashtags for reach</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.useHashtags}
                            onCheckedChange={(checked) =>
                              setFormData(prev => ({ ...prev, useHashtags: checked }))
                            }
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#72c306] data-[state=checked]:to-[#8fd428] flex-shrink-0"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview of preferences - Pure Black Background */}
                  <div className="bg-black border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-[#72c306]" />
                      <span className="text-sm text-white font-medium">Preview Style:</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Your captions will be generated for <span className="text-[#72c306] font-medium bg-[#72c306]/10 px-2 py-1 rounded">{formData.platform}</span>
                      <span className={formData.useEmojis ? "text-[#72c306] font-medium" : "text-gray-500"}>
                        {formData.useEmojis ? " with emojis" : " without emojis"}
                      </span> and
                      <span className={formData.useHashtags ? "text-[#72c306] font-medium" : "text-gray-500"}>
                        {formData.useHashtags ? " with hashtags" : " without hashtags"}
                      </span>
                      <span className="text-[#72c306] font-medium"> in {formData.captionLength.toLowerCase()} format</span>
                    </p>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={
                    !formData.selectedImage ||
                    loading ||
                    (subscriptionInfo !== null &&
                     !subscriptionLoading &&
                     subscriptionInfo.requestsLimit !== -1 &&
                     subscriptionInfo.requestsRemaining < (2 + (formData.includeBusinessInfo ? 1 : 0))
                    )
                  }
                  className={`w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25 h-12 sm:h-14 text-sm sm:text-base font-semibold ${
                    subscriptionInfo !== null && !subscriptionLoading && subscriptionInfo.requestsLimit !== -1 && subscriptionInfo.requestsRemaining < (2 + (formData.includeBusinessInfo ? 1 : 0))
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      Generating Captions...
                    </>
                  ) : subscriptionInfo !== null && !subscriptionLoading && subscriptionInfo.requestsLimit !== -1 && subscriptionInfo.requestsRemaining < (2 + (formData.includeBusinessInfo ? 1 : 0)) ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Not Enough Requests
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze & Generate Captions
                    </>
                  )}
                </Button>

                {/* Request Info - Enhanced & More Informative */}
                <div className="bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/30 rounded-xl p-4 shadow-lg shadow-[#72c306]/10">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-[#72c306]" />
                      <span className="text-white font-medium">AI Processing Overview</span>
                    </div>
                    
                    {/* Process Steps */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-black/50 border border-[#72c306]/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-[#72c306]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#72c306] font-bold text-xs">1</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium">Image Analysis</p>
                            <p className="text-gray-400 text-xs">AI analyzes your image & generates 3 captions</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 font-bold text-xs">2</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium">Caption Evaluation</p>
                            <p className="text-gray-400 text-xs">AI analyzes engagement & performance metrics</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary Stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm pt-2 border-t border-gray-700 space-y-2 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white font-bold">2 AI requests</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white font-medium">~30-60 seconds</span>
                        </div>
                      </div>
                      <div className="text-[#72c306] text-xs font-medium text-center sm:text-right">
                        Powered by Gemini 2.5 Pro
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6 w-full">
            <CaptionHistoryTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Loading Modal */}
      <UniversalLoadingModal
        isOpen={showLoadingModal}
        progress={progress}
        serviceType="caption"
        includeBusinessInfo={formData.includeBusinessInfo}
        platform={formData.platform}
      />
    </DashboardLayout>
  );
};

export default CaptionGeneratorPage;