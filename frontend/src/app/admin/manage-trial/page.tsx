'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  BarChart3,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminTrialAPI, handleApiError } from '@/lib/api';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  monthlyPriceFormatted: string;
  monthlyRequests: number;
  hasTrialConfig: boolean;
  trialConfig: TrialConfiguration | null;
}

interface TrialConfiguration {
  id: string;
  planId: string;
  isActive: boolean;
  trialDays: number;
  maxTrialUsers: number;
  currentTrialUsers: number;
  validFrom: string;
  validUntil: string;
  description: string | null;
  createdAt: string;
  plan?: {
    name: string;
    displayName: string;
    monthlyPriceFormatted: string;
  };
}

interface TrialStatistics {
  overview: {
    totalTrials: number;
    activeTrials: number;
    expiredTrials: number;
    convertedTrials: number;
    conversionRate: number;
  };
  trialsByPlan: any[];
  recentTrials: any[];
}

interface CreateTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availablePlans: SubscriptionPlan[];
}

const CreateTrialModal: React.FC<CreateTrialModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  availablePlans 
}) => {
  const [formData, setFormData] = useState({
    planId: '',
    trialDays: 7,
    maxTrialUsers: 100,
    validFrom: '',
    validUntil: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Set default dates
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      setFormData(prev => ({
        ...prev,
        validFrom: today.toISOString().split('T')[0],
        validUntil: nextMonth.toISOString().split('T')[0],
      }));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.planId || !formData.validFrom || !formData.validUntil) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await adminTrialAPI.createConfiguration({
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
      });

      if (response.success) {
        toast.success('Trial configuration created successfully');
        onSuccess();
        onClose();
        setFormData({
          planId: '',
          trialDays: 7,
          maxTrialUsers: 100,
          validFrom: '',
          validUntil: '',
          description: '',
        });
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg shadow-[#72c306]/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Create Trial Configuration</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Subscription Plan *
            </label>
            <Select 
              value={formData.planId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, planId: value }))}
            >
              <SelectTrigger className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#72c306]/30">
                {availablePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id} className="text-white">
                    {plan.displayName} - {plan.monthlyPriceFormatted}/month
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Trial Days *
              </label>
              <Input
                type="number"
                min="1"
                max="365"
                value={formData.trialDays}
                onChange={(e) => setFormData(prev => ({ ...prev, trialDays: parseInt(e.target.value) || 7 }))}
                className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Max Users *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.maxTrialUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxTrialUsers: parseInt(e.target.value) || 100 }))}
                className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Valid From *
              </label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Valid Until *
              </label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Description
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description for this trial configuration"
              className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306] placeholder-gray-400"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
            >
              {loading ? 'Creating...' : 'Create Configuration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ManageTrialPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [trialConfigs, setTrialConfigs] = useState<TrialConfiguration[]>([]);
  const [statistics, setStatistics] = useState<TrialStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansResponse, configsResponse, statsResponse, availableResponse] = await Promise.all([
        adminTrialAPI.getAllPlansWithTrialStatus(),
        adminTrialAPI.getAllConfigurations(),
        adminTrialAPI.getStatistics(),
        adminTrialAPI.getAvailablePlans(),
      ]);

      if (plansResponse.success) setPlans(plansResponse.data);
      if (configsResponse.success) setTrialConfigs(configsResponse.data);
      if (statsResponse.success) setStatistics(statsResponse.data);
      if (availableResponse.success) setAvailablePlans(availableResponse.data);
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    const loadingToast = toast.loading('Refreshing trial data...');
    try {
      await fetchData();
      toast.dismiss(loadingToast);
      toast.success('Trial data refreshed successfully');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to refresh trial data');
    }
  };

  const handleToggleActive = async (configId: string, isActive: boolean) => {
    try {
      const response = await adminTrialAPI.updateConfiguration(configId, { isActive });
      
      if (response.success) {
        toast.success(`Trial configuration ${isActive ? 'activated' : 'deactivated'} successfully`);
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this trial configuration?')) return;

    try {
      const response = await adminTrialAPI.deleteConfiguration(configId);
      
      if (response.success) {
        toast.success('Trial configuration deleted successfully');
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isDateValid = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    return date >= now;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#72c306]" />
                <p className="text-gray-400">Loading trial data...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Manage Trials</h1>
                <p className="text-gray-400">Configure and monitor trial plans for users</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleRefresh}
                className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                disabled={availablePlans.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Trial Config
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Trials</p>
                    <p className="text-2xl font-bold text-white">{statistics.overview.totalTrials}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Trials</p>
                    <p className="text-2xl font-bold text-white">{statistics.overview.activeTrials}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Expired Trials</p>
                    <p className="text-2xl font-bold text-white">{statistics.overview.expiredTrials}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Converted</p>
                    <p className="text-2xl font-bold text-white">{statistics.overview.convertedTrials}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-bold text-white">{statistics.overview.conversionRate}%</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              onClick={() => setActiveTab('overview')}
              className={`w-full ${activeTab === 'overview'
                ? "bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Plans Overview
            </Button>
            <Button
              onClick={() => setActiveTab('configurations')}
              className={`w-full ${activeTab === 'configurations'
                ? "bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Trial Configurations
            </Button>
          </div>

          {/* Tab Content */}

          {activeTab === 'overview' && (
            <div className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg shadow-[#72c306]/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#72c306]/20">
                <h3 className="text-lg font-semibold text-white">Subscription Plans</h3>
                <p className="text-gray-400 text-sm">Overview of all plans and their trial status</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-white">{plan.displayName}</h3>
                          <p className="text-2xl font-bold text-[#72c306] mt-1">
                            {plan.monthlyPriceFormatted}/month
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {plan.monthlyRequests === -1 ? 'Unlimited' : plan.monthlyRequests} requests
                          </p>
                        </div>
                        {plan.hasTrialConfig ? (
                          <Badge className="bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white border-0">
                            <Gift className="h-3 w-3 mr-1" />
                            Trial Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400 border-[#72c306]/30">
                            No Trial
                          </Badge>
                        )}
                      </div>

                      {plan.trialConfig && (
                        <div className="space-y-2 pt-4 border-t border-[#72c306]/20">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Status:</span>
                            <Badge variant={plan.trialConfig.isActive ? "default" : "secondary"}>
                              {plan.trialConfig.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Trial Days:</span>
                            <span className="text-sm text-white">{plan.trialConfig.trialDays} days</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Users:</span>
                            <span className="text-sm text-white">
                              {plan.trialConfig.currentTrialUsers}/{plan.trialConfig.maxTrialUsers}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Valid Until:</span>
                            <span className="text-sm text-white">
                              {formatDate(plan.trialConfig.validUntil)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'configurations' && (
            <div className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg shadow-[#72c306]/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#72c306]/20">
                <h3 className="text-lg font-semibold text-white">Trial Configurations</h3>
                <p className="text-gray-400 text-sm">Manage trial settings for subscription plans</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-[#72c306]/20">
                    <thead className="bg-black border-b border-[#72c306]/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trial Days</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Users</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valid Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-[#72c306]/20">
                      {trialConfigs.map((config) => (
                        <tr key={config.id} className="hover:bg-[#72c306]/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-white">{config.plan?.displayName}</p>
                              <p className="text-sm text-gray-400">{config.plan?.monthlyPriceFormatted}/month</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <Switch
                                checked={config.isActive}
                                onCheckedChange={(checked) => handleToggleActive(config.id, checked)}
                                className="data-[state=checked]:bg-[#72c306] data-[state=unchecked]:bg-gray-700 border-2 border-gray-500 shadow-lg"
                              />
                              <Badge className={config.isActive ? "bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white border-0" : "bg-gray-800 text-gray-300"}>
                                {config.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-white">{config.trialDays} days</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-white">
                                {config.currentTrialUsers}/{config.maxTrialUsers}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <p className="text-white">{formatDate(config.validFrom)}</p>
                              <p className="text-gray-400">to {formatDate(config.validUntil)}</p>
                              {!isDateValid(config.validUntil) && (
                                <Badge variant="outline" className="text-red-400 border-red-600/30 mt-1">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400"
                                onClick={() => handleDeleteConfig(config.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {trialConfigs.length === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No trial configurations found</p>
                      <Button
                        onClick={() => setCreateModalOpen(true)}
                        className="mt-4 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                        disabled={availablePlans.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Configuration
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Trial Modal */}
      <CreateTrialModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchData}
        availablePlans={availablePlans}
      />
    </DashboardLayout>
  );
}
