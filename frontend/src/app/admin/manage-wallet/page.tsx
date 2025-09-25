'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet,
  Search,
  Plus,
  Minus,
  Eye,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminWalletAPI, handleApiError } from '@/lib/api';
import { toast } from 'sonner';

interface WalletUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface WalletData {
  id: string;
  userId: string;
  balance: number;
  balanceFormatted: string;
  totalDeposited: number;
  totalDepositedFormatted: string;
  totalSpent: number;
  totalSpentFormatted: string;
  createdAt: string;
  updatedAt: string;
  user: WalletUser;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ManageFundsModalProps {
  wallet: WalletData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action: 'add' | 'deduct';
}

const ManageFundsModal: React.FC<ManageFundsModalProps> = ({ 
  wallet, 
  isOpen, 
  onClose, 
  onSuccess, 
  action 
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const numAmount = parseFloat(amount);
      let response;
      
      if (action === 'add') {
        response = await adminWalletAPI.addFunds(
          wallet.userId, 
          numAmount, 
          description || `Funds added by admin`
        );
      } else {
        if (!description.trim()) {
          toast.error('Description is required for deducting funds');
          setLoading(false);
          return;
        }
        response = await adminWalletAPI.deductFunds(
          wallet.userId, 
          numAmount, 
          description
        );
      }

      if (response.success) {
        toast.success(response.message);
        onSuccess();
        onClose();
        setAmount('');
        setDescription('');
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !wallet) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg shadow-[#72c306]/10 p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">
          {action === 'add' ? 'Add Funds' : 'Deduct Funds'} - {wallet.user.fullName}
        </h3>
        
        <div className="mb-4 p-3 bg-black border border-[#72c306]/20 rounded-lg">
          <p className="text-gray-300 text-sm">Current Balance</p>
          <p className="text-xl font-bold text-white">{wallet.balanceFormatted}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Amount (IDR)
            </label>
            <Input
              type="number"
              step="1"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306] placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Description {action === 'deduct' && <span className="text-red-400">*</span>}
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={action === 'add' ? 'Optional description' : 'Required reason for deduction'}
              className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306]"
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
              className={`flex-1 ${
                action === 'add'
                  ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : action === 'add' ? 'Add Funds' : 'Deduct Funds'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ManageWalletPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [manageFundsModal, setManageFundsModal] = useState<{
    isOpen: boolean;
    wallet: WalletData | null;
    action: 'add' | 'deduct';
  }>({
    isOpen: false,
    wallet: null,
    action: 'add',
  });

  const fetchWallets = async (page: number = 1, search?: string) => {
    setLoading(true);
    try {
      const response = await adminWalletAPI.getAllWallets(page, pagination.limit, search);
      
      if (response.success) {
        setWallets(response.data.wallets);
        setPagination(response.data.pagination);
      } else {
        toast.error('Failed to load wallets');
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets(1, searchTerm);
  }, []);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchWallets(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchWallets(newPage, searchTerm);
  };

  const handleRefresh = () => {
    toast.loading('Refreshing wallet data...');
    fetchWallets(pagination.page, searchTerm);
  };

  const openManageFundsModal = (wallet: WalletData, action: 'add' | 'deduct') => {
    setManageFundsModal({
      isOpen: true,
      wallet,
      action,
    });
  };

  const closeManageFundsModal = () => {
    setManageFundsModal({
      isOpen: false,
      wallet: null,
      action: 'add',
    });
  };

  const handleModalSuccess = () => {
    fetchWallets(pagination.page, searchTerm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalBalance = () => {
    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && wallets.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black text-white p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#72c306]" />
                <p className="text-gray-400">Loading wallet data...</p>
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
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Manage Wallets</h1>
                <p className="text-gray-400">Manage user wallet balances and transactions</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Wallets</p>
                  <p className="text-2xl font-bold text-white">{pagination.total}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(getTotalBalance())}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-black border border-[#72c306]/30 rounded-lg p-6 shadow-lg shadow-[#72c306]/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {wallets.filter(w => w.user.lastLoginAt).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg shadow-[#72c306]/10 p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-black border border-[#72c306]/30 text-white focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306] placeholder-gray-400"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Wallets Table */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg shadow-[#72c306]/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#72c306]/20">
              <h3 className="text-lg font-semibold text-white">User Wallets</h3>
              <p className="text-gray-400 text-sm">Manage user wallet balances and view transaction history</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-[#72c306]/20">
                  <thead className="bg-black border-b border-[#72c306]/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Deposited</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-black divide-y divide-[#72c306]/20">
                    {wallets.map((wallet) => (
                      <tr key={wallet.id} className="hover:bg-[#72c306]/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center text-white font-medium">
                              {wallet.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-white">{wallet.user.fullName}</p>
                              <p className="text-sm text-gray-400">{wallet.user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={wallet.user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                  {wallet.user.role}
                                </Badge>
                                {wallet.user.emailVerified ? (
                                  <Badge variant="outline" className="text-green-400 border-green-400">
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-orange-400 border-orange-400">
                                    Unverified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-white">{wallet.balanceFormatted}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-300">{wallet.totalDepositedFormatted}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-gray-300">{wallet.totalSpentFormatted}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                              {wallet.user.lastLoginAt 
                                ? formatDate(wallet.user.lastLoginAt)
                                : 'Never'
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => openManageFundsModal(wallet, 'add')}
                              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openManageFundsModal(wallet, 'deduct')}
                              className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                            >
                              <Minus className="h-4 w-4 mr-1" />
                              Deduct
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#72c306]/20">
                  <p className="text-gray-400 text-sm">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="border-[#72c306]/30 text-gray-300 hover:bg-[#72c306]/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={pageNum === pagination.page
                            ? "bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                            : "border-[#72c306]/30 text-gray-300 hover:bg-[#72c306]/10"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="border-[#72c306]/30 text-gray-300 hover:bg-[#72c306]/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manage Funds Modal */}
      <ManageFundsModal
        wallet={manageFundsModal.wallet}
        isOpen={manageFundsModal.isOpen}
        onClose={closeManageFundsModal}
        onSuccess={handleModalSuccess}
        action={manageFundsModal.action}
      />
    </DashboardLayout>
  );
}
