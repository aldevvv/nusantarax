'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const OAuthSuccessHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const hasHandledRef = useRef(false);
  
  useEffect(() => {
    const handleOAuthSuccess = async () => {
      // Prevent duplicate execution
      if (hasHandledRef.current) return;
      
      const authSuccess = searchParams.get('auth');
      const error = searchParams.get('error');
      
      if (authSuccess === 'success') {
        hasHandledRef.current = true;
        
        try {
          // Clean up URL parameters immediately to prevent re-triggering
          router.replace('/dashboard', { scroll: false });
          
          // Add a small delay to ensure cookies are set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Refresh user data after OAuth success
          await refreshUser();
          toast.success('Successfully signed in!');
          
        } catch (error) {
          console.error('OAuth success handler error:', error);
          toast.error('Authentication successful, but failed to load user data. Please refresh.');
        }
      } else if (error) {
        hasHandledRef.current = true;
        toast.error(decodeURIComponent(error));
        router.replace('/login');
      }
    };

    // Only run if we have auth params and haven't handled them yet
    if ((searchParams.get('auth') || searchParams.get('error')) && !hasHandledRef.current) {
      handleOAuthSuccess();
    }
  }, [searchParams, refreshUser, router]);

  return null; // This component doesn't render anything
};

export default OAuthSuccessHandler;