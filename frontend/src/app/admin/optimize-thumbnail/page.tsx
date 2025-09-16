'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Loader2, 
  Download, 
  Eye, 
  X,
  Settings,
  Palette,
  Crop,
  Sun,
  Type,
  FileImage,
  Trash2
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { optimizeThumbnailAPI, Template, OptimizeResult, OptimizationSettings, OptimizeUsageStats } from '@/lib/optimize-thumbnail-api';
import { handleApiError } from '@/lib/api';

interface UploadedFile {
  file: File;
  preview: string;
  base64: string;
}

const OptimizeThumbnailPage = () => {
  // State for file upload
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // State for template selection
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // State for optimization settings
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    smartCrop: 'auto',
    backgroundRemoval: 'none',
    lightingAdjustment: 'auto',
    colorCorrection: 'auto',
    aspectRatio: 'original',
    qualityLevel: 'high'
  });

  // State for export formats
  const [exportFormats, setExportFormats] = useState<string[]>(['JPG', 'PNG']);

  // State for processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // State for results
  const [results, setResults] = useState<OptimizeResult[]>([]);
  const [showBeforeAfter, setShowBeforeAfter] = useState(true);

  // State for statistics
  const [stats, setStats] = useState<OptimizeUsageStats>({
    total: 0,
    success: 0,
    error: 0,
    processing: 0,
    todayUsage: 0,
    avgProcessingTime: 0,
    successRate: 0
  });

  // State for advanced settings
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch templates and statistics
      const [templatesRes, statsRes] = await Promise.all([
        optimizeThumbnailAPI.getAvailableTemplates(),
        optimizeThumbnailAPI.getUsageStatistics()
      ]);

      if (templatesRes.success && templatesRes.data) {
        setTemplates(templatesRes.data);
        setSelectedTemplate(templatesRes.data[0] || null);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
  };

  // File upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      await processUploadedFile(imageFile);
    } else {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  }, []);

  const processUploadedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      const preview = URL.createObjectURL(file);
      const base64 = await optimizeThumbnailAPI.fileToBase64(file);
      
      setUploadedFile({
        file,
        preview,
        base64
      });
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to process the uploaded image');
    }
  };

  const removeUploadedFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setResults([]);
  };

  // Template selection handler
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setOptimizationSettings({
      ...optimizationSettings,
      ...template.optimizations
    });
    // Update export formats to supported ones
    const supportedFormats = exportFormats.filter(format => 
      template.supportedFormats.includes(format)
    );
    if (supportedFormats.length === 0) {
      setExportFormats([template.supportedFormats[0]]);
    } else {
      setExportFormats(supportedFormats);
    }
  };

  // Export format handlers
  const toggleExportFormat = (format: string) => {
    if (!selectedTemplate?.supportedFormats.includes(format)) return;
    
    setExportFormats(prev => {
      if (prev.includes(format)) {
        return prev.length > 1 ? prev.filter(f => f !== format) : prev;
      } else {
        return [...prev, format];
      }
    });
  };

  // Process optimization
  const handleOptimize = async () => {
    if (!uploadedFile || !selectedTemplate) {
      toast.error('Please upload an image and select a template');
      return;
    }

    if (exportFormats.length === 0) {
      toast.error('Please select at least one export format');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setResults([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 500);

      const response = await optimizeThumbnailAPI.optimizeThumbnail({
        fileName: uploadedFile.file.name,
        mimeType: uploadedFile.file.type,
        imageData: uploadedFile.base64,
        templateId: selectedTemplate.id,
        exportFormats,
        optimizations: optimizationSettings,
        customPrompt: customPrompt.trim() || undefined
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (response.success && response.data) {
        setResults(response.data.results);
        toast.success(`Optimization completed! Generated ${response.data.results.length} optimized images.`);
        
        // Show compression stats
        const compressionPercentage = optimizeThumbnailAPI.calculateCompressionPercentage(
          response.data.originalSize,
          response.data.totalOptimizedSize
        );
        if (compressionPercentage > 0) {
          toast.info(`File size reduced by ${compressionPercentage}%`);
        }
      } else {
        toast.error(response.message || 'Optimization failed');
      }

      // Refresh statistics
      await fetchInitialData();
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
  const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                Optimize Thumbnail
              </h1>
              <p className="text-gray-400">Advanced image optimization powered by AI</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.success}</p>
                <p className="text-sm text-gray-400">Successful Optimizations</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-3">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.error}</p>
                <p className="text-sm text-gray-400">Failed Requests</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{(stats.avgProcessingTime / 1000).toFixed(1)}s</p>
                <p className="text-sm text-gray-400">Avg Processing Time</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">{stats.todayUsage}</p>
                <p className="text-sm text-gray-400">Today's Usage</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* File Upload */}
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Upload className="h-5 w-5 mr-2 text-[#72c306]" />
              Upload Product Image
            </h3>
            
            {!uploadedFile ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragOver ? 'border-[#72c306] bg-[#72c306]/5' : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-lg font-medium text-white mb-2">Drop your image here</p>
                  <p className="text-gray-400 mb-4">or click to browse</p>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-upload')?.click();
                    }}
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
                  >
                    Choose Image
                  </Button>
                  <p className="text-xs text-gray-500 mt-4">Supports JPG, PNG, WebP (max 10MB)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={uploadedFile.preview}
                    alt="Uploaded"
                    className="w-full h-48 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    onClick={removeUploadedFile}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  <p>File: {uploadedFile.file.name}</p>
                  <p>Size: {optimizeThumbnailAPI.formatFileSize(uploadedFile.file.size)}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Template Selection */}
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Settings className="h-5 w-5 mr-2 text-[#72c306]" />
              Template & Settings
            </h3>
            
            <div className="space-y-4">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-[#72c306] bg-[#72c306]/10 text-[#8fd428]'
                          : 'border-gray-700 hover:border-gray-600 text-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.category}</div>
                    </button>
                  ))}
                </div>
                {selectedTemplate && (
                  <p className="text-sm text-gray-400 mt-2">{selectedTemplate.description}</p>
                )}
              </div>

              {/* Export Formats */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Export Formats</label>
                <div className="flex gap-2">
                  {['JPG', 'PNG', 'WEBP'].map((format) => (
                    <button
                      key={format}
                      onClick={() => toggleExportFormat(format)}
                      disabled={!selectedTemplate?.supportedFormats.includes(format)}
                      className={`px-3 py-1 text-sm rounded border transition-colors ${
                        exportFormats.includes(format)
                          ? 'border-[#72c306] bg-[#72c306]/20 text-[#8fd428]'
                          : selectedTemplate?.supportedFormats.includes(format)
                          ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                          : 'border-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Background</label>
                  <select
                    value={optimizationSettings.backgroundRemoval || 'none'}
                    onChange={(e) => setOptimizationSettings({
                      ...optimizationSettings,
                      backgroundRemoval: e.target.value
                    })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  >
                    <option value="none">Keep Original</option>
                    <option value="remove">Remove</option>
                    <option value="replace">Replace</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Quality</label>
                  <select
                    value={optimizationSettings.qualityLevel || 'high'}
                    onChange={(e) => setOptimizationSettings({
                      ...optimizationSettings,
                      qualityLevel: e.target.value
                    })}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={handleOptimize}
              disabled={!uploadedFile || !selectedTemplate || isProcessing}
              className="w-full mt-6 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing... ({processingProgress}%)
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Optimize Image
                </>
              )}
            </Button>

            {/* Advanced Settings Toggle */}
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full mt-3 text-sm text-[#8fd428] hover:text-[#72c306]"
            >
              {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
            </button>

            {showAdvancedSettings && (
              <div className="mt-4 space-y-3 p-4 bg-gray-800 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Custom AI Prompt</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Override default AI optimization instructions..."
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center text-white">
                <Eye className="h-5 w-5 mr-2 text-[#72c306]" />
                Optimized Results ({results.length})
              </h3>
              <Button
                onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                variant="outline"
                size="sm"
                className="border-[#72c306] text-[#8fd428] hover:bg-[#72c306]/10"
              >
                {showBeforeAfter ? 'Hide' : 'Show'} Before/After
              </Button>
            </div>

            {/* Before/After Comparison */}
            {showBeforeAfter && uploadedFile && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Before vs After Comparison</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Original</p>
                    <img
                      src={uploadedFile.preview}
                      alt="Original"
                      className="w-full h-32 object-cover rounded border border-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {optimizeThumbnailAPI.formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>
                  {results[0] && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Optimized ({results[0].format})</p>
                      <img
                        src={results[0].imageUrl}
                        alt="Optimized"
                        className="w-full h-32 object-cover rounded border border-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {optimizeThumbnailAPI.formatFileSize(results[0].fileSize)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#8fd428]">{result.format}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(result.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden mb-4 border border-gray-700">
                    <img
                      src={result.imageUrl}
                      alt={`Optimized ${result.format}`}
                      className="w-full h-32 object-cover"
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">
                        {optimizeThumbnailAPI.formatFileSize(result.fileSize)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Dimensions:</span>
                      <span className="text-white">
                        {result.dimensions.width} × {result.dimensions.height}
                      </span>
                    </div>
                    {result.qualityScore && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Quality:</span>
                        <span className="text-green-400">{result.qualityScore}/100</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <a
                      href={result.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download {result.format}
                      </Button>
                    </a>
                    
                    {result.improvementNotes.length > 0 && (
                      <details className="text-xs">
                        <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
                          View Improvements
                        </summary>
                        <ul className="mt-2 space-y-1 text-gray-500">
                          {result.improvementNotes.slice(0, 3).map((note, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                              {note}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Optimizing Image</h3>
                <p className="text-gray-400 mb-4">AI is enhancing your image...</p>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">{processingProgress}% Complete</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default OptimizeThumbnailPage;