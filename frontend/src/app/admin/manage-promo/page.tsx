'use client';

import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Percent,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Copy,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { promoAPI, handleApiError } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUsage: number;
  currentUsage: number;
  maxUsagePerUser: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  minAmount: number;
  maxDiscount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PromoFormData {
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUsage: number;
  maxUsagePerUser: number;
  maxTotalUsers: number;
  applicableFor: 'TOPUP' | 'PLAN' | 'BOTH';
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  minAmount: number;
  maxDiscount: number;
}

const initialFormData: PromoFormData = {
  code: '',
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  maxUsage: 0,
  maxUsagePerUser: 1,
  maxTotalUsers: 0,
  applicableFor: 'TOPUP',
  isActive: true,
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  minAmount: 0,
  maxDiscount: 0,
};

export default function ManagePromoPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'basic' | 'advanced'>('basic');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const response = await promoAPI.getAllPromoCodes(1, 50, false);
      
      if (response.success) {
        setPromoCodes(response.data.promoCodes);
      } else {
        toast.error('Failed to fetch promo codes');
      }
    } catch (error: any) {
      console.error('Failed to fetch promo codes:', error);
      const errorMessage = handleApiError(error);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreateNew = () => {
    setEditingPromo(null);
    setFormData(initialFormData);
    setCurrentStep('basic');
    setIsCreateModalOpen(true);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      maxUsage: promo.maxUsage === -1 ? 0 : promo.maxUsage,
      maxUsagePerUser: promo.maxUsagePerUser,
      maxTotalUsers: ((promo as any).maxTotalUsers === -1 || !(promo as any).maxTotalUsers) ? 0 : (promo as any).maxTotalUsers,
      applicableFor: (promo as any).applicableFor || 'TOPUP',
      isActive: promo.isActive,
      validFrom: promo.validFrom,
      validUntil: promo.validUntil,
      minAmount: promo.minAmount,
      maxDiscount: promo.maxDiscount || 0,
    });
    setCurrentStep('basic');
    setIsCreateModalOpen(true);
  };

  const handleNextStep = () => {
    if (!formData.code.trim() || !formData.name.trim() || formData.discountValue <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCurrentStep('advanced');
  };

  const handleBackToBasic = () => {
    setCurrentStep('basic');
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setCurrentStep('basic');
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Code and name are required');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingPromo ? 'Updating promo code...' : 'Creating promo code...'
    );

    try {
      // Convert 0 to -1 for unlimited usage before sending to backend
      const submissionData = {
        ...formData,
        maxUsage: formData.maxUsage === 0 ? -1 : formData.maxUsage,
        maxTotalUsers: formData.maxTotalUsers === 0 ? -1 : formData.maxTotalUsers,
      };

      let response;
      if (editingPromo) {
        response = await promoAPI.updatePromoCode(editingPromo.id, submissionData);
      } else {
        response = await promoAPI.createPromoCode(submissionData);
      }

      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success(
          editingPromo ? 'Promo code updated successfully' : 'Promo code created successfully'
        );
        setIsCreateModalOpen(false);
        fetchPromoCodes();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage = handleApiError(error);
      toast.error(`Failed to save promo code: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) {
      return;
    }

    const loadingToast = toast.loading('Deleting promo code...');
    try {
      const response = await promoAPI.deletePromoCode(id);
      
      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success('Promo code deleted successfully');
        fetchPromoCodes();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage = handleApiError(error);
      toast.error(`Failed to delete promo code: ${errorMessage}`);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const loadingToast = toast.loading(
      `${currentStatus ? 'Deactivating' : 'Activating'} promo code...`
    );
    
    try {
      const response = await promoAPI.updatePromoCode(id, { isActive: !currentStatus });
      
      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success(
          `Promo code ${currentStatus ? 'deactivated' : 'activated'} successfully`
        );
        fetchPromoCodes();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage = handleApiError(error);
      toast.error(`Failed to update promo code status: ${errorMessage}`);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}" to clipboard`);
  };

  const getDiscountDisplay = (promo: PromoCode) => {
    if (promo.discountType === 'PERCENTAGE') {
      return `${promo.discountValue}%${promo.maxDiscount ? ` (max ${formatCurrency(promo.maxDiscount)})` : ''}`;
    } else {
      return formatCurrency(promo.discountValue);
    }
  };

  const getUsageDisplay = (promo: PromoCode) => {
    if (promo.maxUsage === -1) {
      return `${promo.currentUsage} / Unlimited`;
    }
    return `${promo.currentUsage} / ${promo.maxUsage}`;
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                  Manage Promo Codes
                </h1>
                <p className="text-gray-400">Create and manage discount codes for topup</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500/90 hover:to-blue-600/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Promo
              </Button>
              <Button
                onClick={fetchPromoCodes}
                disabled={loading}
                className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-black border border-[#72c306]/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-[#72c306]/20 rounded-lg flex items-center justify-center">
                  <Tag className="h-5 w-5 text-[#72c306]" />
                </div>
                <div>
                  <p className="text-[#72c306] font-medium">Total Codes</p>
                  <p className="text-white text-xl font-bold">{promoCodes.length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-black border border-green-500/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-green-500 font-medium">Active</p>
                  <p className="text-white text-xl font-bold">
                    {promoCodes.filter(p => p.isActive && !isExpired(p.validUntil)).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-black border border-yellow-500/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-yellow-500 font-medium">Expired</p>
                  <p className="text-white text-xl font-bold">
                    {promoCodes.filter(p => isExpired(p.validUntil)).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-black border border-red-500/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <EyeOff className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-red-500 font-medium">Inactive</p>
                  <p className="text-white text-xl font-bold">
                    {promoCodes.filter(p => !p.isActive).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Promo Codes Table */}
          <Card className="bg-black border border-[#72c306]/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#72c306]/20">
              <h3 className="text-lg font-semibold text-white">Promo Codes</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-[#72c306]/20">
                <thead className="bg-black border-b border-[#72c306]/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valid Until</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-[#72c306]/20">
                  {promoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-[#72c306]/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Tag className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-white font-bold">{promo.code}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyCode(promo.code)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-gray-400 text-sm">{promo.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {promo.discountType === 'PERCENTAGE' ? (
                            <Percent className="h-4 w-4 text-[#72c306]" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-[#72c306]" />
                          )}
                          <span className="text-[#72c306] font-medium">
                            {getDiscountDisplay(promo)}
                          </span>
                        </div>
                        {promo.minAmount > 0 && (
                          <p className="text-gray-400 text-xs">Min: {formatCurrency(promo.minAmount)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">
                          <span className="font-medium">{getUsageDisplay(promo)}</span>
                          {promo.maxUsage > 0 && (
                            <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                              <div 
                                className="bg-[#72c306] h-2 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, (promo.currentUsage / promo.maxUsage) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <Badge 
                            className={
                              promo.isActive && !isExpired(promo.validUntil)
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                            }
                          >
                            {promo.isActive && !isExpired(promo.validUntil) ? 'Active' : 'Inactive'}
                          </Badge>
                          {isExpired(promo.validUntil) && (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(promo.validUntil)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(promo)}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                            className={
                              promo.isActive
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }
                          >
                            {promo.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleDelete(promo.id, promo.code)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {promoCodes.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No promo codes found</p>
                  <p className="text-gray-500 text-sm mt-1">Create your first promo code to get started</p>
                </div>
              )}
            </div>
          </Card>

          {/* Create/Edit Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className={`bg-black border border-[#72c306]/30 text-white ${currentStep === 'basic' ? 'max-w-lg' : 'max-w-2xl max-h-[90vh] overflow-y-auto'}`}>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-[#72c306]" />
                  <span>{editingPromo ? 'Edit' : 'Create'} Promo Code - {currentStep === 'basic' ? 'Basic Info' : 'Advanced Settings'}</span>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 'basic' ? (
                  <>
                    {/* Step 1: Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Code *</Label>
                        <Input
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="WELCOME10"
                          className="bg-black border border-[#72c306]/30 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Welcome Discount"
                          className="bg-black border border-[#72c306]/30 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Description</Label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description of the promo code..."
                        rows={2}
                        className="w-full p-3 bg-black border border-[#72c306]/30 rounded-lg text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Discount Type</Label>
                        <Select
                          value={formData.discountType}
                          onValueChange={(value: 'PERCENTAGE' | 'FIXED') =>
                            setFormData(prev => ({ ...prev, discountType: value }))
                          }
                        >
                          <SelectTrigger className="bg-black border-[#72c306]/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-[#72c306]/30">
                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                            <SelectItem value="FIXED">Fixed Amount (IDR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">
                          Discount Value ({formData.discountType === 'PERCENTAGE' ? '%' : 'IDR'}) *
                        </Label>
                        <Input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseInt(e.target.value) || 0 }))}
                          placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '10000'}
                          className="bg-black border border-[#72c306]/30 text-white"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>Next - Advanced Settings</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Step 2: Advanced Settings */}
                    <div className="bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">Basic Info Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Code:</p>
                          <p className="text-white font-bold">{formData.code}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Discount:</p>
                          <p className="text-[#72c306] font-bold">
                            {formData.discountType === 'PERCENTAGE' ? `${formData.discountValue}%` : formatCurrency(formData.discountValue)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Valid From</Label>
                        <Input
                          type="date"
                          value={formData.validFrom}
                          onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                          className="bg-black border border-[#72c306]/30 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Valid Until</Label>
                        <Input
                          type="date"
                          value={formData.validUntil}
                          onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                          className="bg-black border border-[#72c306]/30 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Min Amount (IDR)</Label>
                        <Input
                          type="number"
                          value={formData.minAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, minAmount: parseInt(e.target.value) || 0 }))}
                          placeholder="5000"
                          className="bg-black border border-[#72c306]/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Total Usage</Label>
                        <Input
                          type="number"
                          value={formData.maxUsage === 0 ? '' : formData.maxUsage}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxUsage: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 }))}
                          placeholder="Leave empty for unlimited"
                          className="bg-black border border-[#72c306]/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Max Users</Label>
                        <Input
                          type="number"
                          value={formData.maxTotalUsers === 0 ? '' : formData.maxTotalUsers}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxTotalUsers: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 }))}
                          placeholder="Leave empty for unlimited"
                          className="bg-black border border-[#72c306]/30 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Usage Per User</Label>
                        <Select
                          value={formData.maxUsagePerUser.toString()}
                          onValueChange={(value) =>
                            setFormData(prev => ({ ...prev, maxUsagePerUser: parseInt(value) }))
                          }
                        >
                          <SelectTrigger className="bg-black border-[#72c306]/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-[#72c306]/30">
                            <SelectItem value="1">Once per user</SelectItem>
                            <SelectItem value="3">3 times per user</SelectItem>
                            <SelectItem value="5">5 times per user</SelectItem>
                            <SelectItem value="-1">Unlimited per user</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Applicable For</Label>
                        <Select
                          value={formData.applicableFor}
                          onValueChange={(value: 'TOPUP' | 'PLAN' | 'BOTH') =>
                            setFormData(prev => ({ ...prev, applicableFor: value }))
                          }
                        >
                          <SelectTrigger className="bg-black border-[#72c306]/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-[#72c306]/30">
                            <SelectItem value="TOPUP">Topup Only</SelectItem>
                            <SelectItem value="PLAN">Plan Checkout Only</SelectItem>
                            <SelectItem value="BOTH">Both Topup & Plan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.discountType === 'PERCENTAGE' && (
                      <div className="space-y-2">
                        <Label className="text-white">Max Discount Amount (IDR) - Optional</Label>
                        <Input
                          type="number"
                          value={formData.maxDiscount}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: parseInt(e.target.value) || 0 }))}
                          placeholder="50000"
                          className="bg-black border border-[#72c306]/30 text-white"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        className="data-[state=checked]:bg-[#72c306]"
                      />
                      <Label className="text-white">Active immediately after creation</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        onClick={handleBackToBasic}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500/90 hover:to-blue-600/90 text-white"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-2 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{editingPromo ? 'Updating...' : 'Creating...'}</span>
                          </div>
                        ) : (
                          <>
                            {editingPromo ? 'Update' : 'Create'} Promo Code
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}