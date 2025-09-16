'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  X,
  Home,
  Shield,
  Settings,
  Image,
  Sparkles,
  MessageSquare,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.role === 'ADMIN';

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['USER', 'ADMIN']
    }
  ];

  const adminItems = [
    {
      name: 'Management Users',
      href: '/admin/users',
      icon: Users,
      allowedRoles: ['ADMIN']
    },
    {
      name: 'API Settings',
      href: '/admin/api-settings',
      icon: Settings,
      allowedRoles: ['ADMIN']
    }
  ];

  const serviceItems = [
    {
      name: 'Smart Thumbnail',
      href: '/admin/smart-thumbnail',
      icon: Image,
      allowedRoles: ['ADMIN']
    },
    {
      name: 'Smart Captions',
      href: '/admin/smart-captions',
      icon: MessageSquare,
      allowedRoles: ['ADMIN']
    },
    {
      name: 'Optimize Thumbnail',
      href: '/admin/optimize-thumbnail',
      icon: Sparkles,
      allowedRoles: ['ADMIN']
    }
  ];

  const filteredNavigationItems = navigationItems.filter(item =>
    item.allowedRoles.includes(user?.role || 'USER')
  );

  const filteredAdminItems = adminItems.filter(item =>
    item.allowedRoles.includes(user?.role || 'USER')
  );

  const filteredServiceItems = serviceItems.filter(item =>
    item.allowedRoles.includes(user?.role || 'USER')
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-black border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
            <div className="flex-1 flex justify-center">
              <Link href="/" className="flex items-center">
                <img
                  src="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/images/Nusantarax%20Logo.png"
                  alt="NusantaraX Logo"
                  className="h-35 w-35 object-contain"
                />
              </Link>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden text-white hover:bg-gray-800 absolute right-4"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 sidebar-scrollable">
            {/* Main Navigation */}
            <div className="space-y-3">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Navigation
              </p>
              <div className="space-y-1">
                {filteredNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white shadow-lg shadow-[#72c306]/25"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      )}
                      onClick={onClose}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Services Section */}
            {isAdmin && filteredServiceItems.length > 0 && (
              <>
                <div className="border-t border-gray-800 my-4" />
                <div className="space-y-3">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Services
                  </p>
                  <div className="space-y-1">
                    {filteredServiceItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white shadow-lg shadow-[#72c306]/25"
                              : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                          )}
                          onClick={onClose}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Administration Section */}
            {isAdmin && filteredAdminItems.length > 0 && (
              <>
                <div className="border-t border-gray-800 my-4" />
                <div className="space-y-3">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Administration
                  </p>
                  <div className="space-y-1">
                    {filteredAdminItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white shadow-lg shadow-[#72c306]/25"
                              : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                          )}
                          onClick={onClose}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* Admin Access Info */}
                  <div className="px-3 py-2 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/10 border border-[#72c306]/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-[#72c306]" />
                      <span className="text-sm font-medium text-white">Admin Access</span>
                    </div>
                    <p className="text-xs text-[#72c306] mt-1">
                      You have administrator privileges
                    </p>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Back to Home - Bottom */}
          <div className="p-4 border-t border-gray-800">
            <Link
              href="/"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                "text-gray-300 hover:text-white hover:bg-gray-800/50"
              )}
              onClick={onClose}
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;