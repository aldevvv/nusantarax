'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// Re-export the useAuth hook for easier imports
export const useAuth = useAuthContext;

// Additional custom hooks for specific auth states
export const useRequireAuth = () => {
  const auth = useAuthContext();
  
  if (!auth.isAuthenticated && !auth.isLoading) {
    // This could trigger a redirect to login
    console.warn('Authentication required');
  }
  
  return auth;
};

export const useRequireRole = (requiredRole: 'USER' | 'ADMIN') => {
  const auth = useAuthContext();
  
  const hasRole = auth.user?.role === requiredRole || (requiredRole === 'USER' && auth.user?.role === 'ADMIN');
  
  return {
    ...auth,
    hasRole,
    isAuthorized: auth.isAuthenticated && hasRole,
  };
};