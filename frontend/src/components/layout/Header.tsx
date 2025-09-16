'use client';

import React from 'react';
import { Menu, Bell, Search, User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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

  const handleLogout = async () => {
    await logout();
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="dark sticky top-0 z-40 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/90">
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
              className="w-56 border-gray-600 shadow-2xl z-[100] [&]:bg-gray-900 [&]:text-white [&>*]:text-white"
              align="end"
              forceMount
              style={{
                backgroundColor: 'rgb(17, 24, 39)', // gray-900
                color: 'white',
                border: '1px solid rgb(75, 85, 99)' // gray-600
              }}
            >
              <DropdownMenuLabel className="font-normal">
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
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-white hover:bg-gray-700 focus:bg-gray-700">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-700 focus:bg-gray-700">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="text-[#72c306] hover:bg-gray-700 focus:bg-gray-700">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-gray-700 focus:bg-gray-700 hover:text-red-300">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;