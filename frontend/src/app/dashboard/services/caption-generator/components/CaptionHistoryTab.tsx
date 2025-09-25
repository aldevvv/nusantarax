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
  ExternalLink,
  MessageSquare,
  BarChart3,
  Cpu,
  Clock,
  Facebook,
  Instagram,
  Music,
  Smile,
  Hash,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { captionGeneratorAPI, handleApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CaptionRequest {
  id: string;
  requestId: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK';
  status: 'PROCESSING' | 'ANALYZING_IMAGE' | 'GENERATING_CAPTIONS' | 'ANALYZING_CAPTIONS' | 'COMPLETED' | 'FAILED';
  captionIdea?: string;
  targetAudience?: string;
  tone: string;
  captionLength: string;
  useEmojis: boolean;
  useHashtags: boolean;
  totalCaptions: number;
  results: any[];
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

const CaptionHistoryTab: React.FC = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<CaptionRequest[]>([]);
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
  const [platformFilter, setPlatformFilter] = useState('');

  useEffect(() => {
    loadHistory();
  }, [pagination.page, statusFilter, platformFilter]);

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

      const result = await captionGeneratorAPI.getHistory({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        platform: platformFilter || undefined,
        search: searchQuery || undefined,
      });

      if (result.success) {
        setRequests(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.message || 'Failed to load caption history');
      }
    } catch (error: any) {
      console.error('Error loading caption history:', error);
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
    router.push(`/dashboard/services/caption-generator/result/${requestId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'COMPLETED': 'bg-green-500/20 text-green-400 border-green-500/30',
      'PROCESSING': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'ANALYZING_IMAGE': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'GENERATING_CAPTIONS': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'ANALYZING_CAPTIONS': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'FAILED': 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-400'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK':
        return <Facebook className="h-4 w-4 text-blue-500" />;
      case 'INSTAGRAM':
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'TIKTOK':
        return <Music className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
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

  return (
    <div className="space-y-6 w-full">
      {/* Filters */}
      <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10 w-full">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-white text-lg sm:text-xl">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search captions, audience, ideas..."
                  className="pl-10 bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] h-12 sm:h-10"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-4">
              {/* Status Filter */}
              <div className="w-full space-y-2">
                <Label className="text-gray-300 text-sm">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-black border-[#72c306]/30 text-white focus:border-[#72c306] h-12 sm:h-10">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-[#72c306]/30 w-full">
                    <SelectItem value="all" className="text-white focus:bg-[#72c306]/20">All Statuses</SelectItem>
                    <SelectItem value="COMPLETED" className="text-white focus:bg-[#72c306]/20">Completed</SelectItem>
                    <SelectItem value="PROCESSING" className="text-white focus:bg-[#72c306]/20">Processing</SelectItem>
                    <SelectItem value="FAILED" className="text-white focus:bg-[#72c306]/20">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Platform Filter */}
              <div className="w-full space-y-2">
                <Label className="text-gray-300 text-sm">Platform</Label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-full bg-black border-[#72c306]/30 text-white focus:border-[#72c306] h-12 sm:h-10">
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-[#72c306]/30 w-full">
                    <SelectItem value="all" className="text-white focus:bg-[#72c306]/20">All Platforms</SelectItem>
                    <SelectItem value="FACEBOOK" className="text-white focus:bg-[#72c306]/20">Facebook</SelectItem>
                    <SelectItem value="INSTAGRAM" className="text-white focus:bg-[#72c306]/20">Instagram</SelectItem>
                    <SelectItem value="TIKTOK" className="text-white focus:bg-[#72c306]/20">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <div className="w-full">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white h-12 sm:h-10"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10 w-full">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2 text-white text-lg sm:text-xl">
                <History className="h-5 w-5" />
                <span>Caption History</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {pagination.total} total caption requests
              </CardDescription>
            </div>
            
            <div className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#72c306]" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No caption history found</p>
              <p className="text-sm text-gray-500 mt-1">
                Start generating captions to see your history here
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
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline" className="border-[#72c306]/30 text-[#72c306] text-xs flex items-center space-x-1">
                            {getPlatformIcon(request.platform)}
                            <span>{request.platform}</span>
                          </Badge>
                          {getStatusBadge(request.status)}
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                            {request.captionLength}
                          </Badge>
                          <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                            {request.tone}
                          </Badge>
                        </div>
                        <h3 className="text-[#72c306] font-medium text-sm sm:text-base">
                          Request #{request.requestId}
                        </h3>
                        {request.captionIdea && (
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                            "{request.captionIdea}"
                          </p>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <div className="w-full sm:w-auto sm:ml-4">
                        {request.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            onClick={() => handleViewResult(request.requestId)}
                            className="w-full sm:w-auto bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Captions
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3">
                      <div className="bg-gray-800/50 border border-[#72c306]/20 rounded-lg p-3 min-h-[70px] flex items-center">
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">Captions</p>
                            <p className="text-white font-bold text-lg">{request.totalCaptions}</p>
                          </div>
                          <MessageSquare className="h-5 w-5 text-[#72c306] flex-shrink-0 ml-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 border border-blue-500/20 rounded-lg p-3 min-h-[70px] flex items-center">
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">AI Requests</p>
                            <p className="text-blue-400 font-bold text-lg">2</p>
                          </div>
                          <BarChart3 className="h-5 w-5 text-blue-400 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 border border-[#72c306]/20 rounded-lg p-3 min-h-[70px] flex items-center">
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">AI Model</p>
                            <p className="text-[#72c306] font-medium text-xs truncate">Gemini 2.5</p>
                          </div>
                          <Cpu className="h-5 w-5 text-[#72c306] flex-shrink-0 ml-2" />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 border border-purple-500/20 rounded-lg p-3 min-h-[70px] flex items-center">
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-400 text-xs">Duration</p>
                            <p className="text-purple-400 font-medium text-xs">
                              {request.completedAt && request.createdAt
                                ? `${Math.round((new Date(request.completedAt).getTime() - new Date(request.createdAt).getTime()) / 1000)}s`
                                : 'N/A'}
                            </p>
                          </div>
                          <Clock className="h-5 w-5 text-purple-400 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    </div>

                    {/* User Preferences Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {request.useEmojis && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                          <span className="mr-1">😊</span>
                          Emojis
                        </Badge>
                      )}
                      {request.useHashtags && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                          #️⃣ Hashtags
                        </Badge>
                      )}
                      {request.targetAudience && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          🎯 {request.targetAudience}
                        </Badge>
                      )}
                    </div>

                    {/* Timestamps */}
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-800 space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-400 text-center sm:text-left">
                    <span className="block sm:inline">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    <span className="block sm:inline"> of {pagination.total} results</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      size="sm"
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white disabled:opacity-50 disabled:from-gray-600 disabled:to-gray-600 px-4 py-2 h-10 border-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Prev</span>
                    </Button>
                    
                    <span className="text-sm text-gray-400 px-3 py-2 min-w-[80px] text-center">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      size="sm"
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white disabled:opacity-50 disabled:from-gray-600 disabled:to-gray-600 px-4 py-2 h-10 border-0"
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

export default CaptionHistoryTab;