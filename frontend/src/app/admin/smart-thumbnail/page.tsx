'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, Sparkles, CheckCircle, AlertCircle, Clock, TrendingUp, Loader2, Download, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { thumbnailAPI } from '@/lib/thumbnail-api';
import { handleApiError as handleError } from '@/lib/api';

interface ThumbnailResult {
  id: string;
  order: number;
  promptTitle: string;
  promptVariation: string;
  resultText: string;
  imageUrl?: string;
  createdAt: string;
}

interface KPIStats {
  success: number;
  error: number;
  avgProcessingTime: number;
  todayUsage: number;
  successRate: number;
  total: number;
}

const SmartThumbnailPage = () => {
  // Brief form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [packaging, setPackaging] = useState('');
  const [stylePreset, setStylePreset] = useState('ecommerce_white');
  const [background, setBackground] = useState('white');
  const [palette, setPalette] = useState('');
  const [tone, setTone] = useState<'natural' | 'vivid'>('natural');
  const [framing, setFraming] = useState('mid');
  const [angle, setAngle] = useState('eye');
  const [lighting, setLighting] = useState('studio softbox');
  const [platform, setPlatform] = useState('ecommerce');
  const [notes, setNotes] = useState('');
  const [count, setCount] = useState(3);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');

  // Processing & results
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [results, setResults] = useState<ThumbnailResult[]>([]);
  const [kpiStats, setKpiStats] = useState<KPIStats>({ success: 0, error: 0, avgProcessingTime: 0, todayUsage: 0, successRate: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const styleOptions = [
    { id: 'ecommerce_white', title: 'E-commerce White' },
    { id: 'lifestyle_minimal', title: 'Lifestyle Minimal' },
    { id: 'lifestyle_vibrant', title: 'Lifestyle Vibrant' },
    { id: 'catalog_neutral', title: 'Catalog Neutral' },
    { id: 'premium_luxury', title: 'Premium Luxury' },
    { id: 'organic_natural', title: 'Organic Natural' },
    { id: 'tech_modern', title: 'Tech Modern' },
  ];

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const stats = await thumbnailAPI.getUsageStatistics();
      if (stats.success) setKpiStats(stats.data);
    } catch (e: any) {
      toast.error(handleError(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateThumbnails = async () => {
    if (!productName || !productDescription) {
      toast.error('Please fill product name and description');
      return;
    }
    setIsProcessing(true);
    setProcessingProgress(0);
    setResults([]);

    try {
      const iv = setInterval(() => setProcessingProgress(p => (p >= 90 ? 90 : p + 10)), 300);
      const payload: any = {
        productName,
        productDescription,
        productCategory,
        packaging,
        stylePreset,
        background,
        palette: palette ? palette.split(',').map(s => s.trim()).filter(Boolean) : [],
        tone,
        framing,
        angle,
        lighting,
        platform,
        notes,
        count,
        width: 1080,
        height: 1350,
      };
      if (finalPrompt.trim()) payload.finalPromptOverride = finalPrompt.trim();
      const response = await thumbnailAPI.generateFromBrief(payload);
      clearInterval(iv);
      setProcessingProgress(100);

      if (response.success && response.data?.results?.length) {
        setResults(response.data.results);
        toast.success(`Generated ${response.data.results.length} thumbnails successfully!`);
      } else {
        toast.error('Failed to generate thumbnails');
      }
      setIsProcessing(false);
      fetchInitialData();
    } catch (e: any) {
      setIsProcessing(false);
      setProcessingProgress(0);
      toast.error(handleError(e));
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
              <Image className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Smart Thumbnail</h1>
              <p className="text-gray-400">Generate professional product thumbnails from a brief</p>
            </div>
          </div>
        </motion.div>

        {/* KPI */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#72c306]">{kpiStats.success}</p>
                <p className="text-sm text-gray-400">Successful Generations</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-3">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{kpiStats.error}</p>
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
                <p className="text-2xl font-bold text-blue-400">{(kpiStats.avgProcessingTime / 1000).toFixed(1)}s</p>
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
                <p className="text-2xl font-bold text-orange-400">{kpiStats.todayUsage}</p>
                <p className="text-sm text-gray-400">Today's Usage</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Brief */}
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Upload className="h-5 w-5 mr-2 text-[#72c306]" />
              Product Brief
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="bg-gray-800 text-white p-2 rounded" placeholder="Product Name*" value={productName} onChange={e=>setProductName(e.target.value)} />
              <input className="bg-gray-800 text-white p-2 rounded" placeholder="Category" value={productCategory} onChange={e=>setProductCategory(e.target.value)} />
              <input className="bg-gray-800 text-white p-2 rounded" placeholder="Packaging (bottle/jar/box...)" value={packaging} onChange={e=>setPackaging(e.target.value)} />
              <input className="bg-gray-800 text-white p-2 rounded" placeholder="Palette (comma separated hex)" value={palette} onChange={e=>setPalette(e.target.value)} />
            </div>
            <textarea className="bg-gray-800 text-white p-2 rounded w-full mt-4" rows={4} placeholder="Product Description*" value={productDescription} onChange={e=>setProductDescription(e.target.value)} />
          </motion.div>

          {/* Style & Output */}
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Sparkles className="h-5 w-5 mr-2 text-[#72c306]" />
              Style & Output
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="bg-gray-800 text-white p-2 rounded" value={stylePreset} onChange={e=>setStylePreset(e.target.value)}>
                {styleOptions.map(s=> <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <select className="bg-gray-800 text-white p-2 rounded" value={background} onChange={e=>setBackground(e.target.value)}>
                <option value="white">White</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="neutral_gray">Neutral Gray</option>
              </select>
              <select className="bg-gray-800 text-white p-2 rounded" value={tone} onChange={e=>setTone(e.target.value as 'natural'|'vivid')}>
                <option value="natural">Natural</option>
                <option value="vivid">Vivid</option>
              </select>
              <select className="bg-gray-800 text-white p-2 rounded" value={platform} onChange={e=>setPlatform(e.target.value)}>
                <option value="ecommerce">E-commerce</option>
                <option value="instagram">Instagram</option>
                <option value="ads">Ads</option>
                <option value="marketplace">Marketplace</option>
              </select>
              <select className="bg-gray-800 text-white p-2 rounded" value={framing} onChange={e=>setFraming(e.target.value)}>
                <option value="close">Close-up</option>
                <option value="mid">Mid</option>
                <option value="wide">Wide</option>
              </select>
              <select className="bg-gray-800 text-white p-2 rounded" value={angle} onChange={e=>setAngle(e.target.value)}>
                <option value="eye">Eye-level</option>
                <option value="45">45°</option>
                <option value="top">Top-down</option>
              </select>
              <input className="bg-gray-800 text-white p-2 rounded" placeholder="Lighting (e.g. studio softbox)" value={lighting} onChange={e=>setLighting(e.target.value)} />
              <input className="bg-gray-800 text-white p-2 rounded" type="number" min={1} max={10} value={count} onChange={e=>setCount(parseInt(e.target.value || '3',10))} />
            </div>
            <textarea className="bg-gray-800 text-white p-2 rounded w-full mt-4" rows={3} placeholder="Additional Notes" value={notes} onChange={e=>setNotes(e.target.value)} />

            <Button className="w-full mt-6 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25" onClick={handleGenerateThumbnails} disabled={isProcessing}>
              {isProcessing ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing... ({processingProgress}%)</>) : (<><Sparkles className="h-4 w-4 mr-2" />Generate Thumbnails</>)}
            </Button>

            <div className="mt-6">
              <button onClick={() => setShowAdvanced(v => !v)} className="text-sm text-[#8fd428] hover:underline">
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </button>
              {showAdvanced && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-300 mb-2">Final Prompt (optional, overrides Gemini)</label>
                  <textarea className="bg-gray-800 text-white p-2 rounded w-full" rows={6} placeholder="Paste or edit the final prompt to send to Imagen 4.0" value={finalPrompt} onChange={e=>setFinalPrompt(e.target.value)} />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center text-white">
              <Eye className="h-5 w-5 mr-2 text-[#72c306]" />
              Generated Thumbnails ({results.length})
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {results.map((result, index) => (
                <motion.div key={result.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#72c306]">Variation {result.order}</span>
                    <span className="text-xs text-gray-400">{new Date(result.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="rounded-lg overflow-hidden mb-4 border border-gray-700 bg-gray-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={result.imageUrl} alt={`Generated thumbnail ${result.order}`} className="w-full h-auto object-cover" />
                  </div>
                  <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button size="sm" className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25">
                      <Download className="h-3 w-3 mr-1" />
                      Open Image
                    </Button>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <motion.div variants={fadeInUp} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Generating Thumbnails</h3>
                <p className="text-gray-400 mb-4">AI is building your product visuals...</p>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-[#72c306] to-[#8fd428] h-2 rounded-full transition-all duration-300" style={{ width: `${processingProgress}%` }} />
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

export default SmartThumbnailPage;
