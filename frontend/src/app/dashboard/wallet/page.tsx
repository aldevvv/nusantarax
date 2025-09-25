'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { walletAPI, handleApiError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TopupModal from '@/components/topup/TopupModal';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WalletData {
  balance: number;
  balanceFormatted: string;
  totalDeposited: number;
  totalDepositedFormatted: string;
  totalSpent: number;
  totalSpentFormatted: string;
}

interface WalletStats {
  balance: number;
  balanceFormatted: string;
  totalDeposited: number;
  totalDepositedFormatted: string;
  totalSpent: number;
  totalSpentFormatted: string;
  totalTransactions: number;
  lastTopUp: {
    amount: number;
    amountFormatted: string;
    createdAt: string;
    description: string;
  } | null;
  recentTransactions: Array<{
    id: string;
    amount: number;
    amountFormatted: string;
    amountDisplay: string;
    description: string;
    status: string;
    createdAt: string;
    type: string;
    paymentMethod: string | null;
    isCredit: boolean;
    isDebit: boolean;
  }>;
}

interface Transaction {
  id: string;
  amount: number;
  amountFormatted: string;
  amountDisplay: string;
  description: string;
  status: string;
  createdAt: string;
  type: string;
  paymentMethod: string | null;
  isCredit: boolean;
  isDebit: boolean;
}

export default function WalletPage() {
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const ITEMS_PER_PAGE = 10;
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchWalletStats = async () => {
    try {
      const response = await walletAPI.getWalletStats();
      
      if (response.success) {
        setWalletStats(response.data);
        setError(null); // Clear any previous errors
      } else {
        toast.error(`Failed to load wallet data: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error loading wallet data:', err);
      const errorMessage = handleApiError(err);
      toast.error(`Error loading wallet data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (page: number = 1) => {
    setTransactionsLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await walletAPI.getWalletTransactions(ITEMS_PER_PAGE, offset);
      if (response.success) {
        setTransactions(response.data.transactions);
        setTotalTransactions(response.data.total);
        setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
        setCurrentPage(page);
      } else {
        toast.error('Failed to load transactions');
      }
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      toast.error('Error loading transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Prepare chart data from recent transactions
  const getChartData = () => {
    if (!walletStats?.recentTransactions) return [];
    
    // Group transactions by date and sum amounts
    const grouped = walletStats.recentTransactions.reduce((acc: any, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      if (!acc[date]) {
        acc[date] = { date, amount: 0 };
      }
      acc[date].amount += transaction.amount;
      
      return acc;
    }, {});
    
    return Object.values(grouped).slice(-7); // Last 7 data points
  };

  const chartData = getChartData();

  useEffect(() => {
    fetchWalletStats();
    fetchTransactions();
  }, []);

  const handleRefresh = async () => {
    const loadingToast = toast.loading('Refreshing wallet data...');
    setLoading(true);
    
    try {
      await Promise.all([fetchWalletStats(), fetchTransactions(currentPage)]);
      toast.dismiss(loadingToast);
      toast.success('Wallet data refreshed successfully');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to refresh wallet data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPaymentMethod = (paymentMethod: string | null, transactionType?: string) => {
    if (!paymentMethod) return 'Unknown';
    
    // Subscription payments
    if (transactionType === 'SUBSCRIPTION') {
      return 'Subscription';
    }
    
    // Manual methods
    if (paymentMethod.includes('manual') || paymentMethod.includes('admin')) {
      return 'Manual';
    }
    
    // Automatic methods
    if (paymentMethod.includes('midtrans') || paymentMethod.includes('stripe') || paymentMethod.includes('automatic')) {
      return 'Automatic';
    }
    
    // Default fallback
    return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
  };

  const getTransactionDisplay = (transaction: any) => {
    // Handle new backend response format
    if (transaction.amountDisplay) {
      return transaction.amountDisplay;
    }
    
    // Fallback for old format - determine by type
    const isCredit = transaction.type === 'WALLET_TOPUP';
    const prefix = isCredit ? '+' : '-';
    return `${prefix}${transaction.amountFormatted}`;
  };

  const isTransactionCredit = (transaction: any) => {
    // Handle new backend response format
    if (transaction.isCredit !== undefined) {
      return transaction.isCredit;
    }
    
    // Fallback logic
    return transaction.type === 'WALLET_TOPUP';
  };

  const getTransactionIcon = (transaction: any) => {
    const isCredit = isTransactionCredit(transaction);
    return isCredit ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionIconColor = (transaction: any) => {
    const isCredit = isTransactionCredit(transaction);
    return isCredit
      ? 'bg-gradient-to-r from-green-500 to-green-600'
      : 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const getTransactionAmountColor = (transaction: any) => {
    const isCredit = isTransactionCredit(transaction);
    return isCredit ? 'text-green-500' : 'text-red-500';
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

  // Remove full page error display - errors will be shown via toast

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Wallet</h1>
              <p className="text-sm sm:text-base text-gray-400">Manage your account balance and transactions</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Button
              onClick={() => setIsTopupModalOpen(true)}
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500/90 hover:to-blue-600/90 shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Top Up
            </Button>
            <Button
              onClick={handleRefresh}
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Current Balance */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 sm:p-6 shadow-lg shadow-[#72c306]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Current Balance</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">
                  {walletStats?.balanceFormatted || 'Rp 0'}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Deposited */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 sm:p-6 shadow-lg shadow-[#72c306]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Deposited</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">
                  {walletStats?.totalDepositedFormatted || 'Rp 0'}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 sm:p-6 shadow-lg shadow-[#72c306]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Total Spent</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">
                  {walletStats?.totalSpentFormatted || 'Rp 0'}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats & Recent Activity - Combined */}
        <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 sm:p-6 shadow-lg shadow-[#72c306]/10">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Account Overview</h2>
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Transactions</span>
              <span className="text-white font-medium">{walletStats?.totalTransactions || 0}</span>
            </div>
            
            {/* Transaction Trend Chart */}
            {chartData.length > 0 && (
              <div className="border-t border-[#72c306]/20 pt-4 sm:pt-6">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <TrendingUp className="h-4 w-4 text-[#72c306]" />
                  <p className="text-gray-400 text-xs sm:text-sm">Transaction Trend</p>
                </div>
                <div className="h-40 sm:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#72c306" strokeOpacity={0.1} />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #72c306',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value: any) => [
                          new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(value),
                          'Amount'
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#72c306"
                        strokeWidth={2}
                        dot={{ fill: '#72c306', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: '#72c306', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* Recent Transactions */}
            {walletStats?.recentTransactions && walletStats.recentTransactions.length > 0 ? (
              <div className="border-t border-[#72c306]/20 pt-4 sm:pt-6">
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">Recent Activity</p>
                <div className="space-y-2 sm:space-y-3">
                  {walletStats.recentTransactions.slice(0, 3).map((transaction) => {
                    const TransactionIcon = getTransactionIcon(transaction);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-2 sm:p-3 bg-black border border-[#72c306]/20 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center ${getTransactionIconColor(transaction)} flex-shrink-0`}>
                            <TransactionIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs sm:text-sm font-medium truncate">{transaction.description}</p>
                            <p className="text-gray-400 text-xs">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`font-medium text-xs sm:text-sm ${getTransactionAmountColor(transaction)}`}>
                            {getTransactionDisplay(transaction)}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="border-t border-[#72c306]/20 pt-4 sm:pt-6">
                <p className="text-gray-400 text-center py-6 sm:py-8 text-sm">No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* Full Transaction History */}
        <div className="bg-black border border-[#72c306]/30 rounded-lg shadow-lg shadow-[#72c306]/10 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-[#72c306]/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Transaction History</h3>
              {transactionsLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-[#72c306]" />
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-[#72c306]/20 min-w-[600px]">
              <thead className="bg-black border-b border-[#72c306]/30">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-black divide-y divide-[#72c306]/20">
                {transactions.map((transaction) => {
                  const TransactionIcon = getTransactionIcon(transaction);
                  return (
                    <tr key={transaction.id} className="hover:bg-[#72c306]/5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTransactionIconColor(transaction)}`}>
                            <TransactionIcon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs sm:text-sm md:text-base truncate">{transaction.description}</p>
                            <div className="sm:hidden flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                transaction.type === 'SUBSCRIPTION'
                                  ? 'bg-purple-500/10 text-purple-500'
                                  : getPaymentMethod(transaction.paymentMethod, transaction.type) === 'Manual'
                                    ? 'bg-orange-500/10 text-orange-500'
                                    : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {getPaymentMethod(transaction.paymentMethod, transaction.type)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)} md:hidden`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.type === 'SUBSCRIPTION'
                            ? 'bg-purple-500/10 text-purple-500'
                            : getPaymentMethod(transaction.paymentMethod, transaction.type) === 'Manual'
                              ? 'bg-orange-500/10 text-orange-500'
                              : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {getPaymentMethod(transaction.paymentMethod, transaction.type)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`font-medium text-xs sm:text-sm md:text-base ${getTransactionAmountColor(transaction)}`}>
                          {getTransactionDisplay(transaction)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-400 text-xs sm:text-sm">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {transactions.length === 0 && !transactionsLoading && (
              <div className="text-center py-6 sm:py-8">
                <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-400 text-sm">No transactions found</p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Your transaction history will appear here</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-[#72c306]/20">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalTransactions)} of {totalTransactions} transactions
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => fetchTransactions(currentPage - 1)}
                  disabled={currentPage === 1 || transactionsLoading}
                  className="bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-2 text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => fetchTransactions(currentPage + 1)}
                  disabled={currentPage === totalPages || transactionsLoading}
                  className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Topup Modal */}
        <TopupModal
          isOpen={isTopupModalOpen}
          onClose={() => setIsTopupModalOpen(false)}
        />
      </div>
    </div>
    </DashboardLayout>
  );
}
