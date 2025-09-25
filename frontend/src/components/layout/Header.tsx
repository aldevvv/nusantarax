'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Search, User, LogOut, Settings, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSessionCountdown } from '@/hooks/useSessionCountdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Session countdown hook
  const { formattedTime, isExpired, timeRemaining, resetSession } = useSessionCountdown({
    onSessionExpired: async () => {
      await logout();
    }
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileSettings = () => {
    router.push('/dashboard/profile-settings');
  };

  const isAdmin = user?.role === 'ADMIN';
  
  // Determine countdown color based on remaining time
  const getCountdownColor = () => {
    if (timeRemaining > 300) return 'text-green-400'; // > 5 minutes: green
    if (timeRemaining > 120) return 'text-yellow-400'; // > 2 minutes: yellow
    return 'text-red-400'; // <= 2 minutes: red
  };

  return (
    <header className="dark sticky top-0 z-40 w-full border-b border-[#72c306]/30 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/90">
      <div className="flex h-20 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden text-white hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative text-white hover:bg-gray-800">
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </Button>

          {/* User Info & Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white text-sm font-medium">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Avatar>
                
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none text-white">
                    {user?.fullName}
                  </p>
                  <p className="text-xs leading-none text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 border-[#72c306]/30 shadow-2xl z-[100] !bg-black"
              align="end"
              forceMount
              style={{
                backgroundColor: '#000000 !important',
                color: 'white',
                border: '1px solid rgba(114, 195, 6, 0.3)' // muted green
              }}
            >
              <DropdownMenuLabel className="font-normal" style={{ backgroundColor: '#000000' }}>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {user?.fullName}
                  </p>
                  <p className="text-xs leading-none text-gray-400">
                    {user?.email}
                  </p>
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-medium mt-1 w-fit max-w-16 ${
                    user?.role === 'ADMIN'
                      ? 'bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 text-[#72c306] border border-[#72c306]/30'
                      : 'bg-gray-800 text-gray-300 border border-gray-600'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </DropdownMenuLabel>
              
              {/* Session Countdown */}
              <div className="px-2 py-2 border-b border-[#72c306]/30" style={{ color: 'white', backgroundColor: '#000000' }}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-white">Session Duration</span>
                  </div>
                  <div className={`font-mono font-medium ${getCountdownColor()}`}>
                    {formattedTime}
                  </div>
                </div>
                {timeRemaining <= 300 && ( // Show warning when <= 5 minutes
                  <div className="mt-1 flex justify-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                      {timeRemaining <= 120
                        ? '> Session Expiring Soon'
                        : '> Session Expiring Soon'
                      }
                    </span>
                  </div>
                )}
              </div>
              
              <DropdownMenuItem
                onClick={handleProfileSettings}
                className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                style={{ color: 'white', backgroundColor: '#000000' }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="text-[#72c306] hover:bg-gray-800 focus:bg-gray-800" style={{ backgroundColor: '#000000' }}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-gray-800 focus:bg-gray-800 hover:text-red-300" style={{ backgroundColor: '#000000' }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;