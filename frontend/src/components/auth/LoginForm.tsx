'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginData } from '@/types/auth.types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import OAuthButtons from './OAuthButtons';
import { toast } from 'sonner';

const LoginForm = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  // Show toast for URL messages
  useEffect(() => {
    if (error) {
      toast.error(decodeURIComponent(error));
      // Clear error from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
    if (message) {
      toast.success(decodeURIComponent(message));
      // Clear message from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
  }, [error, message]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(formData);
      // Navigation is handled in the auth context
    } catch (error) {
      // Error handling is done in the auth context with toast
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Login Form */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="rounded-xl border-2 border-[#72c306] bg-black p-8 shadow-[0_0_20px_rgba(114,195,6,0.15)]">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Welcome Back</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Sign in to your NusantaraX Account
                </p>
              </div>


              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <div className="mt-2 relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`
                          appearance-none relative block w-full px-3 py-2 pl-10 bg-gray-900/70 border rounded-lg
                          placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]
                          ${errors.email ? 'border-red-600/50' : 'border-gray-800'}
                        `}
                        placeholder="Enter your email address"
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="mt-2 relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`
                          appearance-none relative block w-full px-3 py-2 pl-10 pr-10 bg-gray-900/70 border rounded-lg
                          placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]
                          ${errors.password ? 'border-red-600/50' : 'border-gray-800'}
                        `}
                        placeholder="Enter your password"
                      />
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <Link
                      href="/forgot-password"
                      className="font-medium text-[#72c306] hover:text-[#8fd428] transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none"
                  size="lg"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-black text-gray-400 uppercase tracking-wide text-xs">Or continue with</span>
                  </div>
                </div>

                <OAuthButtons />

                <div className="text-center">
                  <span className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      href="/register"
                      className="font-medium text-[#72c306] hover:text-[#8fd428] transition-colors"
                    >
                      Sign up now
                    </Link>
                  </span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Platform Information */}
        <div className="hidden lg:flex lg:items-center lg:justify-center relative">

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="max-w-lg px-8 relative z-10 lg:mt-6 xl:mt-10"
          >
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mb-6 relative"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(114, 195, 6, 0.3)"
                }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(114, 195, 6, 0.2)",
                    "0 0 40px rgba(114, 195, 6, 0.4)",
                    "0 0 20px rgba(114, 195, 6, 0.2)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </motion.svg>
              </motion.div>
              
              <motion.h2
                className="text-4xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Empower Your SMB
              </motion.h2>
              
              <motion.p
                className="text-xl text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Leading SaaS platform for SMEs with AI Agents & Automation
              </motion.p>
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {[
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
                  title: "AI-Powered Marketing",
                  desc: "Boost engagement and conversions with intelligent AI Agents for targeted digital marketing.",
                  delay: 1.2
                },
                {
                  icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>,
                  title: "Smart Automation",
                  desc: "Automate business workflows with cutting-edge technology for maximum efficiency and sustainable growth.",
                  delay: 1.4
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a 1 1 0 01-1-1V4z" />,
                  title: "Analytics & Insights",
                  desc: "Comprehensive dashboards with deep insights to optimize strategy and measure real-time performance.",
                  delay: 1.6
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 group"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: item.delay,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ x: 4 }}
                >
                  <motion.div
                    className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                    whileHover={{
                      scale: 1.1
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0, rotate: 180 }}
                      whileHover={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <svg className="h-5 w-5 text-[#72c306] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.icon}
                    </svg>
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#72c306] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Removed join banner */}
          </motion.div>
      </div>
      
      </div>
    </div>
  );
};

export default LoginForm;
