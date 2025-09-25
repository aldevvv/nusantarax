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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.nusantarax.web.id/api',
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

  async getSession(): Promise<{
    success: boolean;
    message?: string;
    data?: {
      expiresAt: number;
      remainingSeconds: number;
      isExpired: boolean;
    };
  }> {
    const response = await api.get('/auth/session');
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/refresh');
    return response.data;
  },

  // OAuth endpoints
  getGitHubAuthUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.nusantarax.web.id/api';
    return `${baseUrl}/auth/github`;
  },

  getGoogleAuthUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.nusantarax.web.id/api';
    return `${baseUrl}/auth/google`;
  },
};

// Profile API management
export const profileAPI = {
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async getSecurityInfo() {
    const response = await api.get('/profile/security-info');
    return response.data;
  },

  async updateProfile(data: {
    fullName?: string;
  }) {
    const response = await api.put('/profile', data);
    return response.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await api.post('/profile/password/change', data);
    return response.data;
  },

  async setPassword(data: {
    password: string;
    confirmPassword: string;
  }) {
    const response = await api.post('/profile/password/set', data);
    return response.data;
  },

  async disconnectOAuth(provider: 'github' | 'google') {
    const response = await api.delete(`/profile/oauth/${provider.toLowerCase()}`);
    return response.data;
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

// Wallet API management
export const walletAPI = {
  async getHealth() {
    const response = await api.get('/wallet/health');
    return response.data;
  },

  async getWallet() {
    const response = await api.get('/wallet');
    return response.data;
  },

  async getWalletStats() {
    const response = await api.get('/wallet/stats');
    return response.data;
  },

  async getWalletTransactions(limit: number = 50, offset: number = 0) {
    const response = await api.get(`/wallet/transactions?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async addFunds(amount: number, description?: string) {
    const response = await api.post('/wallet/add-funds', { amount, description });
    return response.data;
  },
};

// Topup API management
export const topupAPI = {
  // Manual topup
  async createManualRequest(amount: number, paymentMethod: string) {
    const response = await api.post('/topup/manual/request', { amount, paymentMethod });
    return response.data;
  },
  
  async uploadProof(topupRequestId: string, file: File) {
    const formData = new FormData();
    formData.append('proof', file);
    formData.append('topupRequestId', topupRequestId);
    
    const response = await api.post('/topup/manual/upload-proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Automatic topup
  async validatePromo(code: string, amount: number) {
    const response = await api.post('/topup/validate-promo', { code, amount });
    return response.data;
  },

  async calculateAutomatic(amount: number, promoCode?: string) {
    const response = await api.post('/topup/automatic/calculate', { amount, promoCode });
    return response.data;
  },

  async processAutomatic(amount: number, promoCode?: string) {
    const response = await api.post('/topup/automatic/process', { amount, promoCode });
    return response.data;
  },

  // Get available promo codes for topup
  async getAvailablePromoCodes() {
    const response = await api.get('/promo?activeOnly=true');
    return response.data;
  },

  // User requests
  async getUserRequests(limit: number = 20, offset: number = 0) {
    const response = await api.get(`/topup/requests?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async getRequest(id: string) {
    const response = await api.get(`/topup/requests/${id}`);
    return response.data;
  },

  // Admin endpoints
  async getAllRequests(page: number = 1, limit: number = 20, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);
    
    const response = await api.get(`/topup/admin/requests?${params}`);
    return response.data;
  },

  async approveRequest(id: string, notes?: string) {
    const response = await api.post(`/topup/admin/requests/${id}/approve`, { notes });
    return response.data;
  },

  async rejectRequest(id: string, reason: string) {
    const response = await api.post(`/topup/admin/requests/${id}/reject`, { reason });
    return response.data;
  },
};

// Promo Code API management
export const promoAPI = {
  // Admin endpoints
  async getAllPromoCodes(page: number = 1, limit: number = 20, activeOnly: boolean = false) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      activeOnly: activeOnly.toString(),
    });
    const response = await api.get(`/promo?${params}`);
    return response.data;
  },

  async getPromoCodeById(id: string) {
    const response = await api.get(`/promo/${id}`);
    return response.data;
  },

  async getPromoCodeStats(id: string) {
    const response = await api.get(`/promo/${id}/stats`);
    return response.data;
  },

  async createPromoCode(data: {
    code: string;
    name: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxUsage: number;
    maxUsagePerUser: number;
    maxTotalUsers: number;
    applicableFor: 'TOPUP' | 'PLAN' | 'BOTH';
    isActive: boolean;
    validFrom: string;
    validUntil: string;
    minAmount: number;
    maxDiscount?: number;
  }) {
    const response = await api.post('/promo', data);
    return response.data;
  },

  async updatePromoCode(id: string, data: {
    name?: string;
    description?: string;
    discountValue?: number;
    maxUsage?: number;
    maxUsagePerUser?: number;
    maxTotalUsers?: number;
    applicableFor?: 'TOPUP' | 'PLAN' | 'BOTH';
    isActive?: boolean;
    validFrom?: string;
    validUntil?: string;
    minAmount?: number;
    maxDiscount?: number;
  }) {
    const response = await api.put(`/promo/${id}`, data);
    return response.data;
  },

  async deletePromoCode(id: string) {
    const response = await api.delete(`/promo/${id}`);
    return response.data;
  },

  async validatePromoCode(code: string, amount: number) {
    const response = await api.post('/promo/validate', { code, amount });
    return response.data;
  },
};

// Billing API management
export const billingAPI = {
  async getBillingOverview() {
    const response = await api.get('/billing/overview');
    return response.data;
  },

  async getBillingHistory(limit: number = 50, offset: number = 0) {
    const response = await api.get(`/billing/history?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async getUsageStats(timeframe: 'month' | 'week' | 'today' = 'month') {
    const response = await api.get(`/billing/usage?timeframe=${timeframe}`);
    return response.data;
  },

  async getCurrentSubscription() {
    const response = await api.get('/billing/subscription');
    return response.data;
  },

  async getRecentErrors(limit: number = 10) {
    const response = await api.get(`/billing/errors?limit=${limit}`);
    return response.data;
  },

  // New Plan Management Endpoints
  async getAllPlans() {
    const response = await api.get('/billing/plans');
    return response.data;
  },

  async getPlanHierarchy() {
    const response = await api.get('/billing/plan-hierarchy');
    return response.data;
  },

  async getUpgradePreview(planId: string, billingCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY') {
    const response = await api.get(`/billing/upgrade-preview?planId=${planId}&billingCycle=${billingCycle}`);
    return response.data;
  },

  async validateUpgrade(planId: string, billingCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY') {
    const response = await api.post('/billing/validate-upgrade', { planId, billingCycle });
    return response.data;
  },

  async upgradePlan(planId: string, billingCycle: 'MONTHLY' | 'YEARLY' = 'MONTHLY') {
    const response = await api.post('/billing/upgrade', { planId, billingCycle });
    return response.data;
  },

  async toggleAutoRenew(enabled: boolean) {
    const response = await api.put('/billing/auto-renew', { enabled });
    return response.data;
  },

  async processAutoRenew() {
    const response = await api.post('/billing/process-auto-renew');
    return response.data;
  },

  async cancelSubscription(immediately: boolean = false) {
    const response = await api.post('/billing/cancel', { immediately });
    return response.data;
  },
};

// Admin Wallet API management
export const adminWalletAPI = {
  async getAllWallets(page: number = 1, limit: number = 20, search?: string) {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    if (search) params.append('search', search);
    
    const response = await api.get(`/wallet/admin/all?${params}`);
    return response.data;
  },

  async getUserWallet(userId: string) {
    const response = await api.get(`/wallet/admin/user/${userId}`);
    return response.data;
  },

  async getUserTransactions(userId: string, limit: number = 50, offset: number = 0) {
    const response = await api.get(`/wallet/admin/user/${userId}/transactions?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async addFunds(userId: string, amount: number, description?: string) {
    const response = await api.post(`/wallet/admin/add-funds/${userId}`, { amount, description });
    return response.data;
  },

  async deductFunds(userId: string, amount: number, description: string) {
    const response = await api.post(`/wallet/admin/deduct-funds/${userId}`, { amount, description });
    return response.data;
  },
};

// Admin Trial API management
export const adminTrialAPI = {
  async getAllConfigurations() {
    const response = await api.get('/trial/configurations');
    return response.data;
  },

  async createConfiguration(data: {
    planId: string;
    trialDays: number;
    maxTrialUsers: number;
    validFrom: string;
    validUntil: string;
    description?: string;
  }) {
    const response = await api.post('/trial/configurations', data);
    return response.data;
  },

  async updateConfiguration(id: string, data: {
    isActive?: boolean;
    trialDays?: number;
    maxTrialUsers?: number;
    validFrom?: string;
    validUntil?: string;
    description?: string;
  }) {
    const response = await api.put(`/trial/configurations/${id}`, data);
    return response.data;
  },

  async deleteConfiguration(id: string) {
    const response = await api.delete(`/trial/configurations/${id}`);
    return response.data;
  },

  async getStatistics(configId?: string) {
    const params = configId ? `?configId=${configId}` : '';
    const response = await api.get(`/trial/statistics${params}`);
    return response.data;
  },

  async getAvailablePlans() {
    const response = await api.get('/trial/plans/available');
    return response.data;
  },

  async getAllPlansWithTrialStatus() {
    const response = await api.get('/trial/plans/all');
    return response.data;
  },

  async getTrialHistory(page: number = 1, limit: number = 20, filters?: {
    planId?: string;
    status?: string;
    converted?: boolean;
  }) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.planId) params.append('planId', filters.planId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.converted !== undefined) params.append('converted', filters.converted.toString());

    const response = await api.get(`/trial/history?${params}`);
    return response.data;
  },
};

// Business Information API management
export const businessInfoAPI = {
  async getBusinessInfo() {
    const response = await api.get('/business-info');
    return response.data;
  },

  async createBusinessInfo(data: {
    businessName: string;
    description?: string;
    category: string;
    subCategory?: string;
    brandColors: string[];
    logoUrl?: string;
    industry?: string;
    businessModel?: string;
    targetAudience?: string;
    businessSize?: string;
    establishedYear?: number;
    mainProducts?: string[];
    keyServices?: string[];
    brandVoice?: string;
    brandPersonality?: string[];
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    website?: string;
    phoneNumber?: string;
    socialMedia?: Record<string, string>;
    businessGoals?: string[];
    marketingFocus?: string[];
    contentTone?: string;
    preferredLanguage?: string;
    isCompleted?: boolean;
  }) {
    const response = await api.post('/business-info', data);
    return response.data;
  },

  async updateBusinessInfo(data: {
    businessName?: string;
    description?: string;
    category?: string;
    subCategory?: string;
    brandColors?: string[];
    logoUrl?: string;
    industry?: string;
    businessModel?: string;
    targetAudience?: string;
    businessSize?: string;
    establishedYear?: number;
    mainProducts?: string[];
    keyServices?: string[];
    brandVoice?: string;
    brandPersonality?: string[];
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    website?: string;
    phoneNumber?: string;
    socialMedia?: Record<string, string>;
    businessGoals?: string[];
    marketingFocus?: string[];
    contentTone?: string;
    preferredLanguage?: string;
    isCompleted?: boolean;
  }) {
    const response = await api.put('/business-info', data);
    return response.data;
  },

  async deleteBusinessInfo() {
    const response = await api.delete('/business-info');
    return response.data;
  },

  async getBusinessCategories() {
    const response = await api.get('/business-info/categories');
    return response.data;
  },

  async getIndustryOptions() {
    const response = await api.get('/business-info/industries');
    return response.data;
  },

  async getBrandVoiceOptions() {
    const response = await api.get('/business-info/brand-voices');
    return response.data;
  },

  async getContentToneOptions() {
    const response = await api.get('/business-info/content-tones');
    return response.data;
  },

  async getBrandPersonalityOptions() {
    const response = await api.get('/business-info/brand-personalities');
    return response.data;
  },

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post('/business-info/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Image Generator API management
export const imageGeneratorAPI = {
  // Template management
  async getTemplates(category?: string) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await api.get(`/image-generator/templates${params}`);
    return response.data;
  },

  async getTemplateCategories() {
    const response = await api.get('/image-generator/templates/categories');
    return response.data;
  },

  // Image generation
  async generateFromTemplate(data: {
    templateId: string;
    inputFields: Record<string, any>;
    includeBusinessInfo?: boolean;
    style?: string;
    backgroundPreference?: string;
    aspectRatio?: string;
    imageCount?: number;
  }) {
    const response = await api.post('/image-generator/generate-template', data);
    return response.data;
  },

  async generateFromCustom(data: {
    prompt: string;
    includeBusinessInfo?: boolean;
    style?: string;
    backgroundPreference?: string;
    aspectRatio?: string;
    imageCount?: number;
  }) {
    const response = await api.post('/image-generator/generate-custom', data);
    return response.data;
  },

  // History management
  async getHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.search) searchParams.append('search', params.search);

    const response = await api.get(`/image-generator/history?${searchParams.toString()}`);
    return response.data;
  },

  async getRequest(requestId: string) {
    const response = await api.get(`/image-generator/request/${requestId}`);
    return response.data;
  },

  async deleteResult(resultId: string) {
    const response = await api.delete(`/image-generator/result/${resultId}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/image-generator/stats');
    return response.data;
  },
};

// Caption Generator API management
export const captionGeneratorAPI = {
  // Caption generation
  async generateCaptions(data: {
    image: File;
    captionIdea?: string;
    platform: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK';
    targetAudience?: string;
    tone: 'PROFESSIONAL' | 'CASUAL' | 'FUNNY' | 'INSPIRING' | 'SALES' | 'EDUCATIONAL' | 'STORYTELLING';
    captionLength: 'SHORT' | 'MEDIUM' | 'LONG';
    language?: 'EN' | 'ID';
    useEmojis?: boolean;
    useHashtags?: boolean;
    includeBusinessInfo?: boolean;
  }) {
    const formData = new FormData();
    formData.append('image', data.image);
    
    // Add string fields
    if (data.captionIdea) formData.append('captionIdea', data.captionIdea);
    if (data.targetAudience) formData.append('targetAudience', data.targetAudience);
    formData.append('platform', data.platform);
    formData.append('tone', data.tone);
    formData.append('captionLength', data.captionLength);
    
    // 🔧 CRITICAL FIX: Add missing language parameter
    formData.append('language', data.language || 'EN');
    
    // Add boolean fields properly
    formData.append('useEmojis', data.useEmojis?.toString() || 'true');
    formData.append('useHashtags', data.useHashtags?.toString() || 'true');
    formData.append('includeBusinessInfo', data.includeBusinessInfo?.toString() || 'false');
    
    const response = await api.post('/caption-generator/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // History management
  async getHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    platform?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.platform) searchParams.append('platform', params.platform);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.search) searchParams.append('search', params.search);

    const response = await api.get(`/caption-generator/history?${searchParams.toString()}`);
    return response.data;
  },

  async getRequest(requestId: string) {
    const response = await api.get(`/caption-generator/request/${requestId}`);
    return response.data;
  },

  async deleteResult(resultId: string) {
    const response = await api.delete(`/caption-generator/result/${resultId}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/caption-generator/stats');
    return response.data;
  },
};

// AI Assistant API management
export const aiAssistantAPI = {
  // Send message to AI Assistant
  async sendMessage(data: { content: string; image?: File }) {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.post('/ai-assistant/send-message', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get or create user session
  async getSession() {
    const response = await api.get('/ai-assistant/session');
    return response.data;
  },

  // Get chat messages with pagination
  async getMessages(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/ai-assistant/messages?${searchParams.toString()}`);
    return response.data;
  },

  // Update global context configuration
  async updateContext(data: { globalContext: string }) {
    const response = await api.put('/ai-assistant/context', data);
    return response.data;
  },

  // Get current context
  async getContext() {
    const response = await api.get('/ai-assistant/context');
    return response.data;
  },

  // Get usage statistics
  async getStats() {
    const response = await api.get('/ai-assistant/stats');
    return response.data;
  },

  // Clear chat session
  async clearSession() {
    const response = await api.delete('/ai-assistant/clear');
    return response.data;
  },

  // Delete specific message
  async deleteMessage(messageId: string) {
    const response = await api.delete(`/ai-assistant/message/${messageId}`);
    return response.data;
  },
};


// ChatBot API management (Public endpoints - no authentication required)
export const chatBotAPI = {
  async sendMessage(data: {
    message: string;
    sessionId?: string;
  }) {
    const response = await api.post('/chatbot/message', data);
    return response.data;
  },

  async captureLeads(data: {
    fullName: string;
    email: string;
    phone?: string;
    company?: string;
    sessionId?: string;
  }) {
    const response = await api.post('/chatbot/lead-capture', data);
    return response.data;
  },

  async getSuggestedQuestions() {
    const response = await api.get('/chatbot/suggested-questions');
    return response.data;
  },

  async getSessionStats() {
    const response = await api.get('/chatbot/session/stats');
    return response.data;
  },

  async healthCheck() {
    const response = await api.get('/chatbot/health');
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