'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Download,
  Eye,
  Image as ImageIcon,
  Clock,
  Cpu,
  Zap,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Share2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { imageGeneratorAPI, handleApiError } from '@/lib/api';

interface GenerationResult {
  id: string;
  requestId: string;
  type: string;
  originalPrompt: string;
  enhancedPrompt: string;
  status: string;
  errorMessage?: string;
  analysisModel: string;
  generationModel: string;
  analysisInputTokens: number;
  analysisOutputTokens: number;
  analysisTokens: number;
  generationTokens: number;
  totalTokens: number;
  totalImages: number;
  createdAt: string;
  completedAt: string;
  template?: {
    name: string;
    displayName: string;
    category: string;
  };
  results: Array<{
    id: string;
    imageUrl: string;
    imageSize: string;
    fileSize: number;
    fileName: string;
    prompt: string;
    seed: string;
    generationTime: number;
    order: number;
  }>;
}

const GenerationResultPage = () => {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;
  
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId) {
      loadGenerationResult();
    }
  }, [requestId]);

  const loadGenerationResult = async () => {
    try {
      setLoading(true);
      const response = await imageGeneratorAPI.getRequest(requestId);
      
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.message || 'Failed to load generation result');
      }
    } catch (err: any) {
      console.error('Error loading generation result:', err);
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
      case 'analyzing':
      case 'generating':
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
      case 'analyzing':
      case 'generating':
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

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteImage = async (resultId: string) => {
    try {
      const response = await imageGeneratorAPI.deleteResult(resultId);
      if (response.success) {
        toast.success('Image deleted successfully');
        loadGenerationResult(); // Refresh data
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
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
              <p className="text-red-400 mt-2">{error || 'Generation result not found'}</p>
              <Button 
                onClick={() => router.push('/dashboard/services/image-generator')}
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
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header - Mobile Responsive */}
          <div className="space-y-4">
            {/* Mobile: Stacked Layout */}
            <div className="flex flex-col space-y-4 md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                      Generation Result
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <Badge className={`${getStatusColor(result.status)} border text-xs`}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <p className="text-gray-400 text-sm">Request ID: {result.requestId}</p>
                <Button
                  onClick={() => router.push('/dashboard/services/image-generator')}
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
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                    Generation Result
                  </h1>
                  <p className="text-gray-400">Request ID: {result.requestId}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <Badge className={`${getStatusColor(result.status)} border`}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/services/image-generator')}
                  className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generator
                </Button>
              </div>
            </div>
          </div>

          {/* Generation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Model Used</p>
                    <p className="text-white font-medium">{result.analysisModel}</p>
                    <p className="text-gray-500 text-xs mt-1">Analysis & Prompt</p>
                  </div>
                  <Cpu className="h-8 w-8 text-[#72c306]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Requests</p>
                    <p className="text-white font-medium text-xl">{2 + result.totalImages}</p>
                    <p className="text-gray-500 text-xs mt-1">Analysis + Prompt + Images</p>
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
                    <p className="text-white font-medium text-xl">{result.totalTokens.toLocaleString()}</p>
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
                    <p className="text-gray-400 text-sm">Images Generated</p>
                    <p className="text-white font-medium text-xl">{result.totalImages}</p>
                    <p className="text-gray-500 text-xs mt-1">Successful Results</p>
                  </div>
                  <ImageIcon className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Token Breakdown */}
          <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-white text-lg sm:text-xl">Token Usage Breakdown</CardTitle>
              <CardDescription className="text-gray-400 text-sm sm:text-base">
                Detailed breakdown of token consumption during generation
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Analysis Section */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium text-sm sm:text-base mb-3 border-b border-gray-700 pb-2">Analysis Phase</h3>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Input Tokens</span>
                      <span className="text-white font-medium text-sm">{result.analysisInputTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Output Tokens</span>
                      <span className="text-white font-medium text-sm">{result.analysisOutputTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-700 pt-2 space-y-1 sm:space-y-0">
                      <span className="text-white font-medium text-sm">Analysis Total</span>
                      <span className="text-[#72c306] font-bold text-sm sm:text-base">{result.analysisTokens.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Generation Section */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium text-sm sm:text-base mb-3 border-b border-gray-700 pb-2">Generation Phase</h3>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Generation Tokens</span>
                      <span className="text-white font-medium text-sm">{result.generationTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Image Count</span>
                      <span className="text-white font-medium text-sm">{result.totalImages}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-700 pt-2 space-y-1 sm:space-y-0">
                      <span className="text-white font-medium text-sm">Images Total</span>
                      <span className="text-blue-500 font-bold text-sm sm:text-base">{result.generationTokens.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Summary Section */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium text-sm sm:text-base mb-3 border-b border-gray-700 pb-2">Summary</h3>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Combined Usage</span>
                      <span className="text-white font-medium text-sm">{result.totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Generation Time</span>
                      <span className="text-white font-medium text-sm">
                        {result.completedAt && result.createdAt
                          ? `${Math.round((new Date(result.completedAt).getTime() - new Date(result.createdAt).getTime()) / 1000)}s`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t-2 border-[#72c306]/30 pt-3 space-y-1 sm:space-y-0">
                      <span className="text-white font-medium text-sm sm:text-base">Grand Total</span>
                      <span className="text-purple-500 font-bold text-lg sm:text-xl">{result.totalTokens.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Prompt */}
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="text-white">Original Prompt</CardTitle>
                <CardDescription className="text-gray-400">
                  {result.template ? `Template: ${result.template.name}` : 'Custom generation'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {result.type === 'TEMPLATE' ? JSON.stringify(JSON.parse(result.originalPrompt), null, 2) : result.originalPrompt}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Prompt */}
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="text-white">Enhanced Prompt</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-optimized prompt for image generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {result.enhancedPrompt}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Images */}
          {result.results && result.results.length > 0 && (
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="text-white">Generated Images</CardTitle>
                <CardDescription className="text-gray-400">
                  {result.results.length} high-quality images generated successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.results.map((image, index) => (
                    <div key={image.id} className="group relative">
                      <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group-hover:border-[#72c306]/50 transition-colors">
                        <img
                          src={image.imageUrl}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => window.open(image.imageUrl, '_blank')}
                            className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadImage(image.imageUrl, image.fileName)}
                            className="bg-[#72c306]/80 hover:bg-[#72c306] text-white"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteImage(image.id)}
                            className="bg-red-500/80 hover:bg-red-500 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Image Info */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">Size</span>
                          <span className="text-white text-xs">{image.imageSize}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">File Size</span>
                          <span className="text-white text-xs">{formatFileSize(image.fileSize)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">Generation Time</span>
                          <span className="text-white text-xs">{Math.round(image.generationTime)}ms</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Metadata */}
          <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-white text-lg sm:text-xl">Generation Metadata</CardTitle>
              <CardDescription className="text-gray-400 text-sm sm:text-base">
                Technical details about the generation process
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 gap-6">
                {/* First Column - Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium text-sm sm:text-base mb-3 border-b border-gray-700 pb-2">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Request ID</span>
                      <span className="text-white font-mono text-xs sm:text-sm break-all">{result.requestId}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Type</span>
                      <Badge className="bg-[#72c306]/20 text-[#72c306] w-fit">
                        {result.type}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Analysis Model</span>
                      <span className="text-white text-xs sm:text-sm break-words">{result.analysisModel}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Generation Model</span>
                      <span className="text-white text-xs sm:text-sm break-words">{result.generationModel}</span>
                    </div>
                  </div>
                </div>
                
                {/* Second Column - Timing Info */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium text-sm sm:text-base mb-3 border-b border-gray-700 pb-2">Timing Information</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Created At</span>
                      <span className="text-white text-xs sm:text-sm">{formatDateTime(result.createdAt)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Completed At</span>
                      <span className="text-white text-xs sm:text-sm">
                        {result.completedAt ? formatDateTime(result.completedAt) : 'In progress...'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-800 space-y-1 sm:space-y-0">
                      <span className="text-gray-400 text-sm">Total Duration</span>
                      <span className="text-white text-xs sm:text-sm">
                        {result.completedAt && result.createdAt
                          ? `${Math.round((new Date(result.completedAt).getTime() - new Date(result.createdAt).getTime()) / 1000)} seconds`
                          : 'Processing...'}
                      </span>
                    </div>
                    {result.template && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 space-y-1 sm:space-y-0">
                        <span className="text-gray-400 text-sm">Template</span>
                        <span className="text-white text-xs sm:text-sm break-words">{result.template.name}</span>
                      </div>
                    )}
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

          {/* Action Buttons - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => router.push('/dashboard/services/image-generator')}
              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 w-full sm:w-auto"
            >
              Generate More Images
            </Button>
            <Button
              onClick={() => router.push('/dashboard/services/image-generator?tab=history')}
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

export default GenerationResultPage;