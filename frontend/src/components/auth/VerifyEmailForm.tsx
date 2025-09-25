'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authAPI, handleApiError } from '@/lib/api';
import AdvancedNavbar from '@/components/layout/AdvancedNavbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

const VerifyEmailForm = () => {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendEmail, setResendEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }
  }, [token]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setVerificationStatus('loading');
      const response = await authAPI.verifyEmail(verificationToken);
      setVerificationStatus('success');
      setMessage(response.message || 'Email verified successfully!');
      
      // Show success toast and redirect
      toast.success('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      setVerificationStatus('error');
      setMessage(handleApiError(error));
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail.trim()) {
      setShowEmailInput(true);
      return;
    }

    try {
      setIsResending(true);
      // Call backend API directly with email parameter
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${baseUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: resendEmail }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message || 'Verification email sent successfully!');
        setResendCooldown(60);
        setShowEmailInput(false);
      } else {
        setMessage(data.message || 'Failed to send verification email');
      }
    } catch (error: any) {
      setMessage('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-white" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-white" />;
      default:
        return <Mail className="h-6 w-6 text-white" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'from-[#72c306] to-[#8fd428]';
      case 'success':
        return 'from-[#72c306] to-[#8fd428]';
      case 'error':
        return 'from-red-600 to-red-700';
      default:
        return 'from-[#72c306] to-[#8fd428]';
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Verifying Your Email';
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Email Verification';
    }
  };

  // Show full screen loading when verifying
  if (verificationStatus === 'loading') {
    return (
      <NusantaraLoadingScreen
        message="Verifying your email address"
        showProgress={false}
      />
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
            <div className={`mx-auto h-12 w-12 rounded-lg bg-gradient-to-r ${getStatusColor()} flex items-center justify-center mb-4`}>
              {getStatusIcon()}
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">{getStatusTitle()}</h2>
            
            {verificationStatus === 'loading' && (
              <p className="mt-2 text-sm text-gray-400">
                Please wait while we verify your email address...
              </p>
            )}
            
            {verificationStatus === 'success' && (
              <p className="mt-2 text-sm text-gray-400">
                Your email has been successfully verified. You'll be redirected to the login page shortly.
              </p>
            )}
            
            {verificationStatus === 'error' && (
              <p className="mt-2 text-sm text-gray-400">
                We couldn't verify your email address. This might be because the link has expired or is invalid.
              </p>
            )}
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 px-4 py-3 rounded-lg ${
                verificationStatus === 'success'
                  ? 'bg-[#72c306]/10 border border-[#72c306]/30 text-[#72c306]'
                  : verificationStatus === 'error'
                  ? 'bg-red-600/10 border border-red-600/30 text-red-400'
                  : 'bg-blue-600/10 border border-blue-600/30 text-blue-400'
              }`}
            >
              {message}
            </motion.div>
          )}

          <div className="mt-8 space-y-4">
            {verificationStatus === 'success' && (
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
                size="lg"
              >
                Continue to Login
              </Button>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-4">
                {showEmailInput && (
                  <div>
                    <label htmlFor="resend-email" className="block text-sm font-medium text-white mb-2">
                      Enter your email to resend verification
                    </label>
                    <div className="relative">
                      <input
                        id="resend-email"
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]"
                        placeholder="Enter your email address"
                      />
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || resendCooldown > 0}
                  className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none"
                  size="lg"
                >
                  {isResending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Verification Email'
                  }
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/register')}
                  className="w-full bg-black border border-gray-800 text-gray-200 hover:bg-[#0f0f0f] hover:border-[#72c306] hover:text-[#72c306] transition-all"
                  size="lg"
                >
                  Back to Registration
                </Button>
              </div>
            )}

            <div className="text-center pt-4">
              <span className="text-sm text-gray-400">
                Need help?{' '}
                <Link
                  href="/login"
                  className="font-medium text-[#72c306] hover:text-[#8fd428] transition-colors"
                >
                  Back to Login
                </Link>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmailForm;