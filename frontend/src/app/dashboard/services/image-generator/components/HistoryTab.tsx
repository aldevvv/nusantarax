'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  History,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Eye,
  ExternalLink,
  Image as ImageIcon,
  BarChart3,
  Cpu,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { imageGeneratorAPI, handleApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface GenerationRequest {
  id: string;
  requestId: string;
  type: 'TEMPLATE' | 'CUSTOM';
  status: 'PROCESSING' | 'ANALYZING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  originalPrompt: string;
  enhancedPrompt: string;
  includeBusinessInfo: boolean;
  totalImages: number;
  results: any[];
  template?: {
    name: string;
    category: string;
  };
  createdAt: string;
  completedAt?: string;
}

interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const HistoryTab: React.FC = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [pagination, setPagination] = useState<HistoryPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadHistory();
  }, [pagination.page, statusFilter, typeFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        loadHistory();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadHistory = async () => {
    try {
      setLoading(pagination.page === 1);
      setRefreshing(pagination.page > 1);

      const result = await imageGeneratorAPI.getHistory({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: searchQuery || undefined,
      });

      if (result.success) {
        setRequests(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.message || 'Failed to load history');
      }
    } catch (error: any) {
      console.error('Error loading history:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadHistory();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewResult = (requestId: string) => {
    router.push(`/dashboard/services/image-generator/result/${requestId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'COMPLETED': 'bg-green-500/20 text-green-400 border-green-500/30',
      'PROCESSING': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'ANALYZING': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'GENERATING': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'FAILED': 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-400'}>
        {status}
      </Badge>
    );
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

  return (
    <div className="space-y-6">
      {/* Filters - Cleaner Layout */}
      <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search - Full width on mobile */}
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts..."
                  className="pl-10 bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306]"
                />
              </div>
            </div>

            {/* Filters Row - Stack on mobile, inline on larger screens */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Filter */}
              <div className="flex-1 space-y-2">
                <Label className="text-gray-300 text-sm">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-[#72c306]/30">
                    <SelectItem value="all" className="text-white focus:bg-[#72c306]/20">All Statuses</SelectItem>
                    <SelectItem value="COMPLETED" className="text-white focus:bg-[#72c306]/20">Completed</SelectItem>
                    <SelectItem value="PROCESSING" className="text-white focus:bg-[#72c306]/20">Processing</SelectItem>
                    <SelectItem value="FAILED" className="text-white focus:bg-[#72c306]/20">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="flex-1 space-y-2">
                <Label className="text-gray-300 text-sm">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306]">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-[#72c306]/30">
                    <SelectItem value="all" className="text-white focus:bg-[#72c306]/20">All Types</SelectItem>
                    <SelectItem value="TEMPLATE" className="text-white focus:bg-[#72c306]/20">Template</SelectItem>
                    <SelectItem value="CUSTOM" className="text-white focus:bg-[#72c306]/20">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <div className="sm:self-end">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden xs:inline">Refresh</span>
                  <span className="xs:hidden">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2 text-white">
                <History className="h-5 w-5" />
                <span>Generation History</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {pagination.total} total requests
              </CardDescription>
            </div>
            
            {/* Pagination Info - Stack on mobile */}
            <div className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#72c306]" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No generation history found</p>
              <p className="text-sm text-gray-500 mt-1">
                Start generating images to see your history here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-3 sm:p-4 bg-black border border-gray-700 rounded-lg hover:border-[#72c306]/30 transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header Section - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        {/* Badges - Allow wrapping on mobile */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline" className="border-[#72c306]/30 text-[#72c306] text-xs">
                            {request.type}
                          </Badge>
                          {getStatusBadge(request.status)}
                          {request.template && (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                              {request.template.name}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-[#72c306] font-medium text-sm sm:text-base">
                          Request #{request.requestId}
                        </h3>
                      </div>
                      
                      {/* Action Button - Full width on mobile */}
                      <div className="w-full sm:w-auto sm:ml-4">
                        {request.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            onClick={() => handleViewResult(request.requestId)}
                            className="w-full sm:w-auto bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span className="sm:hidden">View Details</span>
                            <span className="hidden sm:inline">View Details</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid - Better mobile responsive */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      <div className="bg-gray-800/50 border border-[#72c306]/20 rounded-lg p-2 sm:p-3 min-h-[60px] sm:h-[70px] flex items-center">
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">Images</p>
                            <p className="text-white font-bold text-sm sm:text-lg">{request.totalImages}</p>
                          </div>
                          <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400 flex-shrink-0 ml-1 sm:ml-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 border border-blue-500/20 rounded-lg p-2 sm:p-3 min-h-[60px] sm:h-[70px] flex items-center">
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">Requests</p>
                            <p className="text-blue-400 font-bold text-sm sm:text-lg">{3 + request.totalImages}</p>
                          </div>
                          <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400 flex-shrink-0 ml-1 sm:ml-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 border border-[#72c306]/20 rounded-lg p-2 sm:p-3 min-h-[60px] sm:h-[70px] flex items-center">
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">Model</p>
                            <p className="text-[#72c306] font-medium text-xs truncate">Gemini 2.5</p>
                          </div>
                          <Cpu className="h-4 w-4 sm:h-6 sm:w-6 text-[#72c306] flex-shrink-0 ml-1 sm:ml-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 border border-purple-500/20 rounded-lg p-2 sm:p-3 min-h-[60px] sm:h-[70px] flex items-center">
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">Duration</p>
                            <p className="text-purple-400 font-medium text-xs">
                              {request.completedAt && request.createdAt
                                ? `${Math.round((new Date(request.completedAt).getTime() - new Date(request.createdAt).getTime()) / 1000)}s`
                                : 'N/A'}
                            </p>
                          </div>
                          <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400 flex-shrink-0 ml-1 sm:ml-2" />
                        </div>
                      </div>
                    </div>

                    {/* Timestamps - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 pt-3 border-t border-gray-800 space-y-1 sm:space-y-0">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {formatDate(request.createdAt)}</span>
                      </div>
                      
                      {request.completedAt && (
                        <span className="pl-4 sm:pl-0">
                          Completed: {formatDate(request.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination - Mobile Optimized */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-800 space-y-3 sm:space-y-0">
                  <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                    <span className="block sm:inline">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    <span className="block sm:inline"> of {pagination.total} results</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      size="sm"
                      variant="outline"
                      className="border-[#72c306]/30 text-gray-300 hover:text-white hover:border-[#72c306] disabled:opacity-50 px-2 sm:px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Prev</span>
                    </Button>
                    
                    <span className="text-sm text-gray-400 px-2 sm:px-3 whitespace-nowrap">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      size="sm"
                      variant="outline"
                      className="border-[#72c306]/30 text-gray-300 hover:text-white hover:border-[#72c306] disabled:opacity-50 px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

};

export default HistoryTab;