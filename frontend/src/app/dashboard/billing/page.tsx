'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CreditCard,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Activity,
  Zap,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Wallet,
  ArrowUp,
  Settings,
  Crown,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { billingAPI, walletAPI, handleApiError } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface BillingOverview {
  currentSubscription: {
    id: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    requestsUsed: number;
    requestsLimit: number;
    usagePercentage: number;
    requestsRemaining: number;
    autoRenew: boolean;
    planId: string;
    plan: {
      id: string;
      name: string;
      displayName: string;
      description: string;
      monthlyRequests: number;
      monthlyPriceFormatted: string;
      yearlyPriceFormatted: string;
    };
  } | null;
  nextBillingDate: string | null;
  totalSpent: number;
  totalSpentFormatted: string;
  recentPayments: Array<{
    id: string;
    amount: number;
    amountFormatted: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
}

interface UsageStats {
  overview: {
    totalRequests: number;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    timeframe: string;
  };
  modelUsage: Array<{
    model: string;
    requests: number;
    tokens: number;
  }>;
  endpointUsage: Array<{
    endpoint: string;
    requests: number;
    tokens: number;
  }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
  }>;
}

interface RecentError {
  id: string;
  endpoint: string;
  modelUsed: string | null;
  status: string;
  errorMessage: string | null;
  errorCode: string | null;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyRequests: number;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceFormatted: string;
  yearlyPriceFormatted: string;
  isActive: boolean;
  tier: number;
}

interface WalletData {
  balance: number;
  balanceFormatted: string;
}

interface UpgradePreview {
  currentPlan: any;
  newPlan: SubscriptionPlan;
  pricing: {
    amount: number;
    amountFormatted: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
  };
  wallet: {
    currentBalance: number;
    currentBalanceFormatted: string;
    remainingAfterUpgrade: number;
    remainingAfterUpgradeFormatted: string;
    canAfford: boolean;
  };
}

export default function BillingPage() {
  const [billingOverview, setBillingOverview] = useState<BillingOverview | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'month' | 'week' | 'today'>('month');
  const [error, setError] = useState<string | null>(null);
  
  // Upgrade modal states
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [upgradePreview, setUpgradePreview] = useState<UpgradePreview | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const fetchBillingOverview = async () => {
    try {
      const response = await billingAPI.getBillingOverview();
      if (response.success) {
        setBillingOverview(response.data);
        // Only show success toast on manual refresh, not on initial load
      } else {
        toast.error('Failed to load billing overview');
      }
    } catch (err: any) {
      console.error('Failed to fetch billing overview:', err);
      toast.error('Error loading billing overview');
    }
  };

  const fetchUsageStats = async (selectedTimeframe: 'month' | 'week' | 'today' = timeframe) => {
    try {
      const response = await billingAPI.getUsageStats(selectedTimeframe);
      if (response.success) {
        setUsageStats(response.data);
        // Only show success toast on manual refresh, not on initial load
      } else {
        toast.error('Failed to load usage statistics');
      }
    } catch (err: any) {
      console.error('Failed to fetch usage stats:', err);
      toast.error('Error loading usage statistics');
    }
  };

  const fetchRecentErrors = async () => {
    try {
      const response = await billingAPI.getRecentErrors(5);
      if (response.success) {
        setRecentErrors(response.data);
        // Only show success toast on manual refresh, not on initial load
      } else {
        toast.error('Failed to load recent errors');
      }
    } catch (err: any) {
      console.error('Failed to fetch recent errors:', err);
      toast.error('Error loading recent errors');
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await billingAPI.getAllPlans();
      if (response.success) {
        setAvailablePlans(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch plans:', err);
    }
  };

  const fetchWalletData = async () => {
    try {
      const response = await walletAPI.getWallet();
      if (response.success) {
        setWalletData(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch wallet:', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBillingOverview(),
        fetchUsageStats(),
        fetchRecentErrors(),
        fetchAvailablePlans(),
        fetchWalletData()
      ]);
      // Only show success toast on manual refresh, not on initial load
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      toast.error(`Error loading billing data: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTimeframeChange = (newTimeframe: 'month' | 'week' | 'today') => {
    setTimeframe(newTimeframe);
    toast.loading(`Loading ${newTimeframe} usage data...`);
    fetchUsageStats(newTimeframe);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-[#72c306]';
  };

  const handleAutoRenewToggle = async (enabled: boolean) => {
    try {
      const response = await billingAPI.toggleAutoRenew(enabled);
      if (response.success) {
        toast.success(response.message);
        fetchBillingOverview(); // Refresh to show updated status
      } else {
        toast.error('Failed to toggle auto-renew');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to toggle auto-renew: ${errorMessage}`);
    }
  };

  const handleUpgradePlan = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsUpgradeModalOpen(true);
    await fetchUpgradePreview(plan.id, selectedBillingCycle);
  };

  const fetchUpgradePreview = async (planId: string, billingCycle: 'MONTHLY' | 'YEARLY') => {
    try {
      const preview = await billingAPI.getUpgradePreview(planId, billingCycle);
      if (preview.success) {
        setUpgradePreview(preview.data);
      } else {
        toast.error('Failed to load upgrade preview');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to get upgrade preview: ${errorMessage}`);
      setUpgradePreview(null);
    }
  };

  const handleBillingCycleChange = async (newCycle: 'MONTHLY' | 'YEARLY') => {
    setSelectedBillingCycle(newCycle);
    if (selectedPlan) {
      await fetchUpgradePreview(selectedPlan.id, newCycle);
    }
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan || !upgradePreview) return;
    
    // Check affordability before attempting upgrade
    if (!upgradePreview.wallet.canAfford) {
      toast.error(`Insufficient wallet balance. Required: ${upgradePreview.pricing.amountFormatted}, Available: ${upgradePreview.wallet.currentBalanceFormatted}`);
      return;
    }
    
    setIsUpgrading(true);
    try {
      const response = await billingAPI.upgradePlan(selectedPlan.id, selectedBillingCycle);
      if (response.success) {
        toast.success('Plan upgraded successfully!');
        setIsUpgradeModalOpen(false);
        fetchBillingOverview();
        fetchWalletData();
      } else {
        // Show specific error message from backend
        const errorMsg = response.error || response.message || 'Failed to upgrade plan';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      let errorMessage = 'Failed to upgrade plan';
      
      // Extract more specific error messages
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle common error scenarios
      if (errorMessage.toLowerCase().includes('insufficient')) {
        errorMessage = `Insufficient wallet balance. Please top up your wallet first.`;
      } else if (errorMessage.toLowerCase().includes('wallet not found')) {
        errorMessage = 'Wallet not found. Please contact support.';
      } else if (errorMessage.toLowerCase().includes('plan not found')) {
        errorMessage = 'Selected plan is no longer available.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUpgrading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Zap className="h-5 w-5" />;
      case 'basic':
        return <Star className="h-5 w-5" />;
      case 'pro':
        return <Crown className="h-5 w-5" />;
      case 'enterprise':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return billingOverview?.currentSubscription?.planId === planId;
  };

  const getPlanTier = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return 0;
      case 'basic': return 1;
      case 'pro': return 2;
      case 'enterprise': return 3;
      default: return 0;
    }
  };

  const canUpgradeToPlan = (plan: SubscriptionPlan) => {
    if (!billingOverview?.currentSubscription) return true;
    
    // Always allow clicking for upgrades (higher tier) - downgrades will show contact support message
    const currentPlanTier = getPlanTier(billingOverview.currentSubscription.plan.name);
    const targetPlanTier = getPlanTier(plan.name);
    
    return targetPlanTier > currentPlanTier;
  };

  const getUpgradeButtonText = (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan.id)) {
      return 'Current Plan';
    }
    
    if (!billingOverview?.currentSubscription) {
      return `Subscribe to ${plan.displayName}`;
    }
    
    const currentPlanTier = getPlanTier(billingOverview.currentSubscription.plan.name);
    const targetPlanTier = getPlanTier(plan.name);
    
    if (targetPlanTier < currentPlanTier) {
      return 'Downgrade';
    }
    
    return `Upgrade to ${plan.displayName}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-[#72c306]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-500 font-medium">Error</span>
            </div>
            <p className="text-red-400 mt-2">{error}</p>
            <Button 
              onClick={fetchAllData}
              className="mt-4 bg-red-500 hover:bg-red-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Billing & Usage</h1>
              <p className="text-sm sm:text-base text-gray-400 hidden sm:block">Monitor your subscription, usage, and billing information</p>
            </div>
          </div>
          <Button
            onClick={fetchAllData}
            size="sm"
            className="w-full sm:w-auto bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Usage Statistics Header */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Usage Statistics</h2>
          <div className="flex space-x-2">
            {(['today', 'week', 'month'] as const).map((period) => (
              <Button
                key={period}
                onClick={() => handleTimeframeChange(period)}
                variant={timeframe === period ? "default" : "outline"}
                size="sm"
                className={`flex-1 sm:flex-none text-xs sm:text-sm ${
                  timeframe === period
                    ? "bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                    : "bg-black border-[#72c306] text-gray-300 hover:text-white hover:bg-black"
                }`}
              >
                {period === 'today' ? 'Today' : period === 'week' ? 'Weekly' : 'Monthly'}
              </Button>
            ))}
          </div>
        </div>

        {/* Usage Overview Cards */}
        {usageStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-black border border-[#72c306]/30 rounded-lg p-3 sm:p-6 shadow-lg shadow-[#72c306]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Total Requests</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{usageStats.overview.totalRequests.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-black border border-[#72c306]/30 rounded-lg p-3 sm:p-6 shadow-lg shadow-[#72c306]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Total Tokens</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{usageStats.overview.totalTokens.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-black border border-[#72c306]/30 rounded-lg p-3 sm:p-6 shadow-lg shadow-[#72c306]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Input Tokens</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{usageStats.overview.inputTokens.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-black border border-[#72c306]/30 rounded-lg p-3 sm:p-6 shadow-lg shadow-[#72c306]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Output Tokens</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{usageStats.overview.outputTokens.toLocaleString()}</p>
                </div>
                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Statistics Info Note */}
        {usageStats && (
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-blue-400 mb-2">Usage Statistics Information</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  The statistics above (Total Requests, Total Tokens, Input Tokens, Output Tokens) include both successful and failed API calls.
                  Only successful requests count toward your subscription quota shown in "Usage This Period" below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Overview */}
        {billingOverview?.currentSubscription && (
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-3 sm:p-6 shadow-lg shadow-[#72c306]/10">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Current Subscription</h2>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-[#72c306]" />
                  <span className="text-gray-400 text-sm">Auto-Renew</span>
                  <Switch
                    checked={billingOverview.currentSubscription.autoRenew}
                    onCheckedChange={handleAutoRenewToggle}
                    className="data-[state=checked]:bg-[#72c306]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(billingOverview.currentSubscription.status)}
                  <span className="capitalize text-sm">{billingOverview.currentSubscription.status}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="text-gray-300 text-sm">Plan</p>
                <p className="text-lg sm:text-xl font-bold text-white">{billingOverview.currentSubscription.plan.displayName}</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{billingOverview.currentSubscription.plan.description}</p>
              </div>
              
              <div>
                <p className="text-gray-300 text-sm">Usage This Period</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">
                      {billingOverview.currentSubscription.requestsUsed.toLocaleString()} / {billingOverview.currentSubscription.requestsLimit.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm">{billingOverview.currentSubscription.usagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-800 border border-[#72c306]/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageBarColor(billingOverview.currentSubscription.usagePercentage)}`}
                      style={{ width: `${Math.min(billingOverview.currentSubscription.usagePercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    {billingOverview.currentSubscription.requestsRemaining.toLocaleString()} requests remaining
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-300 text-sm">Next Billing</p>
                <p className="text-base sm:text-lg font-semibold text-white">
                  {billingOverview.nextBillingDate ? formatDate(billingOverview.nextBillingDate) : 'N/A'}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  {billingOverview.currentSubscription.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'} billing
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Available Plans - Upgrade Section */}
        {availablePlans.length > 0 && (
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-3 sm:p-6 shadow-lg shadow-[#72c306]/10">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Subscription Plans</h2>
                <p className="text-gray-400 text-xs sm:text-sm">Choose the plan that fits your needs</p>
              </div>
              {walletData && (
                <div className="flex items-center space-x-2 bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg px-3 sm:px-4 py-2">
                  <Wallet className="h-4 w-4 text-[#72c306]" />
                  <span className="text-white font-medium text-sm sm:text-base">{walletData.balanceFormatted}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {availablePlans.map((plan) => {
                const isCurrentUserPlan = isCurrentPlan(plan.id);
                const isPopularPlan = plan.name.toLowerCase() === 'basic';
                const canUpgrade = canUpgradeToPlan(plan) && !isCurrentUserPlan;
                return (
                  <Card key={plan.id} className={`relative bg-black border ${isCurrentUserPlan ? 'border-[#72c306] shadow-lg shadow-[#72c306]/25' : 'border-[#72c306]/30'} p-4 sm:p-6 overflow-hidden flex flex-col h-full`}>
                    {/* Popular Badge */}
                    {isPopularPlan && (
                      <div className="absolute top-3 sm:top-4 -right-6 sm:-right-8 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold py-1 px-6 sm:px-8 transform rotate-45 shadow-lg shadow-red-500/50">
                        POPULAR
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center ${isCurrentUserPlan ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428]' : 'bg-gray-700'}`}>
                          {getPlanIcon(plan.name)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm sm:text-base">{plan.displayName}</h3>
                          {isCurrentUserPlan && (
                            <span className="text-[#72c306] text-xs font-medium">Current Plan</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4 sm:mb-6 flex-1">
                      <p className="text-gray-400 text-xs sm:text-sm mb-3">{plan.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs sm:text-sm">Monthly Requests</span>
                          <span className="text-white font-medium text-xs sm:text-sm">
                            {plan.monthlyRequests === -1 ? 'Unlimited' : plan.monthlyRequests.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs sm:text-sm">Monthly Price</span>
                          <span className="text-white font-medium text-xs sm:text-sm">{plan.monthlyPriceFormatted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs sm:text-sm">Yearly Price</span>
                          <span className="text-white font-medium text-xs sm:text-sm">{plan.yearlyPriceFormatted}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => canUpgrade ? handleUpgradePlan(plan) : undefined}
                      disabled={isCurrentUserPlan || !canUpgrade}
                      size="sm"
                      className={`w-full text-xs sm:text-sm ${isCurrentUserPlan
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : canUpgrade
                          ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canUpgrade && getUpgradeButtonText(plan).includes('Upgrade') ? (
                        <div className="flex items-center space-x-2">
                          <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{getUpgradeButtonText(plan)}</span>
                        </div>
                      ) : (
                        getUpgradeButtonText(plan)
                      )}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Usage Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model Usage */}
          {usageStats && usageStats.modelUsage.length > 0 && (
            <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
              <h3 className="text-lg font-semibold text-white mb-4">Usage by Model</h3>
              <div className="space-y-3">
                {usageStats.modelUsage.slice(0, 5).map((model, index) => (
                  <div key={model.model} className="flex items-center justify-between p-3 bg-black border border-[#72c306]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-[#72c306]" />
                      <span className="text-white text-sm">{model.model || 'Unknown'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{model.requests.toLocaleString()}</p>
                      <p className="text-gray-400 text-xs">{model.tokens.toLocaleString()} tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endpoint Usage */}
          {usageStats && usageStats.endpointUsage.length > 0 && (
            <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
              <h3 className="text-lg font-semibold text-white mb-4">Usage by Endpoint</h3>
              <div className="space-y-3">
                {usageStats.endpointUsage.slice(0, 5).map((endpoint, index) => (
                  <div key={endpoint.endpoint} className="flex items-center justify-between p-3 bg-black border border-[#72c306]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-white text-sm">{endpoint.endpoint}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{endpoint.requests.toLocaleString()}</p>
                      <p className="text-gray-400 text-xs">{endpoint.tokens.toLocaleString()} tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Errors & Billing History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Errors */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Errors</h3>
            <div className="space-y-3">
              {recentErrors.length > 0 ? (
                recentErrors.map((error) => (
                  <div key={error.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-red-400 font-medium text-sm">{error.endpoint}</p>
                        {error.modelUsed && (
                          <p className="text-gray-400 text-xs">Model: {error.modelUsed}</p>
                        )}
                        {error.errorMessage && (
                          <p className="text-gray-300 text-xs mt-1">{error.errorMessage}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-red-500 text-xs">{error.status}</span>
                        <p className="text-gray-400 text-xs">{formatDateTime(error.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No recent errors</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Payments</h3>
            <div className="space-y-3">
              {billingOverview?.recentPayments && billingOverview?.recentPayments?.length > 0 ? (
                billingOverview?.recentPayments?.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-black border border-[#72c306]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="text-white text-sm">{payment.description}</p>
                        <p className="text-gray-400 text-xs">{formatDateTime(payment.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-white font-medium">{payment.amountFormatted}</p>
                  </div>
                ))
             ) : (
                <p className="text-gray-400 text-center py-4">No recent payments</p>
              )}
            </div>
          </div>
        </div>

        {/* Total Spending */}
        {billingOverview && (
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Total Spending</h3>
                <p className="text-gray-400 text-sm">Lifetime spending on your account</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white block">{billingOverview.totalSpentFormatted}</span>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Plan Modal */}
        <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
          <DialogContent className="bg-black border border-[#72c306]/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Upgrade to {selectedPlan?.displayName}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Review your upgrade details and confirm
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Billing Cycle Selection */}
              <div className="space-y-3">
                <p className="text-white font-medium">Billing Cycle</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleBillingCycleChange('MONTHLY')}
                    className={`h-12 ${selectedBillingCycle === 'MONTHLY'
                      ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428]'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-medium">Monthly</p>
                      <p className="text-xs">{selectedPlan?.monthlyPriceFormatted}</p>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleBillingCycleChange('YEARLY')}
                    className={`h-12 ${selectedBillingCycle === 'YEARLY'
                      ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428]'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-medium">Yearly</p>
                      <p className="text-xs">{selectedPlan?.yearlyPriceFormatted}</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Upgrade Preview Information */}
              {upgradePreview && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-medium text-sm">Upgrade Summary</h4>
                  
                  {/* Plan Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Current Plan</p>
                      <p className="text-white font-medium">
                        {upgradePreview.currentPlan?.displayName || 'Free Plan'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">New Plan</p>
                      <p className="text-white font-medium">{upgradePreview.newPlan.displayName}</p>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-2 text-sm border-t border-gray-700 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plan Cost</span>
                      <span className="text-white font-medium">{upgradePreview.pricing.amountFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Balance</span>
                      <span className="text-white font-medium">{upgradePreview.wallet.currentBalanceFormatted}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-2">
                      <span className="text-gray-400">Balance After Upgrade</span>
                      <span className={`font-medium ${upgradePreview.wallet.canAfford ? 'text-green-400' : 'text-red-400'}`}>
                        {upgradePreview.wallet.remainingAfterUpgradeFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Affordability Warning */}
                  {!upgradePreview.wallet.canAfford && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 text-sm font-medium">Insufficient Balance</span>
                      </div>
                      <p className="text-red-300 text-xs mt-1">
                        You need to top up your wallet before upgrading to this plan.
                      </p>
                    </div>
                  )}

                  {/* Success Indicator */}
                  {upgradePreview.wallet.canAfford && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">Ready to Upgrade</span>
                      </div>
                      <p className="text-green-300 text-xs mt-1">
                        You have sufficient balance to upgrade to this plan.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmUpgrade}
                  disabled={isUpgrading || (upgradePreview && !upgradePreview.wallet.canAfford)}
                  className={`flex-1 ${
                    upgradePreview && !upgradePreview.wallet.canAfford
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90'
                  }`}
                >
                  {isUpgrading ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Upgrading...</span>
                    </div>
                  ) : upgradePreview && !upgradePreview.wallet.canAfford ? (
                    'Insufficient Balance'
                  ) : (
                    'Confirm Upgrade'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </DashboardLayout>
  );
}


