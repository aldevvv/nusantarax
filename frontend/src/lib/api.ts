import axios, { AxiosError } from 'axios';
import {
  AuthResponse,
  RegisterData,
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  ApiError
} from '@/types/auth.types';
import { toast } from 'sonner';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Important for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Add any auth headers if needed (though we're using cookies)
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Only redirect on 401 if:
    // 1. Not already on login/register pages
    // 2. Not the initial auth check (/auth/me)
    // 3. Not a login/register attempt
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register') || currentPath.includes('/forgot-password');
    const isAuthCheck = error.config?.url === '/auth/me' || error.config?.url?.includes('/auth/me');
    const isAuthAction = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthPage && !isAuthCheck && !isAuthAction) {
      // Handle unauthorized errors for authenticated actions only
      toast.error('Session expired. Please login again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Authentication endpoints
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/logout');
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/forgot-password', data);
    return response.data;
  },

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/reset-password', data);
    return response.data;
  },

  async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/verify-email', { token });
    return response.data;
  },

  async resendVerification(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/resend-verification');
    return response.data;
  },

  async getMe(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/refresh');
    return response.data;
  },

  // OAuth endpoints
  getGitHubAuthUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    return `${baseUrl}/auth/github`;
  },

  getGoogleAuthUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    return `${baseUrl}/auth/google`;
  },
};

// User management API for admin
export const usersAPI = {
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);

    const response = await api.get(`/users?${searchParams.toString()}`);
    return response.data;
  },

  async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data;
  },

  async getUserById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: {
    fullName: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN';
  }) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: {
    fullName?: string;
    email?: string;
    role?: 'USER' | 'ADMIN';
  }) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Gemini API management for admin
export const geminiAPI = {
  async getApiKeyStatus() {
    const response = await api.get('/gemini/status');
    return response.data;
  },

  async getAvailableModels() {
    const response = await api.get('/gemini/models');
    return response.data;
  },

  async getUsageStats() {
    const response = await api.get('/gemini/usage');
    return response.data;
  },

  async testApiKey(apiKey: string) {
    const response = await api.post('/gemini/test-key', { apiKey });
    return response.data;
  },

  async updateApiKey(apiKey: string) {
    const response = await api.post('/gemini/update-key', { apiKey });
    return response.data;
  },
};

// Helper function to handle API errors
export const handleApiError = (error: AxiosError<ApiError>): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 400) {
    return 'Invalid request. Please check your input.';
  }
  
  if (error.response?.status === 401) {
    return 'Authentication failed. Please login again.';
  }
  
  if (error.response?.status === 403) {
    return 'Access denied. You don\'t have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.response?.status === 429) {
    return 'Too many requests. Please try again later.';
  }
  
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Export the main API instance for other uses
export default api;