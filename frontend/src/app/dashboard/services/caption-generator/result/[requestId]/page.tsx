'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Copy,
  MessageSquare,
  Clock,
  Cpu,
  Zap,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Share2,
  Facebook,
  Instagram,
  Music,
  Eye,
  ThumbsUp,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Heart,
  BookOpen,
  Target,
  Smile,
  TrendingUp,
  Lightbulb,
  Anchor
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { captionGeneratorAPI, handleApiError } from '@/lib/api';

interface CaptionResult {
  id: string;
  requestId: string;
  imageUrl: string;
  imageFileName: string;
  platform: string;
  captionIdea?: string;
  targetAudience?: string;
  tone: string;
  captionLength: string;
  useEmojis: boolean;
  useHashtags: boolean;
  status: string;
  errorMessage?: string;
  analysisModel: string;
  totalTokens: number;
  totalCaptions: number;
  createdAt: string;
  completedAt: string;
  results: Array<{
    id: string;
    captionText: string;
    hashtags: string;
    platform: string;
    characterCount: number;
    hashtagCount: number;
    order: number;
    engagementScore: number;
    readabilityScore: number;
    ctaStrength: number;
    brandVoiceScore: number;
    trendingPotential: number;
    emotionalImpact: number;
    hookEffectiveness: number;
    platformOptimization: number;
    keywordRelevance: number;
    viralityPotential: string;
    analysisDetails: any;
  }>;
}

const CaptionResultPage = () => {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;
  
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      loadCaptionResult();
    }
  }, [requestId]);

  const loadCaptionResult = async () => {
    try {
      setLoading(true);
      const response = await captionGeneratorAPI.getRequest(requestId);
      
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.message || 'Failed to load caption result');
      }
    } catch (err: any) {
      console.error('Error loading caption result:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
      case 'analyzing_image':
      case 'generating_captions':
      case 'analyzing_captions':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'processing':
      case 'analyzing_image':
      case 'generating_captions':
      case 'analyzing_captions':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Caption copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy caption');
    }
  };

  const handleDeleteCaption = async (resultId: string) => {
    try {
      const response = await captionGeneratorAPI.deleteResult(resultId);
      if (response.success) {
        toast.success('Caption deleted successfully');
        loadCaptionResult(); // Refresh data
      } else {
        toast.error('Failed to delete caption');
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
  };

  const MetricCard = ({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) => (
    <Card className="bg-gray-900/50 border border-gray-600">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="text-white text-sm font-medium">{title}</span>
          </div>
          <Badge className="bg-[#72c306]/20 text-[#72c306] font-bold">
            {score}/10
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  // Platform Preview Components akan dibuat terpisah
  const PlatformPreviewCard = ({ caption, platform, userImage }: any) => {
    const platformName = platform.toLowerCase();
    
    if (platformName === 'facebook') {
      return (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md h-[500px] flex flex-col">
          <div className="flex items-center space-x-2 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-300 text-gray-700">YB</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">Your Business</p>
              <p className="text-xs text-gray-500">2 min</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-200 rounded-lg mb-3 h-[250px]">
              <img src={userImage} className="w-full h-full object-cover rounded-lg" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-gray-800 text-sm mb-2 line-clamp-4">{caption.captionText}</p>
                {caption.hashtags && (
                  <p className="text-[#1877f2] text-sm line-clamp-2">{caption.hashtags}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t mt-auto">
                <div className="flex space-x-6">
                  <button className="flex items-center space-x-1 text-gray-500 text-sm">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (platformName === 'instagram') {
      return (
        <div className="bg-white rounded-lg shadow-lg max-w-sm h-[500px] flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-300 text-gray-700">YB</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">your_business</span>
            </div>
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="h-[250px]">
            <img src={userImage} className="w-full h-full object-cover" />
          </div>
          
          <div className="px-3 py-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Heart className="h-6 w-6" />
                <MessageCircle className="h-6 w-6" />
                <Send className="h-6 w-6" />
              </div>
              <Bookmark className="h-6 w-6" />
            </div>
            
            <p className="text-sm font-medium mt-2">127 likes</p>
            
            <div className="mt-1 flex-1">
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <span className="font-medium text-sm">your_business </span>
                  <span className="text-sm line-clamp-3">{caption.captionText}</span>
                </div>
                
                {caption.hashtags && (
                  <p className="text-[#00376b] text-sm mt-1 line-clamp-2">{caption.hashtags}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (platformName === 'tiktok') {
      return (
        <div className="bg-black rounded-2xl shadow-2xl max-w-sm h-[500px] relative overflow-hidden">
          {/* Main Video Content with Overlay */}
          <div className="relative h-full">
            {/* Background Image */}
            <img src={userImage} className="w-full h-full object-cover" />
            
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            
            {/* Right Side Action Buttons (TikTok Style) */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-4">
              {/* Profile Avatar */}
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-white">
                  <AvatarFallback className="bg-gray-600 text-white text-sm font-bold">YB</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 bg-[#fe2c55] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
              </div>
              
              {/* Heart/Like Button */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-[#fe2c55] fill-[#fe2c55]" />
                </div>
                <span className="text-white text-xs font-semibold">1.2K</span>
              </div>
              
              {/* Comment Button */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white fill-white" />
                </div>
                <span className="text-white text-xs font-semibold">89</span>
              </div>
              
              {/* Share Button */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Share2 className="h-7 w-7 text-white fill-white" />
                </div>
                <span className="text-white text-xs font-semibold">Share</span>
              </div>
              
              {/* Bookmark Button */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Bookmark className="h-7 w-7 text-white fill-white" />
                </div>
              </div>
              
              {/* Static Music Icon */}
              <div className="flex flex-col items-center mt-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] rounded-full flex items-center justify-center">
                  <Music className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            {/* Bottom Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pr-20">
              {/* Username and Follow Button */}
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-white font-bold text-base">@yourbusiness</span>
                <button className="bg-transparent border border-white text-white px-4 py-1 rounded-md text-sm font-semibold hover:bg-white hover:text-black transition-colors">
                  Follow
                </button>
              </div>
              
              {/* Caption Text */}
              <div className="mb-2">
                <p className="text-white text-sm leading-relaxed line-clamp-3 font-medium">
                  {caption.captionText}
                </p>
              </div>
              
              {/* Hashtags */}
              {caption.hashtags && caption.hashtags.trim() && (
                <div className="mb-3">
                  <p className="text-white text-sm font-semibold opacity-90 line-clamp-2">
                    {caption.hashtags}
                  </p>
                </div>
              )}
              
              {/* Music/Sound Bar */}
              <div className="flex items-center space-x-2 mt-3">
                <Music className="h-4 w-4 text-white" />
                <div className="flex-1 bg-white/20 rounded-full h-1 overflow-hidden">
                  <div className="bg-white h-full w-1/3 rounded-full"></div>
                </div>
                <span className="text-white text-xs opacity-80">Original sound - yourbusiness</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#72c306]" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-500 font-medium">Error</span>
              </div>
              <p className="text-red-400 mt-2">{error || 'Caption result not found'}</p>
              <Button 
                onClick={() => router.push('/dashboard/services/caption-generator')}
                className="mt-4 bg-[#72c306] hover:bg-[#72c306]/90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Generator
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header - Mobile Responsive */}
          <div className="space-y-4">
            {/* Mobile: Stacked Layout */}
            <div className="flex flex-col space-y-4 md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                      Caption Result
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <Badge className={`${getStatusColor(result.status)} border text-xs`}>
                    {result.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <p className="text-gray-400 text-sm">Request ID: {result.requestId}</p>
                <Button
                  onClick={() => router.push('/dashboard/services/caption-generator')}
                  className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generator
                </Button>
              </div>
            </div>

            {/* Desktop: Original Layout */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                    Caption Generation Result
                  </h1>
                  <p className="text-gray-400">Request ID: {result.requestId}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <Badge className={`${getStatusColor(result.status)} border`}>
                    {result.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/services/caption-generator')}
                  className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generator
                </Button>
              </div>
            </div>
          </div>

          {/* Generation Summary - Mobile Responsive */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Platform</p>
                    <p className="text-white font-medium flex items-center space-x-2">
                      <span>{result.platform}</span>
                      {result.platform === 'FACEBOOK' && <Facebook className="h-4 w-4 text-blue-500" />}
                      {result.platform === 'INSTAGRAM' && <Instagram className="h-4 w-4 text-pink-500" />}
                      {result.platform === 'TIKTOK' && <Music className="h-4 w-4 text-red-500" />}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{result.captionLength} Length</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-[#72c306]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">AI Requests</p>
                    <p className="text-white font-medium text-xl">2</p>
                    <p className="text-gray-500 text-xs mt-1">Analysis + Generation</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Tokens</p>
                    <p className="text-white font-medium text-xl">{result.totalTokens?.toLocaleString() || 'N/A'}</p>
                    <p className="text-gray-500 text-xs mt-1">Input + Output</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Captions Generated</p>
                    <p className="text-white font-medium text-xl">{result.totalCaptions}</p>
                    <p className="text-gray-500 text-xs mt-1">Variations Created</p>
                  </div>
                  <Cpu className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Captions with Platform Previews */}
          {result.results && result.results.length > 0 && (
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="text-white">Generated Captions with Platform Previews</CardTitle>
                <CardDescription className="text-gray-400">
                  {result.results.length} caption variations with AI analysis and platform mockups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {result.results.map((caption, index) => (
                    <div key={caption.id} className="flex flex-col space-y-4 h-full">
                      {/* Caption Info */}
                      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-[#72c306]/20 text-[#72c306]">
                            Variation {caption.order}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">Engagement:</span>
                            <Badge className="bg-green-500/20 text-green-400">
                              {caption.engagementScore}/10
                            </Badge>
                          </div>
                        </div>
                        
                        <h4 className="text-white font-medium mb-3">
                          {caption.order === 1 ? 'Emotional' : caption.order === 2 ? 'Sales' : 'Educational'} Approach
                        </h4>
                        
                        {/* Caption Text */}
                        <div className="space-y-3 flex-1">
                          <div className="bg-gray-800/50 rounded-lg p-3 min-h-[100px] flex items-start">
                            <p className="text-gray-300 text-sm leading-relaxed">{caption.captionText}</p>
                          </div>
                          
                          {caption.hashtags && (
                            <div className="bg-blue-500/10 rounded-lg p-3 min-h-[50px] flex items-start">
                              <p className="text-blue-400 text-sm">{caption.hashtags}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* 6-Metric Analysis */}
                        <div className="mt-4 space-y-2">
                          <h5 className="text-white font-medium text-sm">AI Analysis Metrics</h5>
                          <div className="grid grid-cols-1 gap-2">
                            <MetricCard title="Readability" score={caption.readabilityScore} icon={<BookOpen className="h-4 w-4 text-blue-400" />} />
                            <MetricCard title="CTA" score={caption.ctaStrength} icon={<Target className="h-4 w-4 text-green-400" />} />
                            <MetricCard title="Brand Voice" score={caption.brandVoiceScore} icon={<Smile className="h-4 w-4 text-purple-400" />} />
                            <MetricCard title="Trending" score={caption.trendingPotential} icon={<TrendingUp className="h-4 w-4 text-orange-400" />} />
                            <MetricCard title="Emotional" score={caption.emotionalImpact} icon={<Heart className="h-4 w-4 text-red-400" />} />
                            <MetricCard title="Hook" score={caption.hookEffectiveness} icon={<Anchor className="h-4 w-4 text-cyan-400" />} />
                          </div>
                        </div>
                        
                        {/* Character Count & Stats */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center">
                            <p className="text-gray-400">Characters</p>
                            <p className="text-white font-medium">{caption.characterCount}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400">Hashtags</p>
                            <p className="text-white font-medium">{caption.hashtagCount}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Platform Preview - Mobile Responsive */}
                      <div className="flex justify-center flex-shrink-0">
                        <div className="w-full max-w-sm">
                          <div className="min-h-[400px] flex items-start">
                            <PlatformPreviewCard
                              caption={caption}
                              platform={result.platform}
                              userImage={result.imageUrl}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Copy Action Only - Remove Delete Button */}
                      <div className="w-full">
                        <Button
                          onClick={() => {
                            const fullCaption = caption.hashtags
                              ? `${caption.captionText}\n\n${caption.hashtags}`
                              : caption.captionText;
                            copyToClipboard(fullCaption);
                          }}
                          className="w-full bg-[#72c306] hover:bg-[#72c306]/90"
                          size="sm"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Caption
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Metadata */}
          <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
            <CardHeader>
              <CardTitle className="text-white">Generation Details</CardTitle>
              <CardDescription className="text-gray-400">
                Technical details about the caption generation process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Request ID</span>
                    <span className="text-white font-mono text-sm">{result.requestId}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Platform</span>
                    <Badge className="bg-[#72c306]/20 text-[#72c306]">
                      {result.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">AI Model</span>
                    <span className="text-white text-sm">{result.analysisModel}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400">Tone</span>
                    <span className="text-white text-sm">{result.tone}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Created At</span>
                    <span className="text-white text-sm">{formatDateTime(result.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Completed At</span>
                    <span className="text-white text-sm">
                      {result.completedAt ? formatDateTime(result.completedAt) : 'In progress...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Processing Time</span>
                    <span className="text-white text-sm">
                      {result.completedAt && result.createdAt 
                        ? `${Math.round((new Date(result.completedAt).getTime() - new Date(result.createdAt).getTime()) / 1000)} seconds`
                        : 'Processing...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400">Length Preference</span>
                    <span className="text-white text-sm">{result.captionLength}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Details (if any) */}
          {result.errorMessage && (
            <Card className="bg-red-500/10 border border-red-500/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-red-400">Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-300">{result.errorMessage}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => router.push('/dashboard/services/caption-generator')}
              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 w-full sm:w-auto"
            >
              Generate More Captions
            </Button>
            <Button
              onClick={() => router.push('/dashboard/services/caption-generator?tab=history')}
              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 w-full sm:w-auto"
            >
              View History
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CaptionResultPage;