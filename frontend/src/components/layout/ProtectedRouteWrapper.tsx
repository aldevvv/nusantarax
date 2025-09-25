'use client';

import React, { Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
  redirectTo?: string;
}

const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = (props) => {
  return (
    <Suspense 
      fallback={
        <NusantaraLoadingScreen
          message="Loading application"
          showProgress={false}
        />
      }
    >
      <ProtectedRoute {...props} />
    </Suspense>
  );
};

export default ProtectedRouteWrapper;