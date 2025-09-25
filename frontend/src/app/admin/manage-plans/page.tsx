'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Edit3,
  DollarSign,
  Users
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { adminPlansAPI } from '@/lib/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyRequests: number;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    subscriptions: number;
  };
}

const ManagePlansPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<SubscriptionPlan>>({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminPlansAPI.getAllPlans();
      if (response.success) {
        setPlans(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch plans');
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Error loading plans');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setEditValues({
      monthlyRequests: plan.monthlyRequests,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      description: plan.description
    });
  };

  const handleSave = async (planId: string) => {
    try {
      setSaving(planId);
      const response = await adminPlansAPI.updatePlan(planId, editValues);

      if (response.success) {
        toast.success('Plan updated successfully');
        setEditingPlan(null);
        setEditValues({});
        fetchPlans();
      } else {
        toast.error(response.message || 'Failed to update plan');
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
      toast.error('Error updating plan');
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditValues({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#72c306]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent mb-2">
            Manage Subscription Plans
          </h1>
          <p className="text-gray-400">
            Update plan limits and pricing without database reset
          </p>
        </motion.div>

        <div className="grid gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={fadeInUp}
              className="bg-black border border-[#72c306]/30 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 border border-[#72c306]/30 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-[#72c306]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.displayName}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {plan.name}
                      </Badge>
                      {plan._count && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {plan._count.subscriptions} users
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {editingPlan === plan.id ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(plan.id)}
                      disabled={saving === plan.id}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] text-white"
                    >
                      {saving === plan.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(plan)}
                    className="text-gray-400 hover:text-[#72c306]"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Monthly Requests */}
                <div>
                  <Label className="text-gray-400 text-sm">Monthly Requests</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editValues.monthlyRequests || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, monthlyRequests: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter limit (-1 for unlimited)"
                      className="mt-1 bg-gray-900/50 border-[#72c306]/30 text-white"
                    />
                  ) : (
                    <p className="text-white font-medium mt-1">
                      {plan.monthlyRequests === -1 ? 'Unlimited' : plan.monthlyRequests.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Monthly Price */}
                <div>
                  <Label className="text-gray-400 text-sm">Monthly Price</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editValues.monthlyPrice || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, monthlyPrice: parseInt(e.target.value) || 0 }))}
                      placeholder="Price in IDR"
                      className="mt-1 bg-gray-900/50 border-[#72c306]/30 text-white"
                    />
                  ) : (
                    <p className="text-white font-medium mt-1">
                      {formatCurrency(plan.monthlyPrice)}
                    </p>
                  )}
                </div>

                {/* Yearly Price */}
                <div>
                  <Label className="text-gray-400 text-sm">Yearly Price</Label>
                  {editingPlan === plan.id ? (
                    <Input
                      type="number"
                      value={editValues.yearlyPrice || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, yearlyPrice: parseInt(e.target.value) || 0 }))}
                      placeholder="Price in IDR"
                      className="mt-1 bg-gray-900/50 border-[#72c306]/30 text-white"
                    />
                  ) : (
                    <p className="text-white font-medium mt-1">
                      {formatCurrency(plan.yearlyPrice)}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <Label className="text-gray-400 text-sm">Status</Label>
                  <div className="mt-1">
                    {plan.isActive ? (
                      <Badge className="bg-[#72c306]/20 text-[#72c306] border-[#72c306]/50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {editingPlan === plan.id ? (
                <div className="mt-4">
                  <Label className="text-gray-400 text-sm">Description</Label>
                  <Input
                    value={editValues.description || ''}
                    onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Plan description"
                    className="mt-1 bg-gray-900/50 border-[#72c306]/30 text-white"
                  />
                </div>
              ) : (
                <p className="text-gray-300 text-sm mt-4">{plan.description}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <motion.div variants={fadeInUp} className="mt-8">
          <Card className="bg-[#72c306]/10 border-[#72c306]/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-[#72c306] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium mb-1">Important Notes</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Changes apply immediately to new subscriptions</li>
                    <li>• Existing users keep their current limits until renewal</li>
                    <li>• Set monthlyRequests to -1 for unlimited usage</li>
                    <li>• Price changes don't affect active subscriptions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ManagePlansPage;