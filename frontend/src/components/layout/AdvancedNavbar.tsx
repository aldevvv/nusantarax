'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  Sparkles, 
  ChevronDown,
  Bot,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Wallet,
  Zap,
  Users,
  Globe,
  PhoneCall,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';

const AdvancedNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const isAdmin = user?.role === 'ADMIN';


  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
    { href: '/documentation', label: 'Documentation' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-black/30 backdrop-blur-2xl shadow-2xl shadow-[#72c306]/10'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group md:justify-start justify-center flex-1 md:flex-none">
            <motion.img
              src="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/nusantarax/NusantaraXX.png"
              alt="NusantaraX Logo"
              className="h-12 w-12 object-contain"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
            <div className="flex flex-col gap-0 -ml-2">
              <motion.span
                className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent leading-tight"
                whileHover={{ scale: 1.05 }}
              >
                NusantaraX
              </motion.span>
              <span className="text-xs text-gray-400 font-medium tracking-wide leading-tight">
                SMEs Digital Partner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Link
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-[#72c306] transition-all duration-300 group rounded-xl"
                >
                  <span className="relative z-10">{item.label}</span>
                  <motion.div
                    className="absolute inset-0 bg-[#72c306]/10 rounded-xl opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            ))}



            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href="/admin"
                  className="relative px-4 py-2 text-sm font-medium text-orange-400 hover:text-orange-300 transition-all duration-300 group rounded-xl"
                >
                  <span className="relative z-10 flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-orange-400/10 rounded-xl opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Desktop Auth Section */}
          <motion.div
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        className="relative h-12 w-12 rounded-2xl border-2 border-[#72c306]/30 bg-black/70 backdrop-blur-sm hover:border-[#72c306]/60 transition-all duration-300 group overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Avatar className="h-10 w-10 mx-auto">
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white text-sm font-bold">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </Avatar>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 opacity-0"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div
                          className="absolute -inset-1 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-2xl opacity-0"
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-black/95 backdrop-blur-2xl border border-[#72c306]/20 rounded-xl shadow-2xl" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal p-4">
                        <div className="flex flex-col space-y-2">
                          <p className="text-sm font-medium leading-none text-white">
                            {user?.fullName}
                          </p>
                          <p className="text-xs leading-none text-gray-400">
                            {user?.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 text-xs bg-[#72c306]/20 text-[#72c306] rounded-full">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#72c306]/20" />
                      <DropdownMenuItem
                        onClick={() => router.push('/dashboard/profile-settings')}
                        className="text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 focus:text-[#72c306] focus:bg-[#72c306]/10 p-4"
                      >
                        <User className="mr-3 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem
                          onClick={() => router.push('/admin')}
                          className="text-gray-300 hover:text-orange-400 hover:bg-orange-400/10 focus:text-orange-400 focus:bg-orange-400/10 p-4"
                        >
                          <Shield className="mr-3 h-4 w-4" />
                          <span>Admin Panel</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-[#72c306]/20" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-gray-300 hover:text-red-400 hover:bg-red-400/10 focus:text-red-400 focus:bg-red-400/10 p-4"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => router.push('/login')}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white font-semibold shadow-lg shadow-[#72c306]/25 border-0 rounded-xl px-6 py-2.5"
                    >
                      Login
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              className="relative h-12 w-12 flex items-center justify-center transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'menu'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-[#72c306]" />
                  ) : (
                    <Menu className="h-6 w-6 text-[#72c306]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-[#72c306]/20 bg-black/30 backdrop-blur-2xl rounded-b-2xl mt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="px-6 pt-4 pb-6 space-y-2 text-center">
                {/* Navigation Links */}
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 rounded-xl transition-all duration-300 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}


                {/* Auth Section */}
                <motion.div
                  className="border-t border-[#72c306]/20 pt-4 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {!isLoading && (
                    <>
                      {isAuthenticated ? (
                        <div className="space-y-2">
                          <div className="px-4 py-3 bg-[#72c306]/10 rounded-xl">
                            <div className="text-sm font-medium text-white">
                              {user?.fullName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {user?.email}
                            </div>
                          </div>
                          <button
                            onClick={() => handleNavigation('/dashboard/profile-settings')}
                            className="block w-full text-center px-4 py-3 text-sm font-medium text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 rounded-xl transition-all duration-300"
                          >
                            <User className="inline mr-3 h-4 w-4" />
                            Profile Settings
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleNavigation('/admin')}
                              className="block w-full text-center px-4 py-3 text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded-xl transition-all duration-300"
                            >
                              <Shield className="inline mr-3 h-4 w-4" />
                              Admin Panel
                            </button>
                          )}
                          <button
                            onClick={handleLogout}
                            className="block w-full text-center px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all duration-300"
                          >
                            <LogOut className="inline mr-3 h-4 w-4" />
                            Log out
                          </button>
                        </div>
                      ) : (
                        <Button
                          className="w-full justify-center bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white font-semibold rounded-xl py-3"
                          onClick={() => handleNavigation('/login')}
                        >
                          Login
                        </Button>
                      )}
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default AdvancedNavbar;
