'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

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
      <NusantaraLoadingScreen
        message="Authenticating"
        showProgress={false}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <NusantaraLoadingScreen
        message="Redirecting to login"
        showProgress={false}
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole && !(requiredRole === 'USER' && user?.role === 'ADMIN')) {
    return (
      <NusantaraLoadingScreen
        message="Access denied - Redirecting"
        showProgress={false}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;