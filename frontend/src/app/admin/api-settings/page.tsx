'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Save,
  TestTube,
  Database,
  BarChart3,
} from 'lucide-react';
import { geminiAPI, handleApiError } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ApiSettingsPage = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState<any>({});
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState<any>({});
  const [apiStatistics, setApiStatistics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Legacy single API Key management
  const [newApiKey, setNewApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);

  
  const fetchApiData = async () => {
    try {
      setIsLoading(true);
      
      const [statusResponse, modelsResponse, usageResponse, statisticsResponse] = await Promise.all([
        geminiAPI.getApiKeyStatus(),
        geminiAPI.getAvailableModels(),
        geminiAPI.getUsageStats(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.nusantarax.web.id/api'}/gemini/statistics`, {
          credentials: 'include'
        }).then(res => res.json())
      ]);

      if (statusResponse.success) {
        setApiKeyStatus(statusResponse.data);
      }

      if (modelsResponse.success) {
        setAvailableModels(modelsResponse.data.models);
      }

      if (usageResponse.success) {
        setUsageStats(usageResponse.data);
      }

      if (statisticsResponse.success) {
        setApiStatistics(statisticsResponse.data);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  const handleTestApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter an API key to test');
      return;
    }

    setIsTestingKey(true);
    try {
      const response = await geminiAPI.testApiKey(newApiKey);
      
      if (response.success) {
        toast.success('API key is valid and working!');
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter a new API key');
      return;
    }

    setIsUpdatingKey(true);
    try {
      const response = await geminiAPI.updateApiKey(newApiKey);
      
      if (response.success) {
        toast.success(response.message);
        setNewApiKey('');
        fetchApiData(); // Refresh data
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setIsUpdatingKey(false);
    }
  };

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
    <DashboardLayout requiredRole="ADMIN">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">API Settings</h1>
              <p className="text-gray-400">Manage your Gemini API configuration and monitor usage</p>
            </div>
          </div>
        </motion.div>

        {/* API Key Status & KPI Cards */}
        <motion.div variants={fadeInUp} className="bg-black border border-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center text-white">
              <Key className="h-5 w-5 mr-2 text-[#72c306]" />
              API Key Status & Statistics
            </h3>
            <Button size="sm" onClick={fetchApiData} className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#72c306]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* API Key Info */}
              <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Current API Key</p>
                  <p className="font-mono text-sm text-white">
                    {apiKeyStatus.apiKey || 'Not configured'}
                  </p>
                </div>
                <div className={`flex items-center ${
                  apiKeyStatus.isValid ? 'text-[#72c306]' : 'text-red-400'
                }`}>
                  {apiKeyStatus.isValid ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="ml-1 text-sm font-medium">
                    {apiKeyStatus.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-black border border-gray-700 rounded-lg">
                  <div className="text-3xl font-bold text-[#72c306] mb-1">
                    {apiStatistics.totalRequests || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Requests</div>
                  <div className="text-xs text-gray-500 mt-1">Last 30 Days</div>
                </div>
                
                <div className="text-center p-4 bg-black border border-gray-700 rounded-lg">
                  <div className="text-3xl font-bold text-[#72c306] mb-1">
                    {apiStatistics.successRequests || 0}
                  </div>
                  <div className="text-sm text-gray-400">Successful</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {apiStatistics.totalRequests ? Math.round((apiStatistics.successRequests / apiStatistics.totalRequests) * 100) : 0}% Success Rate
                  </div>
                </div>
                
                <div className="text-center p-4 bg-black border border-gray-700 rounded-lg">
                  <div className="text-3xl font-bold text-red-400 mb-1">
                    {apiStatistics.failedRequests || 0}
                  </div>
                  <div className="text-sm text-gray-400">Failed</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {apiStatistics.totalRequests ? Math.round((apiStatistics.failedRequests / apiStatistics.totalRequests) * 100) : 0}% Error Rate
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <p><strong className="text-white">Status:</strong> {apiKeyStatus.message}</p>
                {apiKeyStatus.modelsCount && (
                  <p><strong className="text-white">Available Models:</strong> {apiKeyStatus.modelsCount}</p>
                )}
                {apiStatistics.avgResponseTime && (
                  <p><strong className="text-white">Avg Response Time:</strong> {apiStatistics.avgResponseTime}ms</p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Available Models */}
        <motion.div variants={fadeInUp} className="mt-6 bg-black border border-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
            <Database className="h-5 w-5 mr-2 text-[#72c306]" />
            Available Models
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#72c306]" />
            </div>
          ) : availableModels.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No models available. Please check your API key configuration.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableModels.map((model, index) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-700 bg-black rounded-lg p-4 hover:shadow-lg hover:shadow-[#72c306]/10 transition-all"
                >
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-2">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-white">{model.displayName}</h4>
                      <p className="text-xs text-gray-400">{model.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      model.available
                        ? 'bg-[#72c306]/20 text-[#72c306] border border-[#72c306]/30'
                        : 'bg-red-600/20 text-red-400 border border-red-600/30'
                    }`}>
                      {model.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Usage Statistics */}
        <motion.div variants={fadeInUp} className="mt-6 bg-black border border-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
            <BarChart3 className="h-5 w-5 mr-2 text-[#72c306]" />
            Usage Statistics
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#72c306]" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-black border border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-[#72c306] mb-1">
                  {usageStats.totalRequests || 0}
                </div>
                <div className="text-sm text-gray-400">Total Requests</div>
                <div className="text-xs text-gray-500 mt-1">This Month</div>
              </div>
              
              <div className="text-center p-4 bg-black border border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-[#72c306] mb-1">
                  {usageStats.totalTokens || 0}
                </div>
                <div className="text-sm text-gray-400">Total Tokens</div>
                <div className="text-xs text-gray-500 mt-1">This Month</div>
              </div>
              
              <div className="text-center p-4 bg-black border border-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-[#72c306] mb-1">
                  {usageStats.monthlyQuota || 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Monthly Quota</div>
                <div className="text-xs text-gray-500 mt-1">
                  {usageStats.currentPeriod || 'Current Period'}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-orange-600/10 border border-orange-600/30 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-400 mr-2" />
              <div>
                <h4 className="font-medium text-orange-300">Usage Tracking</h4>
                <p className="text-sm text-orange-400">
                  Usage statistics are tracked locally. For detailed billing information, check your Google AI Studio dashboard.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Simplified API Information */}
        <motion.div variants={fadeInUp} className="mt-6 bg-black border border-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">API Key Configuration</h3>
          
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <h4 className="font-medium text-blue-300">Simplified Configuration</h4>
                <p className="text-sm text-blue-400">
                  This application uses a single API key from your .env configuration for consistency and simplicity.
                  To update your API key permanently, modify the GEMINI_API_KEY value in your .env file and restart the server.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-black border border-gray-700 rounded-lg">
            <h4 className="font-medium text-white mb-2">Current Setup Benefits</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Simple and consistent configuration</li>
              <li>• Direct API key management through environment variables</li>
              <li>• No complex failover logic to debug</li>
              <li>• Easier to maintain and monitor</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ApiSettingsPage;