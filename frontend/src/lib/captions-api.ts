import api from './api';

export interface GenerateCaptionRequest {
  imageData: string;
  platforms: Platform[];
  formats: CaptionFormat[];
  fileName: string;
  fileSize: number;
  mimeType: string;
  brandTone?: string;
  targetAudience?: string;
  count?: number;
}

export enum Platform {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TIKTOK = 'TIKTOK'
}

export enum CaptionFormat {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  SHORT_NO_HASHTAGS = 'SHORT_NO_HASHTAGS',
  MEDIUM_NO_HASHTAGS = 'MEDIUM_NO_HASHTAGS',
  LONG_NO_HASHTAGS = 'LONG_NO_HASHTAGS'
}

export interface ProductAnalysis {
  productType: string;
  productCategory: string;
  visualElements: string[];
  targetAudience: string;
  brandTone: string;
  keyFeatures: string[];
  emotionalTriggers: string[];
  priceIndicator: 'budget' | 'mid-range' | 'premium' | 'luxury';
  marketingAngles: string[];
}

export interface CaptionResult {
  id: string;
  platform: Platform;
  format: CaptionFormat;
  version: number;
  caption: string;
  hashtags: string[];
  callToAction?: string;
  characterCount: number;
  engagementScore: number;
  viralPotential: number;
  conversionScore: number;
  audienceMatch: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  riskFactors: string[];
  createdAt: string;
}

export interface CaptionGenerationResponse {
  success: boolean;
  requestId: string;
  productAnalysis: ProductAnalysis;
  results: CaptionResult[];
  totalVariations: number;
  processingTime: number;
  recommendations: {
    bestOverall: string;
    bestPerPlatform: Record<Platform, string>;
    campaignStrategy: string[];
  };
}

export interface PlatformInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  optimalLength: string;
  hashtagStrategy: string;
}

export interface FormatInfo {
  id: string;
  name: string;
  description: string;
  includeHashtags: boolean;
}

export interface AnalyticsData {
  totalCaptions: number;
  averageScores: {
    overallScore: number;
    engagementScore: number;
    viralPotential: number;
    conversionScore: number;
  };
  platformPerformance: Array<{
    platform: Platform;
    _count: number;
    _avg: { overallScore: number };
  }>;
  insights: {
    bestPlatform: Platform;
    recommendation: string;
  };
}

export interface MarketInsights {
  trendingHashtags: Record<string, string[]>;
  optimalPostingTimes: Record<string, string[]>;
  audienceInsights: {
    peakEngagementDays: string[];
    contentPreferences: string[];
    engagementTriggers: string[];
  };
  competitorAnalysis: {
    avgCaptionLength: Record<string, number>;
    commonHashtags: string[];
    contentGaps: string[];
  };
}

export const captionsAPI = {
  // Analyze media only
  async analyze(data: {
    imageData: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    brandTone?: string;
    targetAudience?: string;
  }) {
    const response = await api.post('/captions/analyze', data);
    return response.data;
  },
  // Generate captions with AI analysis
  async generateCaptions(data: GenerateCaptionRequest) {
    const response = await api.post('/captions/generate', data);
    return response.data;
  },

  // Get available platforms
  async getAvailablePlatforms() {
    const response = await api.get('/captions/platforms');
    return response.data;
  },

  // Get available formats
  async getAvailableFormats() {
    const response = await api.get('/captions/formats');
    return response.data;
  },

  // Get analytics data
  async getAnalytics(params?: {
    platform?: Platform;
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: Date;
    endDate?: Date;
  }) {
    const response = await api.get('/captions/analytics', { params });
    return response.data;
  },

  // Get caption requests history
  async getCaptionRequests(params?: {
    page?: number;
    limit?: number;
    status?: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    platform?: Platform;
    format?: CaptionFormat;
    search?: string;
    sortBy?: 'createdAt' | 'overallScore' | 'engagementScore' | 'viralPotential';
    sortOrder?: 'asc' | 'desc';
  }) {
    const response = await api.get('/captions/requests', { params });
    return response.data;
  },

  // Delete caption request
  async deleteRequest(requestId: string) {
    const response = await api.delete(`/captions/requests/${requestId}`);
    return response.data;
  },

  // Get market insights
  async getMarketInsights() {
    const response = await api.get('/captions/insights');
    return response.data;
  },

  // Generate platform-specific captions from existing analysis
  async generatePlatformCaptions(payload: {
    analysis: ProductAnalysis;
    platform: Platform;
    count?: number;
    format?: CaptionFormat;
  }) {
    const response = await api.post('/captions/generate-platform', payload);
    return response.data;
  }
};

// Helper functions for Smart Captions
export const getPlatformColor = (platform: Platform): string => {
  const colors = {
    [Platform.FACEBOOK]: 'from-blue-500 to-blue-600',
    [Platform.INSTAGRAM]: 'from-pink-500 to-purple-600',
    [Platform.TIKTOK]: 'from-gray-800 to-black'
  };
  return colors[platform];
};

export const getPlatformIcon = (platform: Platform): string => {
  const icons = {
    [Platform.FACEBOOK]: '📘',
    [Platform.INSTAGRAM]: '📸',
    [Platform.TIKTOK]: '🎵'
  };
  return icons[platform];
};

export const formatScoreColor = (score: number): string => {
  if (score >= 90) return 'text-[#72c306]';
  if (score >= 80) return 'text-blue-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
};

export const getScoreGradient = (score: number): string => {
  if (score >= 90) return 'from-[#72c306] to-[#8fd428]';
  if (score >= 80) return 'from-blue-500 to-blue-600';
  if (score >= 70) return 'from-yellow-500 to-yellow-600';
  if (score >= 60) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
};

export const formatCharacterCount = (count: number, platform: Platform, format: CaptionFormat): string => {
  const limits = {
    [Platform.FACEBOOK]: { SHORT: 200, MEDIUM: 280, LONG: 380 },
    [Platform.INSTAGRAM]: { SHORT: 125, MEDIUM: 160, LONG: 200 },
    [Platform.TIKTOK]: { SHORT: 80, MEDIUM: 120, LONG: 150 }
  };
  
  const baseFormat = format.replace('_NO_HASHTAGS', '') as keyof typeof limits.FACEBOOK;
  const limit = limits[platform][baseFormat];
  const percentage = Math.round((count / limit) * 100);
  
  return `${count}/${limit} chars (${percentage}%)`;
};

export const validateCaptionFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return { isValid: false, error: 'Supported formats: JPG, PNG, WebP' };
  }

  return { isValid: true };
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
