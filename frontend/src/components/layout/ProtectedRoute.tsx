'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if this is an OAuth callback
    const isOAuthCallback = searchParams.get('auth') === 'success';
    
    if (!isLoading) {
      // If it's an OAuth callback, give more time for the auth process
      if (isOAuthCallback && !isAuthenticated) {
        // Wait a bit longer for OAuth processing
        const timeout = setTimeout(() => {
          if (!isAuthenticated) {
            router.push(redirectTo);
          }
        }, 3000); // 3 second delay for OAuth
        
        return () => clearTimeout(timeout);
      }
      
      if (!isAuthenticated && !isOAuthCallback) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user?.role !== requiredRole && !(requiredRole === 'USER' && user?.role === 'ADMIN')) {
        router.push('/dashboard'); // Redirect to dashboard if role not authorized
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole && !(requiredRole === 'USER' && user?.role === 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-gray-600">Redirecting...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4 text-blue-600" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;