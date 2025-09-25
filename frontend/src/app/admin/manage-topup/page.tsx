'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Check, 
  X, 
  Eye,
  Filter,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Wallet,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { topupAPI, handleApiError } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface TopupRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  amount: number;
  amountFormatted: string;
  paymentMethod: string;
  proofImageUrl?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  UNDER_REVIEW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  EXPIRED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
};

export default function ManageTopupPage() {
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<TopupRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTopupRequests = async () => {
    setLoading(true);
    try {
      const response = await topupAPI.getAllRequests(
        currentPage,
        20,
        statusFilter === 'all' ? undefined : statusFilter
      );

      if (response.success) {
        setRequests(response.data.requests);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      } else {
        toast.error('Failed to fetch topup requests');
      }
    } catch (error: any) {
      console.error('Failed to fetch topup requests:', error);
      const errorMessage = handleApiError(error);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopupRequests();
  }, [currentPage, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReviewRequest = (request: TopupRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;

    if (reviewAction === 'reject' && !reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      reviewAction === 'approve' ? 'Approving request...' : 'Rejecting request...'
    );

    try {
      let response;
      if (reviewAction === 'approve') {
        response = await topupAPI.approveRequest(selectedRequest.id, reviewNotes);
      } else {
        response = await topupAPI.rejectRequest(selectedRequest.id, reviewNotes);
      }

      if (response.success) {
        toast.dismiss(loadingToast);
        toast.success(
          `Request ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`
        );
        setIsReviewModalOpen(false);
        fetchTopupRequests(); // Refresh data
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      const errorMessage = handleApiError(error);
      toast.error(`Failed to ${reviewAction} request: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchTopupRequests();
  };

  const handleViewProof = (proofUrl: string) => {
    window.open(proofUrl, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                  Manage Topup Requests
                </h1>
                <p className="text-gray-400">Review and approve user topup requests</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-black border border-yellow-500/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-yellow-500 font-medium">Pending Review</p>
                  <p className="text-white text-xl font-bold">
                    {requests.filter(r => r.status === 'PENDING' || r.status === 'UNDER_REVIEW').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-black border border-green-500/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-green-500 font-medium">Approved</p>
                  <p className="text-white text-xl font-bold">
                    {requests.filter(r => r.status === 'APPROVED').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-black border border-red-500/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-red-500 font-medium">Rejected</p>
                  <p className="text-white text-xl font-bold">
                    {requests.filter(r => r.status === 'REJECTED').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-black border border-[#72c306]/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-[#72c306]/20 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-[#72c306]" />
                </div>
                <div>
                  <p className="text-[#72c306] font-medium">Total Requests</p>
                  <p className="text-white text-xl font-bold">{total}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-black border border-[#72c306]/30 p-4">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-[#72c306]" />
              <Label className="text-white">Filter by Status:</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-48 bg-black border-[#72c306]/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-[#72c306]/30">
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Requests Table */}
          <Card className="bg-black border border-[#72c306]/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#72c306]/20">
              <h3 className="text-lg font-semibold text-white">Topup Requests</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-[#72c306]/20">
                <thead className="bg-black border-b border-[#72c306]/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-[#72c306]/20">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-[#72c306]/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{request.user.fullName}</p>
                            <p className="text-gray-400 text-sm">{request.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[#72c306] font-bold">{request.amountFormatted}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white">{request.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={STATUS_COLORS[request.status]}>
                          {STATUS_LABELS[request.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {request.proofImageUrl && (
                            <Button
                              size="sm"
                              onClick={() => handleViewProof(request.proofImageUrl!)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Image className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleReviewRequest(request, 'approve')}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReviewRequest(request, 'reject')}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {requests.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No topup requests found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {statusFilter === 'all' ? 'No requests yet' : `No ${statusFilter.toLowerCase()} requests`}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-[#72c306]/20 flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Showing {requests.length} of {total} requests
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-[#72c306]/30 text-gray-300 hover:border-[#72c306] hover:text-white"
                  >
                    Previous
                  </Button>
                  <span className="text-white">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-[#72c306]/30 text-gray-300 hover:border-[#72c306] hover:text-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Review Modal */}
          <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
            <DialogContent className="bg-black border border-[#72c306]/30 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {reviewAction === 'approve' ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                  <span>
                    {reviewAction === 'approve' ? 'Approve' : 'Reject'} Topup Request
                  </span>
                </DialogTitle>
              </DialogHeader>

              {selectedRequest && (
                <div className="space-y-4">
                  <div className="bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">User</p>
                        <p className="text-white font-medium">{selectedRequest.user.fullName}</p>
                        <p className="text-gray-300">{selectedRequest.user.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Amount</p>
                        <p className="text-[#72c306] font-bold text-lg">{selectedRequest.amountFormatted}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payment Method</p>
                        <p className="text-white">{selectedRequest.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Request Date</p>
                        <p className="text-white">{formatDate(selectedRequest.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white">
                      {reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
                    </Label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder={
                        reviewAction === 'approve'
                          ? 'Add any notes for this approval...'
                          : 'Please provide a reason for rejection...'
                      }
                      rows={3}
                      className="w-full p-3 bg-black border border-[#72c306]/30 rounded-lg text-white placeholder:text-gray-500 focus:border-[#72c306] focus:ring-[#72c306]/20"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <Button
                      onClick={() => setIsReviewModalOpen(false)}
                      disabled={isSubmitting}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || (reviewAction === 'reject' && !reviewNotes.trim())}
                      className={`
                        ${reviewAction === 'approve'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-600'
                        } text-white
                      `}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          {reviewAction === 'approve' ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Approve Request
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Reject Request
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}