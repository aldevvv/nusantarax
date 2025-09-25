'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ResetPasswordData } from '@/types/auth.types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState<ResetPasswordData>({
    token: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<ResetPasswordData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState<'form' | 'success' | 'error'>('form');

  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setResetStatus('error');
      toast.error('Invalid or missing reset token');
      return;
    }
    setFormData(prev => ({ ...prev, token }));
  }, [token]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (error) {
      toast.error(decodeURIComponent(error));
    }
    if (message) {
      toast.success(decodeURIComponent(message));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordData> = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number/special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await resetPassword(formData);
      setResetStatus('success');
      toast.success('Password reset successful! You can now sign in.');
    } catch (error) {
      setResetStatus('error');
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ResetPasswordData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!token || resetStatus === 'error') {
    return (
      <div className="min-h-screen bg-black">
        <AdvancedNavbar />
        <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="neon-border-card p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Invalid Reset Link
            </h2>
            <p className="text-gray-300 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/forgot-password')}
                className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
              >
                Request New Reset Link
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white hover:border-[#72c306]"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (resetStatus === 'success') {
    return (
      <div className="min-h-screen bg-black">
        <AdvancedNavbar />
        <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="neon-border-card p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-gray-300 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
            >
              Sign In Now
            </Button>
          </div>
        </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AdvancedNavbar />
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="neon-border-card p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter your new password below
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label htmlFor="password" className="text-white">New Password</Label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`
                      appearance-none relative block w-full px-3 py-2 pl-10 pr-10 bg-gray-800 border rounded-lg
                      placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]
                      ${errors.password ? 'border-red-600/50' : 'border-gray-700'}
                    `}
                    placeholder="Enter your new password"
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

              <div>
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                <div className="mt-2 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`
                      appearance-none relative block w-full px-3 py-2 pl-10 pr-10 bg-gray-800 border rounded-lg
                      placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]
                      ${errors.confirmPassword ? 'border-red-600/50' : 'border-gray-700'}
                    `}
                    placeholder="Confirm your new password"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none"
              size="lg"
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-[#72c306] hover:text-[#8fd428] transition-colors"
              >
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;