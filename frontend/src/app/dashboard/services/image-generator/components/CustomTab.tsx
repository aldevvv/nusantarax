'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Wand2,
  Loader2,
  Lightbulb,
  Image as ImageIcon,
  AlertCircle,
  Crown,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { imageGeneratorAPI, billingAPI, handleApiError } from '@/lib/api';
import UniversalLoadingModal from '@/components/ui/UniversalLoadingModal';
import { useRouter } from 'next/navigation';

interface CustomTabProps {
  includeBusinessInfo: boolean;
}

interface SubscriptionInfo {
  requestsUsed: number;
  requestsLimit: number;
  requestsRemaining: number;
  usagePercentage: number;
  plan: {
    displayName: string;
    name: string;
  };
}

const CustomTab: React.FC<CustomTabProps> = ({ includeBusinessInfo }) => {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [backgroundPreference, setBackgroundPreference] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('3:4');
  const [imageCount, setImageCount] = useState<number>(3);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
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

  const examplePrompts = [
    "Professional product photo of handmade wooden furniture, minimalist style, white background",
    "High-quality image of organic skincare products, natural lighting, marble background",
    "Commercial photography of traditional Indonesian snacks, appetizing presentation, colorful background",
    "Studio shot of modern tech gadgets, sleek design, gradient background",
    "Elegant jewelry collection, luxury presentation, soft lighting, white studio background"
  ];

  const styleOptions = [
    'Modern',
    'Vintage', 
    'Minimalist',
    'Elegant',
    'Playful',
    'Professional',
    'Artistic',
    'Commercial'
  ];

  const backgroundOptions = [
    'White',
    'Transparent', 
    'Colorful',
    'Natural',
    'Studio',
    'Black',
    'Gradient',
    'Textured'
  ];

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const validateForm = (): boolean => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for image generation');
      return false;
    }

    if (prompt.trim().length < 10) {
      toast.error('Please provide a more detailed prompt (at least 10 characters)');
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    const requestsNeeded = 2 + imageCount + (includeBusinessInfo ? 1 : 0);
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

    setIsGenerating(true);
    setGenerationProgress('Preparing generation...');

    try {
      const result = await imageGeneratorAPI.generateFromCustom({
        prompt: prompt.trim(),
        includeBusinessInfo,
        style,
        backgroundPreference,
        aspectRatio,
        imageCount,
      });

      if (result.success) {
        const requestId = result.data.requestId;
        toast.success(`Generated ${result.data.totalImages} images successfully! Redirecting to results...`);
        
        setTimeout(() => {
          router.push(`/dashboard/services/image-generator/result/${requestId}`);
        }, 1500);
      } else {
        if (result.message && result.message.includes('Insufficient requests')) {
          toast.error(result.message, {
            action: {
              label: 'Upgrade Plan',
              onClick: () => {
                window.location.href = '/dashboard/billing';
              },
            },
            duration: 8000,
          });
        } else {
          toast.error(result.message || 'Failed to generate images');
        }
        setGenerationProgress('Generation failed');
      }
    } catch (error: any) {
      console.error('Error generating images:', error);
      
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Insufficient requests') || errorMessage.includes('limit')) {
        toast.error('Request limit exceeded. Please upgrade your plan to continue generating images.', {
          action: {
            label: 'Upgrade Now',
            onClick: () => {
              window.location.href = '/dashboard/billing';
            },
          },
          duration: 10000,
        });
      } else {
        toast.error(errorMessage);
      }
      setGenerationProgress('Generation failed');
    } finally {
      setIsGenerating(false);
      loadSubscriptionInfo();
      setTimeout(() => setGenerationProgress(''), 3000);
    }
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

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      {!subscriptionLoading && subscriptionInfo && (
        <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {subscriptionInfo.plan.displayName}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
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
                <div className="flex items-center space-x-4">
                  {subscriptionInfo.requestsRemaining <= 5 && (
                    <div className="flex items-center space-x-2 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Low on requests!</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/dashboard/billing'}
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade
                  </Button>
                </div>
              )}
            </div>
            
            {subscriptionInfo.requestsLimit !== -1 && (
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getUsageBarColor(subscriptionInfo.usagePercentage)}`}
                  style={{ width: `${Math.min(subscriptionInfo.usagePercentage, 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Prompt Form */}
      <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Wand2 className="h-5 w-5" />
            <span>Custom Image Generation</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Create your own detailed prompt for AI image generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Prompt Input - Enhanced */}
          <div className="space-y-2">
            <Label htmlFor="custom-prompt" className="text-white font-semibold">
              Prompt <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="custom-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Professional product photo of handmade wooden furniture, minimalist style, white background..."
              rows={5}
              className="w-full bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/30 text-white placeholder-gray-400 rounded-xl focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 hover:border-[#72c306]/40 transition-all duration-300 resize-none text-base leading-relaxed shadow-inner backdrop-blur-sm"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{prompt.length} characters</span>
              <span className={prompt.length >= 10 ? 'text-green-400' : 'text-red-400'}>
                Min: 10 characters
              </span>
            </div>
          </div>

          {/* Style Options - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style" className="text-white font-medium">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                  <SelectValue placeholder="Choose a style (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border border-[#72c306]/30 backdrop-blur-xl">
                  {styleOptions.map((styleOption) => (
                    <SelectItem key={styleOption} value={styleOption} className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                      {styleOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background" className="text-white font-medium">Background</Label>
              <Select value={backgroundPreference} onValueChange={setBackgroundPreference}>
                <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                  <SelectValue placeholder="Choose background (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border border-[#72c306]/30 backdrop-blur-xl">
                  {backgroundOptions.map((bgOption) => (
                    <SelectItem key={bgOption} value={bgOption} className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                      {bgOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generation Settings - Enhanced */}
          <div className="border-t border-gray-800 pt-6">
            <h4 className="text-white font-medium mb-4">Generation Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aspect Ratio */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Aspect Ratio
                </Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border border-[#72c306]/30 backdrop-blur-xl">
                    <SelectItem value="1:1" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                      1:1 (Square)
                    </SelectItem>
                    <SelectItem value="3:4" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                      3:4 (Portrait)
                    </SelectItem>
                    <SelectItem value="9:16" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                      9:16 (Tall Portrait)
                    </SelectItem>
                    <SelectItem value="16:9" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                      16:9 (Wide)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Count */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Number of Images
                </Label>
                <Select value={imageCount.toString()} onValueChange={(value) => setImageCount(parseInt(value))}>
                  <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border border-[#72c306]/30 backdrop-blur-xl">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()} className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                        {num} {num === 1 ? 'Image' : 'Images'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                (subscriptionInfo !== null &&
                 !subscriptionLoading &&
                 subscriptionInfo.requestsLimit !== -1 &&
                 subscriptionInfo.requestsRemaining < (2 + imageCount + (includeBusinessInfo ? 1 : 0))
                )
              }
              className={`bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25 ${
                subscriptionInfo !== null && !subscriptionLoading && subscriptionInfo.requestsLimit !== -1 && subscriptionInfo.requestsRemaining < (3 + imageCount + (includeBusinessInfo ? 1 : 0))
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : subscriptionInfo !== null && !subscriptionLoading && subscriptionInfo.requestsLimit !== -1 && subscriptionInfo.requestsRemaining < (2 + imageCount + (includeBusinessInfo ? 1 : 0)) ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Not Enough Requests
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Generate Images ({2 + imageCount + (includeBusinessInfo ? 1 : 0)} requests)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Example Prompts */}
      <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Lightbulb className="h-5 w-5" />
            <span>Example Prompts</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Click on any example to use as starting point
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {examplePrompts.map((example, index) => (
              <div 
                key={index}
                onClick={() => handleExampleClick(example)}
                className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:border-[#72c306]/50 hover:bg-gray-800/70 transition-all duration-200"
              >
                <p className="text-sm text-gray-300 hover:text-white transition-colors">
                  {example}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Loading Modal */}
      <UniversalLoadingModal
        isOpen={isGenerating}
        progress={generationProgress}
        serviceType="image"
        includeBusinessInfo={includeBusinessInfo}
        imageCount={imageCount}
      />
    </div>
  );
};

export default CustomTab;