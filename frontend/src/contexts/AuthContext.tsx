'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, handleApiError } from '@/lib/api';
import { 
  User, 
  AuthContextType, 
  RegisterData, 
  LoginData, 
  ForgotPasswordData, 
  ResetPasswordData, 
  AuthResponse 
} from '@/types/auth.types';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      // Don't check auth status on auth pages to prevent infinite loops
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') ||
                        currentPath.includes('/register') ||
                        currentPath.includes('/forgot-password') ||
                        currentPath.includes('/reset-password') ||
                        currentPath.includes('/verify-email');
      
      // Check if this is an OAuth callback
      const isOAuthCallback = window.location.search.includes('auth=success');
      
      if (isAuthPage && !isOAuthCallback) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        setIsLoading(true);
        const response = await authAPI.getMe();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error: any) {
        // User is not authenticated or session expired
        console.log('User not authenticated');
        setUser(null);
        // Don't show error toast for initial auth check failures
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      
      if (response.success) {
        toast.success(response.message);
        // Don't set user after registration - user needs to verify email first
      }
      
      return response;
    } catch (error: any) {
      const message = handleApiError(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(data);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success(response.message);
        router.push('/dashboard');
      }
      
      return response;
    } catch (error: any) {
      const message = handleApiError(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authAPI.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails on the server, clear local state
      setUser(null);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (data: ForgotPasswordData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.forgotPassword(data);
      
      if (response.success) {
        toast.success(response.message);
      }
      
      return response;
    } catch (error: any) {
      const message = handleApiError(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.resetPassword(data);
      
      if (response.success) {
        toast.success(response.message);
        router.push('/login');
      }
      
      return response;
    } catch (error: any) {
      const message = handleApiError(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyEmail(token);
      
      if (response.success) {
        toast.success(response.message);
        // Refresh user data after email verification
        await refreshUser();
      }
      
      return response;
    } catch (error: any) {
      const message = handleApiError(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authAPI.resendVerification();
      
      if (response.success) {
        toast.success(response.message);
      }
      
      return response;
    } catch (error: any) {
      const message = handleApiError(error);
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error: any) {
      console.error('Failed to refresh user data:', error);
      // If we can't get user data, they might not be authenticated
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};