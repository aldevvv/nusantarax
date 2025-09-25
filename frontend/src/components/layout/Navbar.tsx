'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, Shield, Sparkles, ChevronDown } from 'lucide-react';
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

const Navbar = () => {
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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-black/95 backdrop-blur-xl border-b border-[#72c306]/20 shadow-lg shadow-[#72c306]/5'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 20px rgba(114, 195, 6, 0.5)"
              }}
              animate={{
                boxShadow: [
                  "0 0 10px rgba(114, 195, 6, 0.2)",
                  "0 0 20px rgba(114, 195, 6, 0.4)",
                  "0 0 10px rgba(114, 195, 6, 0.2)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-4 w-4 text-black" />
            </motion.div>
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              NusantaraX
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/services', label: 'Services' },
              ...(isAuthenticated ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
              ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : [])
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Link
                  href={item.href}
                  className="relative text-sm font-medium text-gray-300 hover:text-[#72c306] transition-all duration-300 group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <motion.div
                    className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#72c306] to-[#8fd428] origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <motion.div
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        className="relative h-10 w-10 rounded-full border border-[#72c306]/20 bg-black/50 backdrop-blur-sm hover:border-[#72c306]/50 transition-all duration-300 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Avatar className="h-8 w-8 mx-auto">
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#72c306] to-[#8fd428] text-black text-sm font-bold">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </Avatar>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20"
                          initial={{ opacity: 0, scale: 1 }}
                          animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-black/95 backdrop-blur-xl border border-[#72c306]/20" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-white">
                            {user?.fullName}
                          </p>
                          <p className="text-xs leading-none text-gray-400">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#72c306]/20" />
                      <DropdownMenuItem
                        onClick={() => router.push('/profile')}
                        className="text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 focus:text-[#72c306] focus:bg-[#72c306]/10"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 focus:text-[#72c306] focus:bg-[#72c306]/10"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem
                          onClick={() => router.push('/admin')}
                          className="text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 focus:text-[#72c306] focus:bg-[#72c306]/10"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-[#72c306]/20" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-gray-300 hover:text-red-400 hover:bg-red-400/10 focus:text-red-400 focus:bg-red-400/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => router.push('/login')}
                        className="text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 border border-transparent hover:border-[#72c306]/20"
                      >
                        Login
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => router.push('/register')}
                        className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-black font-semibold shadow-lg shadow-[#72c306]/25 border-0"
                      >
                        Sign Up
                      </Button>
                    </motion.div>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              className="relative h-10 w-10 rounded-lg border border-[#72c306]/20 bg-black/50 backdrop-blur-sm hover:border-[#72c306]/50 transition-all duration-300 flex items-center justify-center"
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
                    <X className="h-5 w-5 text-[#72c306]" />
                  ) : (
                    <Menu className="h-5 w-5 text-[#72c306]" />
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
              className="md:hidden border-t border-[#72c306]/20 bg-black/95 backdrop-blur-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/about', label: 'About' },
                  { href: '/services', label: 'Services' },
                  ...(isAuthenticated ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
                  ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel' }] : [])
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 rounded-md transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  className="border-t border-[#72c306]/20 pt-4 pb-3 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {!isLoading && (
                    <>
                      {isAuthenticated ? (
                        <div className="space-y-1">
                          <div className="px-3 py-2">
                            <div className="text-base font-medium text-white">
                              {user?.fullName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user?.email}
                            </div>
                          </div>
                          <button
                            onClick={() => handleNavigation('/profile')}
                            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10 rounded-md transition-all duration-300"
                          >
                            Profile
                          </button>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all duration-300"
                          >
                            Log out
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 px-3">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-300 hover:text-[#72c306] hover:bg-[#72c306]/10"
                            onClick={() => handleNavigation('/login')}
                          >
                            Login
                          </Button>
                          <Button
                            className="w-full justify-start bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-black font-semibold"
                            onClick={() => handleNavigation('/register')}
                          >
                            Sign Up
                          </Button>
                        </div>
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

export default Navbar;