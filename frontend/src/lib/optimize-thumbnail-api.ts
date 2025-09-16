import api from './api';

export interface OptimizationSettings {
  smartCrop?: string;
  backgroundRemoval?: string;
  backgroundReplacement?: string;
  lightingAdjustment?: string;
  colorCorrection?: string;
  textPlacement?: string;
  textContent?: string;
  aspectRatio?: string;
  qualityLevel?: string;
}

export interface OptimizeThumbnailRequest {
  fileName: string;
  mimeType: string;
  imageData: string;
  templateId: string;
  exportFormats: string[];
  optimizations: OptimizationSettings;
  customPrompt?: string;
}

export interface OptimizeResult {
  id: string;
  templateUsed: string;
  format: string;
  imageUrl: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  optimizationsApplied: any;
  qualityScore?: number;
  improvementNotes: string[];
  createdAt: string;
}

export interface OptimizeResponse {
  success: boolean;
  requestId: string;
  results: OptimizeResult[];
  processingTime: number;
  originalSize: number;
  totalOptimizedSize: number;
  compressionRatio: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview?: string;
  optimizations: Partial<OptimizationSettings>;
  supportedFormats: string[];
}

export interface OptimizeRequest {
  id: string;
  userId: string;
  originalFileName: string;
  originalFileSize: number;
  originalMimeType: string;
  templateId: string;
  templateName: string;
  optimizations: any;
  exportFormats: string[];
  modelUsed: string;
  finalPrompt?: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  results: OptimizeResult[];
  processingTime?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOptimizeRequests {
  requests: OptimizeRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OptimizeUsageStats {
  total: number;
  success: number;
  error: number;
  processing: number;
  todayUsage: number;
  avgProcessingTime: number;
  successRate: number;
}

export const optimizeThumbnailAPI = {
  async optimizeThumbnail(data: OptimizeThumbnailRequest): Promise<{ success: boolean; data?: OptimizeResponse; message?: string }> {
    try {
      const response = await api.post('/optimize-thumbnail/optimize', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Optimize thumbnail failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to optimize thumbnail',
      };
    }
  },

  async getAvailableTemplates(): Promise<{ success: boolean; data?: Template[]; message?: string }> {
    try {
      const response = await api.get('/optimize-thumbnail/templates');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch templates',
      };
    }
  },

  async getUserRequests(page: number = 1, limit: number = 10): Promise<{ success: boolean; data?: PaginatedOptimizeRequests; message?: string }> {
    try {
      const response = await api.get('/optimize-thumbnail/requests', {
        params: { page: page.toString(), limit: limit.toString() },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to fetch user requests:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch requests',
      };
    }
  },

  async getUsageStatistics(): Promise<{ success: boolean; data?: OptimizeUsageStats; message?: string }> {
    try {
      const response = await api.get('/optimize-thumbnail/statistics');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to fetch usage statistics:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch statistics',
      };
    }
  },

  async getGlobalStatistics(): Promise<{ success: boolean; data?: OptimizeUsageStats; message?: string }> {
    try {
      const response = await api.get('/optimize-thumbnail/statistics/global');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Failed to fetch global statistics:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch global statistics',
      };
    }
  },

  async deleteRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await api.delete(`/optimize-thumbnail/requests/${requestId}`);
      return { success: true, message: 'Request deleted successfully' };
    } catch (error: any) {
      console.error('Failed to delete request:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete request',
      };
    }
  },

  // Helper function to convert file to base64
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },

  // Helper function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper function to calculate compression percentage
  calculateCompressionPercentage(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  },
};