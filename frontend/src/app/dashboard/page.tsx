'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, CheckCircle, AlertCircle, Image, MessageSquare, ArrowRight, Brain, BarChart3, Activity, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { billingAPI, handleApiError } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';
import AIAssistantStatsSection from '@/components/ai-assistant/AIAssistantStatsSection';

interface UsageStats {
  overview: {
    totalRequests: number;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    timeframe: string;
  };
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
  }>;
}


const DashboardPage = () => {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsageStats = async () => {
    try {
      const response = await billingAPI.getUsageStats('month');
      if (response.success) {
        setUsageStats(response.data);
      } else {
        toast.error('Failed to load usage statistics');
      }
    } catch (err: any) {
      console.error('Failed to fetch usage stats:', err);
      toast.error('Error loading usage statistics');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent mb-2">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-gray-400">
            Manage your account and access your personalized dashboard.
          </p>
        </motion.div>

        {/* Statistics Section with Real Charts */}
        {loading ? (
          <motion.div
            variants={fadeInUp}
            className="mb-8 flex items-center justify-center h-40"
          >
            <RefreshCw className="h-8 w-8 animate-spin text-[#72c306]" />
          </motion.div>
        ) : usageStats ? (
          <motion.div
            variants={fadeInUp}
            className="mb-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Total Requests Chart */}
              <div className="bg-black border border-[#72c306]/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-[#72c306]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Total Requests</h3>
                      <p className="text-sm text-gray-400">{usageStats.overview.totalRequests.toLocaleString()} requests</p>
                    </div>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageStats.dailyUsage.map(day => ({
                      name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      value: day.requests
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#72c306" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#000000',
                          border: '1px solid rgba(114, 195, 6, 0.3)',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#72c306" strokeWidth={3} dot={{ fill: '#72c306', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Total Tokens Chart */}
              <div className="bg-black border border-[#72c306]/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-[#72c306]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Total Tokens</h3>
                      <p className="text-sm text-gray-400">{usageStats.overview.totalTokens.toLocaleString()} tokens</p>
                    </div>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageStats.dailyUsage.map(day => ({
                      name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      value: day.tokens
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#72c306" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#000000',
                          border: '1px solid rgba(114, 195, 6, 0.3)',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#72c306" fillOpacity={0.3} fill="#72c306" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Output Tokens vs Input Tokens Chart */}
              <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-[#72c306]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Token Usage Breakdown</h3>
                      <p className="text-sm text-gray-400">Output: {usageStats.overview.outputTokens.toLocaleString()} | Input: {usageStats.overview.inputTokens.toLocaleString()} tokens</p>
                    </div>
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageStats.dailyUsage.map(day => ({
                      name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      output: Math.round(day.tokens * 0.65), // Approximate output tokens (65% of total)
                      input: Math.round(day.tokens * 0.35)   // Approximate input tokens (35% of total)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#72c306" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#000000',
                          border: '1px solid rgba(114, 195, 6, 0.3)',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                      />
                      <Bar dataKey="output" fill="#72c306" name="Output Tokens" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="input" fill="#3B82F6" name="Input Tokens" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}


        {/* Account Information - Full Width */}
        <motion.div
          variants={fadeInUp}
          className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-[#72c306]" />
            </div>
            <h3 className="text-lg font-semibold text-white">Account Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Full Name:</span>
                <span className="font-medium text-white">{user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-medium text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'ADMIN'
                    ? 'bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 text-[#72c306] border border-[#72c306]/30'
                    : 'bg-gray-800 text-gray-300'
                }`}>
                  {user?.role === 'ADMIN' ? 'Premium' : 'Basic'}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Email Status:</span>
                <span className={`flex items-center text-sm ${
                  user?.emailVerified ? 'text-[#72c306]' : 'text-orange-400'
                }`}>
                  {user?.emailVerified ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Unverified
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login:</span>
                <span className="font-medium text-white">
                  {user?.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Created:</span>
                <span className="font-medium text-white">Recently</span>
              </div>
            </div>
          </div>
        </motion.div>

        {user?.role === 'ADMIN' && (
          <motion.div
            variants={fadeInUp}
            className="bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-lg p-6 text-white mb-8 shadow-lg shadow-[#72c306]/25"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 mr-3" />
              <h3 className="text-xl font-semibold">Admin Access</h3>
            </div>
            <p className="text-green-100 mb-4">
              You have administrator privileges. Access the user management panel through the sidebar.
            </p>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/admin/users'}
              className="bg-white text-[#72c306] hover:bg-gray-100 shadow-md"
            >
              <Shield className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </motion.div>
        )}

        {/* Available Services */}
        <motion.div
          variants={fadeInUp}
          className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center mr-3">
              <BarChart3 className="h-5 w-5 text-[#72c306]" />
            </div>
            <h3 className="text-lg font-semibold text-white">Available Services</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/services/image-generator"
              className="group bg-black border border-[#72c306]/30 rounded-lg p-4 hover:border-[#8fd428]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#72c306]/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
                  <Image className="h-5 w-5 text-[#72c306]" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#72c306] transition-colors" />
              </div>
              <h4 className="text-white font-medium mb-2">Image Generator</h4>
              <p className="text-sm text-gray-400">Generate professional product images using AI technology</p>
            </Link>

            <Link
              href="/dashboard/services/caption-generator"
              className="group bg-black border border-[#72c306]/30 rounded-lg p-4 hover:border-[#8fd428]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#72c306]/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-[#72c306]" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#72c306] transition-colors" />
              </div>
              <h4 className="text-white font-medium mb-2">Caption Generator</h4>
              <p className="text-sm text-gray-400">Generate engaging social media captions with AI</p>
            </Link>
          </div>
        </motion.div>

        {/* AI Assistant Statistics */}
        <AIAssistantStatsSection />
      </motion.div>
    </DashboardLayout>
  );
};

export default DashboardPage;