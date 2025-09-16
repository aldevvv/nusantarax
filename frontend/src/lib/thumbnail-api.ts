import api from './api';

export interface GenerateThumbnailRequest {
  imageData: string;
  promptId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface ThumbnailResult {
  id: string;
  order: number;
  promptTitle: string;
  promptVariation: string;
  resultText: string;
  imageUrl?: string;
  createdAt: string;
}

export interface PromptOption {
  id: string;
  title: string;
  description: string;
}

export interface UsageStatistics {
  success: number;
  error: number;
  avgProcessingTime: number;
  todayUsage: number;
  successRate: number;
  total: number;
}

export interface ThumbnailRequest {
  id: string;
  originalFileName: string;
  originalFileSize: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  promptText: string;
  processingTime?: number;
  errorMessage?: string;
  createdAt: string;
  results: ThumbnailResult[];
}

export const thumbnailAPI = {
  // Generate thumbnails from uploaded image
  async generateThumbnails(data: GenerateThumbnailRequest) {
    const response = await api.post('/thumbnails/generate', data);
    return response.data;
  },

  // Generate thumbnails from brief (Gemini -> Imagen)
  async generateFromBrief(data: any) {
    const response = await api.post('/thumbnails/generate-from-brief', data);
    return response.data;
  },

  // Get available hardcoded prompts
  async getAvailablePrompts() {
    const response = await api.get('/thumbnails/prompts');
    return response.data;
  },

  // Get usage statistics
  async getUsageStatistics() {
    const response = await api.get('/thumbnails/statistics');
    return response.data;
  },

  // Get user's thumbnail requests history
  async getUserRequests(params?: {
    page?: number;
    limit?: number;
    status?: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    search?: string;
  }) {
    const response = await api.get('/thumbnails/requests', { params });
    return response.data;
  },

  // Delete a specific request
  async deleteRequest(requestId: string) {
    const response = await api.delete(`/thumbnails/requests/${requestId}`);
    return response.data;
  }
};

// Helper function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
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

// Helper function to format processing time
export const formatProcessingTime = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  return `${(milliseconds / 1000).toFixed(1)}s`;
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};
