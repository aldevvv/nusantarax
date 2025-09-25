'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { businessInfoAPI, handleApiError } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Briefcase, 
  Building2, 
  Palette, 
  MapPin,
  Globe,
  Phone,
  Mail,
  Target,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import NusantaraLoadingScreen from '@/components/ui/NusantaraLoadingScreen';

interface BusinessInfoData {
  id: string;
  businessName: string;
  description?: string;
  category: string;
  subCategory?: string;
  brandColors: string[];
  logoUrl?: string;
  industry?: string;
  businessModel?: string;
  targetAudience?: string;
  businessSize: string;
  establishedYear?: number;
  mainProducts?: string[];
  keyServices?: string[];
  brandVoice?: string;
  brandPersonality?: string[];
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  website?: string;
  phoneNumber?: string;
  socialMedia?: Record<string, string>;
  businessGoals?: string[];
  marketingFocus?: string[];
  contentTone?: string;
  preferredLanguage: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const BusinessInformationPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    subCategory: '',
    brandColors: ['#72c306'],
    logoUrl: '',
    industry: '',
    businessModel: '',
    targetAudience: '',
    businessSize: 'MICRO',
    establishedYear: new Date().getFullYear(),
    mainProducts: [''],
    keyServices: [''],
    brandVoice: '',
    brandPersonality: [''],
    address: '',
    city: '',
    region: '',
    postalCode: '',
    website: '',
    phoneNumber: '',
    socialMedia: { instagram: '', facebook: '', tiktok: '', linkedin: '' },
    businessGoals: [''],
    marketingFocus: [''],
    contentTone: '',
    preferredLanguage: 'id',
    isCompleted: false,
  });

  // Options
  const [categories, setCategories] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [brandVoices, setBrandVoices] = useState<string[]>([]);
  const [contentTones, setContentTones] = useState<string[]>([]);
  const [brandPersonalities, setBrandPersonalities] = useState<string[]>([]);

  useEffect(() => {
    loadBusinessInfo();
    loadOptions();
  }, []);

  const loadBusinessInfo = async () => {
    try {
      setLoading(true);
      const result = await businessInfoAPI.getBusinessInfo();
      
      if (result.success && result.data) {
        setBusinessInfo(result.data);
        setFormData({
          businessName: result.data.businessName || '',
          description: result.data.description || '',
          category: result.data.category || '',
          subCategory: result.data.subCategory || '',
          brandColors: result.data.brandColors || ['#72c306'],
          logoUrl: result.data.logoUrl || '',
          industry: result.data.industry || '',
          businessModel: result.data.businessModel || '',
          targetAudience: result.data.targetAudience || '',
          businessSize: result.data.businessSize || 'MICRO',
          establishedYear: result.data.establishedYear || new Date().getFullYear(),
          mainProducts: result.data.mainProducts || [''],
          keyServices: result.data.keyServices || [''],
          brandVoice: result.data.brandVoice || '',
          brandPersonality: result.data.brandPersonality || [''],
          address: result.data.address || '',
          city: result.data.city || '',
          region: result.data.region || '',
          postalCode: result.data.postalCode || '',
          website: result.data.website || '',
          phoneNumber: result.data.phoneNumber || '',
          socialMedia: result.data.socialMedia || { instagram: '', facebook: '', tiktok: '', linkedin: '' },
          businessGoals: result.data.businessGoals || [''],
          marketingFocus: result.data.marketingFocus || [''],
          contentTone: result.data.contentTone || '',
          preferredLanguage: result.data.preferredLanguage || 'id',
          isCompleted: result.data.isCompleted || false,
        });
        setIsEditing(false);
      } else {
        setIsEditing(true); // No business info exists, enable editing
      }
    } catch (error) {
      console.error('Error loading business info:', error);
      toast.error(handleApiError(error as any));
      setIsEditing(true); // Enable editing on error
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [categoriesRes, industriesRes, brandVoicesRes, contentTonesRes, personalitiesRes] = await Promise.all([
        businessInfoAPI.getBusinessCategories(),
        businessInfoAPI.getIndustryOptions(),
        businessInfoAPI.getBrandVoiceOptions(),
        businessInfoAPI.getContentToneOptions(),
        businessInfoAPI.getBrandPersonalityOptions(),
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (industriesRes.success) setIndustries(industriesRes.data);
      if (brandVoicesRes.success) setBrandVoices(brandVoicesRes.data);
      if (contentTonesRes.success) setContentTones(contentTonesRes.data);
      if (personalitiesRes.success) setBrandPersonalities(personalitiesRes.data);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.businessName.trim() || !formData.category) {
      toast.error('Business name and category are required');
      return;
    }

    try {
      setSaving(true);
      
      const dataToSave = {
        ...formData,
        mainProducts: formData.mainProducts.filter(p => p.trim() !== ''),
        keyServices: formData.keyServices.filter(s => s.trim() !== ''),
        brandPersonality: formData.brandPersonality.filter(p => p.trim() !== ''),
        businessGoals: formData.businessGoals.filter(g => g.trim() !== ''),
        marketingFocus: formData.marketingFocus.filter(f => f.trim() !== ''),
        establishedYear: formData.establishedYear || undefined,
      };

      let result;
      if (businessInfo) {
        result = await businessInfoAPI.updateBusinessInfo(dataToSave);
      } else {
        result = await businessInfoAPI.createBusinessInfo(dataToSave);
      }

      if (result.success) {
        toast.success(businessInfo ? 'Business information updated successfully' : 'Business information created successfully');
        await loadBusinessInfo();
      } else {
        toast.error(result.message || 'Failed to save business information');
      }
    } catch (error) {
      console.error('Error saving business info:', error);
      toast.error(handleApiError(error as any));
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: keyof typeof formData, value: string = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value]
    }));
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof typeof formData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addBrandColor = () => {
    if (formData.brandColors.length < 5) {
      setFormData(prev => ({
        ...prev,
        brandColors: [...prev.brandColors, '#000000']
      }));
    }
  };

  const removeBrandColor = (index: number) => {
    if (formData.brandColors.length > 1) {
      setFormData(prev => ({
        ...prev,
        brandColors: prev.brandColors.filter((_, i) => i !== index)
      }));
    }
  };

  const updateBrandColor = (index: number, color: string) => {
    setFormData(prev => ({
      ...prev,
      brandColors: prev.brandColors.map((c, i) => i === index ? color : c)
    }));
  };

  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    try {
      setUploadingLogo(true);
      const result = await businessInfoAPI.uploadLogo(logoFile);
      
      if (result.success) {
        toast.success('Logo uploaded successfully');
        setFormData(prev => ({ ...prev, logoUrl: result.data.logoUrl }));
        setLogoFile(null);
        setLogoPreview('');
      } else {
        toast.error(result.message || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(handleApiError(error as any));
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogoPreview = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  if (loading) {
    return (
      <NusantaraLoadingScreen
        message="Loading business information"
        showProgress={false}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                  Business Information
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-1 leading-relaxed">
                  Configure your business details for AI-powered content generation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {businessInfo && !isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25 flex-1 sm:flex-none"
                >
                  Edit
                </Button>
              )}
              {isEditing && (
                <Button
                  onClick={() => setIsEditing(false)}
                  className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 gap-1 sm:gap-2">
            <TabsTrigger
              value="basic"
              className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-2 sm:px-3 py-2 sm:py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Basic</span>
            </TabsTrigger>
            <TabsTrigger
              value="brand"
              className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-2 sm:px-3 py-2 sm:py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <Palette className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Brand</span>
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-2 sm:px-3 py-2 sm:py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Contact</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-2 sm:px-3 py-2 sm:py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">AI</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Building2 className="h-5 w-5" />
                  <span>Basic Business Information</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Essential details about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-gray-300">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Enter your business name"
                      disabled={!isEditing}
                      className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] disabled:opacity-60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-300">Business Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306] disabled:opacity-60">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-[#72c306]/30">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-white focus:bg-[#72c306]/20 focus:text-white">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Business Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your business, products, and services..."
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 bg-black border border-[#72c306]/30 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#72c306]/20 focus:border-[#72c306] disabled:opacity-60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                    <Select 
                      value={formData.industry} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306] disabled:opacity-60">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-[#72c306]/30">
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry} className="text-white focus:bg-[#72c306]/20 focus:text-white">
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessModel" className="text-gray-300">Business Model</Label>
                    <Select 
                      value={formData.businessModel} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, businessModel: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306] disabled:opacity-60">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-[#72c306]/30">
                        {['B2C', 'B2B', 'B2B2C', 'Marketplace'].map((model) => (
                          <SelectItem key={model} value={model} className="text-white focus:bg-[#72c306]/20 focus:text-white">
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessSize" className="text-gray-300">Business Size</Label>
                    <Select 
                      value={formData.businessSize} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, businessSize: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306] disabled:opacity-60">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-[#72c306]/30">
                        {[
                          { value: 'MICRO', label: 'Micro (< 10 employees)' },
                          { value: 'SMALL', label: 'Small (10-50 employees)' },
                          { value: 'MEDIUM', label: 'Medium (50-250 employees)' },
                          { value: 'LARGE', label: 'Large (> 250 employees)' }
                        ].map((size) => (
                          <SelectItem key={size.value} value={size.value} className="text-white focus:bg-[#72c306]/20 focus:text-white">
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                    >
                      {saving ? 'Saving...' : businessInfo ? 'Update' : 'Create'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Identity Tab */}
          <TabsContent value="brand" className="space-y-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Palette className="h-5 w-5" />
                  <span>Brand Identity</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Define your brand colors, voice, and personality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brand Colors */}
                <div className="space-y-4">
                  <Label className="text-gray-300">Brand Colors</Label>
                  <div className="space-y-3">
                    {formData.brandColors.map((color, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div
                            className="h-10 w-10 rounded-lg border border-[#72c306]/30 cursor-pointer flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <Input
                            value={color}
                            onChange={(e) => updateBrandColor(index, e.target.value)}
                            placeholder="#72c306"
                            disabled={!isEditing}
                            className="flex-1 bg-black border-[#72c306]/30 text-white focus:border-[#72c306] disabled:opacity-60"
                          />
                        </div>
                        {isEditing && formData.brandColors.length > 1 && (
                          <Button
                            onClick={() => removeBrandColor(index)}
                            size="sm"
                            className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25 w-full sm:w-auto"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isEditing && formData.brandColors.length < 5 && (
                      <Button
                        onClick={addBrandColor}
                        size="sm"
                        className="bg-[#72c306]/20 hover:bg-[#72c306]/30 text-[#72c306] border border-[#72c306]/30"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Color
                      </Button>
                    )}
                  </div>
                </div>

                {/* Brand Voice & Tone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Brand Voice</Label>
                    <Select 
                      value={formData.brandVoice} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, brandVoice: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306] disabled:opacity-60">
                        <SelectValue placeholder="Select brand voice" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-[#72c306]/30">
                        {brandVoices.map((voice) => (
                          <SelectItem key={voice} value={voice} className="text-white focus:bg-[#72c306]/20 focus:text-white">
                            {voice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Content Tone</Label>
                    <Select 
                      value={formData.contentTone} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, contentTone: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306] disabled:opacity-60">
                        <SelectValue placeholder="Select content tone" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-[#72c306]/30">
                        {contentTones.map((tone) => (
                          <SelectItem key={tone} value={tone} className="text-white focus:bg-[#72c306]/20 focus:text-white">
                            {tone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                    >
                      {saving ? 'Saving...' : businessInfo ? 'Update' : 'Create'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact & Location Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <MapPin className="h-5 w-5" />
                  <span>Contact & Location</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your business location and contact information (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address"
                      disabled={!isEditing}
                      className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] disabled:opacity-60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-300">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      disabled={!isEditing}
                      className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] disabled:opacity-60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-gray-300">Region/Province</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="Region or province"
                      disabled={!isEditing}
                      className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] disabled:opacity-60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-gray-300">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://your-website.com"
                      disabled={!isEditing}
                      className="bg-black border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306] disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                    >
                      {saving ? 'Saving...' : businessInfo ? 'Update' : 'Create'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Target className="h-5 w-5" />
                  <span>AI Generation Settings</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure how AI will generate content for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-gray-300">Target Audience</Label>
                  <textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Describe your target audience (e.g., Young professionals aged 25-35 interested in sustainable fashion)"
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 bg-black border border-[#72c306]/30 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#72c306]/20 focus:border-[#72c306] disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Preferred Language</Label>
                  <Select 
                    value={formData.preferredLanguage} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-black border-[#72c306]/30 text-white focus:border-[#72c306] disabled:opacity-60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-[#72c306]/30">
                      <SelectItem value="id" className="text-white focus:bg-[#72c306]/20 focus:text-white">
                        Indonesian
                      </SelectItem>
                      <SelectItem value="en" className="text-white focus:bg-[#72c306]/20 focus:text-white">
                        English
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
                    >
                      {saving ? 'Saving...' : businessInfo ? 'Update' : 'Create'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BusinessInformationPage;