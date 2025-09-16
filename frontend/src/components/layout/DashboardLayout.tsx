'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import Header from './Header';
import Sidebar from './Sidebar';
import OAuthSuccessHandler from '@/components/auth/OAuthSuccessHandler';

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
    <ProtectedRoute requiredRole={requiredRole}>
      <OAuthSuccessHandler />
      <div className="flex h-screen bg-black">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <Header onToggleSidebar={toggleSidebar} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-black">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;