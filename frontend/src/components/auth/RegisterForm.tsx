'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RegisterData } from '@/types/auth.types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import OAuthButtons from './OAuthButtons';
import { toast } from 'sonner';

const RegisterForm = () => {
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData>>({});
  const [accepted, setAccepted] = useState(false);
  const [agreeError, setAgreeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Show toast for URL messages
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error) {
      toast.error(decodeURIComponent(error));
    }
    if (message) {
      toast.success(decodeURIComponent(message));
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

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
    const fieldsValid = Object.keys(newErrors).length === 0;
    if (!accepted) {
      setAgreeError('You must accept the Terms of Service and Privacy Policy');
    } else {
      setAgreeError(null);
    }
    return fieldsValid && accepted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register(formData);
      // Redirect to login page (toast already shown by AuthContext)
      router.push('/login');
    } catch (error) {
      // Error handling is done in the auth context with toast
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Information (swapped) */}
        <div className="hidden lg:flex lg:items-center lg:justify-center relative lg:order-1 order-2">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="max-w-lg px-8 relative z-10 lg:mt-2 xl:mt-4"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </motion.svg>
              </motion.div>
              
              <motion.h2
                className="text-4xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Start Your Journey
              </motion.h2>
              
              <motion.p
                className="text-xl text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Join thousands of SMEs transforming their business with NusantaraX
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
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                  title: "Set up in 5 minutes",
                  desc: "Start using the platform in minutes. Simple and intuitive for every level.",
                  delay: 1.2
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />,
                  title: "Flexible plans",
                  desc: "Start free and upgrade as you grow. No long-term contracts.",
                  delay: 1.4
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
                  title: "24/7 Support",
                  desc: "Our support team is ready anytime. Complete guides and step-by-step tutorials available.",
                  delay: 1.6
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
                  title: "Secure by design",
                  desc: "Best-practice security, encrypted data, and verified email out of the box.",
                  delay: 1.8
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6l2 3h10M5 17h14M5 13h10" />,
                  title: "Seamless onboarding",
                  desc: "Invite teammates, set roles, and get started together in minutes.",
                  delay: 2.0
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 group"
                  initial={{ opacity: 0, x: -20 }}
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
                    <svg className="h-6 w-6 text-[#72c306] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </motion.div>
        </div>

        {/* Right Side - Register Form (swapped) */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 lg:order-2 order-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="rounded-xl border-2 border-[#72c306] bg-black p-8 shadow-[0_0_20px_rgba(114,195,6,0.15)]">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Create Account</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Join NusantaraX and start your digital innovation journey
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="text-white">Full Name</Label>
                    <div className="mt-2 relative">
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`
                          appearance-none relative block w-full px-3 py-2 pl-10 bg-gray-900/70 border rounded-lg
                          placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]
                          ${errors.fullName ? 'border-red-600/50' : 'border-gray-800'}
                        `}
                        placeholder="Enter your full name"
                      />
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
                    )}
                  </div>

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
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`
                          appearance-none relative block w-full px-3 py-2 pl-10 pr-10 bg-gray-900/70 border rounded-lg
                          placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]
                          ${errors.password ? 'border-red-600/50' : 'border-gray-800'}
                        `}
                        placeholder="Create a strong password"
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
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
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
                          appearance-none relative block w-full px-3 py-2 pl-10 pr-10 bg-gray-900/70 border rounded-lg
                          placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]
                          ${errors.confirmPassword ? 'border-red-600/50' : 'border-gray-800'}
                        `}
                        placeholder="Confirm your password"
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

                <div className="text-xs text-gray-400">
                  <label htmlFor="agree" className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      id="agree"
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => { setAccepted(e.target.checked); if (e.target.checked) setAgreeError(null); }}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border border-gray-700 bg-gray-900/70 transition-colors peer-focus:ring-2 peer-focus:ring-[#72c306] peer-focus:ring-offset-0 peer-checked:bg-[#72c306] peer-checked:border-[#72c306] peer-checked:[&_svg]:opacity-100"
                    >
                      <svg className="h-3 w-3 text-black opacity-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="text-[#72c306] hover:text-[#8fd428]">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-[#72c306] hover:text-[#8fd428]">Privacy Policy</Link>.
                    </span>
                  </label>
                  {agreeError && (
                    <p className="text-red-400 mt-1">{agreeError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !accepted}
                  className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none"
                  size="lg"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="font-medium text-[#72c306] hover:text-[#8fd428] transition-colors"
                    >
                      Sign in here
                    </Link>
                  </span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        
      </div>
    </div>
  );
};

export default RegisterForm;
