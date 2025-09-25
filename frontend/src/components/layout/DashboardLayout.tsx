'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRouteWrapper from './ProtectedRouteWrapper';
import Header from './Header';
import Sidebar from './Sidebar';
import OAuthSuccessHandler from '@/components/auth/OAuthSuccessHandler';
import FloatingAIAssistant from '@/components/ui/FloatingAIAssistant';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  requiredRole 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ProtectedRouteWrapper requiredRole={requiredRole}>
      <Suspense fallback={null}>
        <OAuthSuccessHandler />
      </Suspense>
      <div className="flex h-screen bg-black">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <Header onToggleSidebar={toggleSidebar} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-black flex flex-col">
            <div className="p-6 min-h-full flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </ProtectedRouteWrapper>
  );
};

export default DashboardLayout;
