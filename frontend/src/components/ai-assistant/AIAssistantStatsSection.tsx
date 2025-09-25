'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Activity, Clock, Zap, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aiAssistantAPI } from '@/lib/api';
import { toast } from 'sonner';

interface AIAssistantStats {
  totalMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  averageTokensPerMessage: number;
  createdAt: string | null;
  lastActivityAt: string | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
};

const AIAssistantStatsSection: React.FC = () => {
  const [stats, setStats] = useState<AIAssistantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await aiAssistantAPI.getUsageStats();
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error('Failed to load AI Assistant statistics');
      }
    } catch (error) {
      console.error('Failed to fetch AI Assistant stats:', error);
      toast.error('Error loading AI Assistant statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-[#72c306]" />
        </div>
      </motion.div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
            <Brain className="h-5 w-5 text-[#72c306]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Assistant Statistics</h3>
            <p className="text-sm text-gray-400">Your digital marketing advisor usage overview</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black border border-[#72c306]/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-[#72c306]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Messages</p>
              <p className="text-white font-bold text-xl">{(stats.totalMessages || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-black border border-[#72c306]/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
              <Activity className="h-4 w-4 text-[#72c306]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Input Tokens</p>
              <p className="text-white font-bold text-xl">{(stats.totalInputTokens || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-black border border-[#72c306]/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
              <Zap className="h-4 w-4 text-[#72c306]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Tokens</p>
              <p className="text-white font-bold text-xl">{(stats.totalTokens || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-black border border-[#72c306]/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#72c306]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg/Message</p>
              <p className="text-white font-bold text-xl">{Math.round(stats.averageTokensPerMessage || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Token Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-black border border-[#72c306]/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4 flex items-center">
            <BarChart3 className="h-4 w-4 text-[#72c306] mr-2" />
            Token Breakdown
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Input Tokens</span>
              <span className="text-blue-400 font-bold">{(stats.totalInputTokens || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Output Tokens</span>
              <span className="text-green-400 font-bold">{(stats.totalOutputTokens || 0).toLocaleString()}</span>
            </div>
            {stats.totalTokens > 0 && (
              <>
                <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${((stats.totalOutputTokens || 0) / stats.totalTokens) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {Math.round(((stats.totalOutputTokens || 0) / stats.totalTokens) * 100)}% output, {Math.round(((stats.totalInputTokens || 0) / stats.totalTokens) * 100)}% input
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-black border border-[#72c306]/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4 flex items-center">
            <Clock className="h-4 w-4 text-[#72c306] mr-2" />
            Usage Status
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Last Used</span>
              <span className="text-white text-sm">
                {stats.lastActivityAt 
                  ? new Date(stats.lastActivityAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Status</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      {stats.dailyUsage && stats.dailyUsage.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h4 className="text-white font-medium mb-4 flex items-center">
            <Activity className="h-4 w-4 text-[#72c306] mr-2" />
            Daily Usage (Last 7 Days)
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyUsage.slice(-7).map(day => ({
                name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                messages: day.messages,
                tokens: Math.round(day.tokens / 100) // Scale down for better visualization
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
                  labelFormatter={(value) => `Date: ${value}`}
                  formatter={(value, name) => [
                    name === 'tokens' ? `${Math.round(Number(value) * 100)} tokens` : `${value} ${name}`,
                    name === 'tokens' ? 'Tokens' : 'Messages'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#72c306" 
                  strokeWidth={2} 
                  dot={{ fill: '#72c306', strokeWidth: 2, r: 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/10 border border-[#72c306]/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium mb-1">Need marketing advice?</h4>
            <p className="text-gray-400 text-sm">Chat with our AI Assistant anytime using the floating button</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-[#72c306] text-sm font-medium">Available 24/7</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantStatsSection;