'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Filter,
  AlertCircle,
  Crown,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { imageGeneratorAPI, billingAPI, handleApiError } from '@/lib/api';
import TemplateCard from '@/app/dashboard/services/image-generator/components/TemplateCard';
import UniversalLoadingModal from '@/components/ui/UniversalLoadingModal';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  subCategory: string;
  promptTemplate: string;
  requiredFields: any[] | string; // Can be JSON string from database
  exampleImage?: string;
  sortOrder: number;
}

interface TemplateTabProps {
  includeBusinessInfo: boolean;
}

interface SubscriptionInfo {
  requestsUsed: number;
  requestsLimit: number;
  requestsRemaining: number;
  usagePercentage: number;
  plan: {
    displayName: string;
    name: string;
  };
}

const TemplateTab: React.FC<TemplateTabProps> = ({ includeBusinessInfo }) => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<{category: string; count: number}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<string>('3:4');
  const [imageCount, setImageCount] = useState<number>(3);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
    loadCategories();
    loadSubscriptionInfo();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTemplates(selectedCategory);
    } else {
      loadTemplates();
    }
  }, [selectedCategory]);

  useEffect(() => {
    // Reset form when template changes
    if (selectedTemplate) {
      const initialFormData: Record<string, any> = {};
      const fields = typeof selectedTemplate.requiredFields === 'string'
        ? JSON.parse(selectedTemplate.requiredFields)
        : selectedTemplate.requiredFields;
      
      fields.forEach((field: any) => {
        if (field.type === 'select' && field.options && field.options.length > 0) {
          initialFormData[field.name] = field.required ? field.options[0] : '';
        } else {
          initialFormData[field.name] = '';
        }
      });
      setFormData(initialFormData);
    }
  }, [selectedTemplate]);

  const loadTemplates = async (category?: string) => {
    try {
      setLoading(true);
      const result = await imageGeneratorAPI.getTemplates(category);
      
      if (result.success) {
        setTemplates(result.data);
      } else {
        toast.error(result.message || 'Failed to load templates');
      }
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await imageGeneratorAPI.getTemplateCategories();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast.error(handleApiError(error));
    }
  };

  const loadSubscriptionInfo = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await billingAPI.getCurrentSubscription();
      
      if (response.success && response.data) {
        setSubscriptionInfo(response.data);
      } else {
        console.error('Failed to load subscription info:', response.message);
      }
    } catch (error: any) {
      console.error('Error loading subscription info:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const checkRequestLimits = (requestsNeeded: number): { canGenerate: boolean; message?: string } => {
    if (!subscriptionInfo) {
      return { canGenerate: false, message: 'Unable to verify subscription limits. Please try again.' };
    }

    if (subscriptionInfo.requestsLimit === -1) {
      // Unlimited plan
      return { canGenerate: true };
    }

    if (subscriptionInfo.requestsRemaining < requestsNeeded) {
      const planName = subscriptionInfo.plan.displayName;
      return {
        canGenerate: false,
        message: `Not enough requests remaining. You need ${requestsNeeded} requests but only have ${subscriptionInfo.requestsRemaining} remaining on your ${planName} plan.`
      };
    }

    return { canGenerate: true };
  };

  const handleTemplateSelect = (template: Template) => {
    // Parse requiredFields if it's a JSON string
    const parsedTemplate = {
      ...template,
      requiredFields: typeof template.requiredFields === 'string'
        ? JSON.parse(template.requiredFields)
        : template.requiredFields
    };
    setSelectedTemplate(parsedTemplate);
  };

  const handleFormChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return false;
    }

    const fields = typeof selectedTemplate.requiredFields === 'string'
      ? JSON.parse(selectedTemplate.requiredFields)
      : selectedTemplate.requiredFields;

    for (const field of fields) {
      if (field.required && (!formData[field.name] || formData[field.name].trim() === '')) {
        toast.error(`${field.label} is required`);
        return false;
      }
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    // Check subscription limits before generation
    const requestsNeeded = 2 + imageCount + (includeBusinessInfo ? 1 : 0); // Analysis + Prompt + Images + Business Context
    const limitCheck = checkRequestLimits(requestsNeeded);

    if (!limitCheck.canGenerate) {
      toast.error(limitCheck.message, {
        action: {
          label: 'Upgrade Plan',
          onClick: () => {
            // Navigate to billing page
            window.location.href = '/dashboard/billing';
          },
        },
        duration: 8000,
      });
      return;
    }

    // Show warning if close to limit
    if (subscriptionInfo && subscriptionInfo.requestsLimit !== -1 && subscriptionInfo.requestsRemaining <= 10) {
      toast.warning(`Warning: Only ${subscriptionInfo.requestsRemaining} requests remaining. Consider upgrading your plan.`, {
        action: {
          label: 'View Plans',
          onClick: () => {
            window.location.href = '/dashboard/billing';
          },
        },
        duration: 6000,
      });
    }

    setIsGenerating(true);
    setGenerationProgress('Preparing generation...');

    try {
      const result = await imageGeneratorAPI.generateFromTemplate({
        templateId: selectedTemplate!.id,
        inputFields: formData,
        includeBusinessInfo,
        style: formData.style,
        backgroundPreference: formData.backgroundPreference,
        aspectRatio,
        imageCount,
      });

      if (result.success) {
        // Redirect to result page instead of showing inline
        const requestId = result.data.requestId;
        toast.success(`Generated ${result.data.totalImages} images successfully! Redirecting to results...`);
        
        setTimeout(() => {
          router.push(`/dashboard/services/image-generator/result/${requestId}`);
        }, 1500);
      } else {
        // Better error handling for specific cases
        if (result.message && result.message.includes('Insufficient requests')) {
          toast.error(result.message, {
            action: {
              label: 'Upgrade Plan',
              onClick: () => {
                window.location.href = '/dashboard/billing';
              },
            },
            duration: 8000,
          });
        } else {
          toast.error(result.message || 'Failed to generate images');
        }
        setGenerationProgress('Generation failed');
      }
    } catch (error: any) {
      console.error('Error generating images:', error);
      
      // Better error handling
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Insufficient requests') || errorMessage.includes('limit')) {
        toast.error('Request limit exceeded. Please upgrade your plan to continue generating images.', {
          action: {
            label: 'Upgrade Now',
            onClick: () => {
              window.location.href = '/dashboard/billing';
            },
          },
          duration: 10000,
        });
      } else {
        toast.error(errorMessage);
      }
      setGenerationProgress('Generation failed');
    } finally {
      setIsGenerating(false);
      // Refresh subscription info after generation (successful or failed)
      loadSubscriptionInfo();
      
      setTimeout(() => {
        setGenerationProgress('');
      }, 3000);
    }
  };

  const renderFormField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formData[field.name] || ''}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white placeholder-gray-400 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 hover:border-[#72c306]/40 transition-all duration-300 backdrop-blur-sm rounded-xl"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
            placeholder={`Describe your ${field.label.toLowerCase()} in detail...`}
            rows={4}
            className="bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white placeholder-gray-400 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 hover:border-[#72c306]/40 transition-all duration-300 resize-none backdrop-blur-sm rounded-xl shadow-inner"
          />
        );

      case 'select':
        return (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => handleFormChange(field.name, value)}
          >
            <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 border border-[#72c306]/30 backdrop-blur-xl">
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option} className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-[#72c306]';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-[#72c306]';
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      {!subscriptionLoading && subscriptionInfo && (
        <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {subscriptionInfo.plan.displayName}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`text-sm font-medium ${getUsageColor(subscriptionInfo.usagePercentage)}`}>
                      {subscriptionInfo.requestsUsed} / {subscriptionInfo.requestsLimit === -1 ? '∞' : subscriptionInfo.requestsLimit} requests
                    </span>
                    <span className="text-gray-400 text-sm">
                      {subscriptionInfo.requestsLimit === -1 ? 'Unlimited' : `${subscriptionInfo.requestsRemaining} remaining`}
                    </span>
                  </div>
                </div>
              </div>
              
              {subscriptionInfo.requestsLimit !== -1 && (
                <div className="flex items-center space-x-4">
                  {subscriptionInfo.requestsRemaining <= 5 && (
                    <div className="flex items-center space-x-2 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Low on requests!</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/dashboard/billing'}
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade
                  </Button>
                </div>
              )}
            </div>
            
            {subscriptionInfo.requestsLimit !== -1 && (
              <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getUsageBarColor(subscriptionInfo.usagePercentage)}`}
                  style={{ width: `${Math.min(subscriptionInfo.usagePercentage, 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Filter className="h-5 w-5" />
            <span>Filter Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedCategory('')}
              className={selectedCategory === ''
                ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white'
                : 'bg-transparent border border-[#72c306]/30 text-gray-300 hover:text-white hover:border-[#72c306]'
              }
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                className={selectedCategory === category.category
                  ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white'
                  : 'bg-transparent border border-[#72c306]/30 text-gray-300 hover:text-white hover:border-[#72c306]'
                }
              >
                {category.category}
                <Badge className="ml-2 bg-[#72c306]/20 text-[#72c306]">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      {!selectedTemplate ? (
        <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Sparkles className="h-5 w-5" />
              <span>Choose Template</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select a template that matches your product type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#72c306]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => handleTemplateSelect(template)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Selected Template Form */}
          <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <ImageIcon className="h-5 w-5" />
                    <span>{selectedTemplate.name}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {selectedTemplate.description}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setSelectedTemplate(null)}
                  className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25 text-white"
                >
                  Change Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(typeof selectedTemplate.requiredFields === 'string'
                  ? JSON.parse(selectedTemplate.requiredFields)
                  : selectedTemplate.requiredFields
                ).map((field: any) => (
                  <div key={field.name} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <Label htmlFor={field.name} className="text-white font-medium">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </Label>
                    {renderFormField(field)}
                  </div>
                ))}
              </div>

              {/* Generation Settings */}
              <div className="border-t border-gray-800 pt-6">
                <h4 className="text-white font-medium mb-4">Generation Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">
                      Aspect Ratio
                    </Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 border border-[#72c306]/30 backdrop-blur-xl">
                        <SelectItem value="1:1" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                          1:1 (Square)
                        </SelectItem>
                        <SelectItem value="3:4" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                          3:4 (Portrait)
                        </SelectItem>
                        <SelectItem value="9:16" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                          9:16 (Tall Portrait)
                        </SelectItem>
                        <SelectItem value="16:9" className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                          16:9 (Wide)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image Count */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">
                      Number of Images
                    </Label>
                    <Select value={imageCount.toString()} onValueChange={(value) => setImageCount(parseInt(value))}>
                      <SelectTrigger className="h-14 bg-gradient-to-br from-gray-900/80 to-black/60 border-2 border-[#72c306]/20 text-white hover:border-[#72c306]/40 focus:border-[#72c306]/60 focus:ring-4 focus:ring-[#72c306]/10 transition-all duration-300 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900/95 border border-[#72c306]/30 backdrop-blur-xl">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-white hover:bg-[#72c306]/20 focus:bg-[#72c306]/30 transition-colors">
                            {num} {num === 1 ? 'Image' : 'Images'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    (subscriptionInfo !== null &&
                     !subscriptionLoading &&
                     subscriptionInfo.requestsLimit !== -1 &&
                     subscriptionInfo.requestsRemaining < (2 + imageCount + (includeBusinessInfo ? 1 : 0))
                    )
                  }
                  className={`bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25 ${
                    subscriptionInfo !== null && !subscriptionLoading && subscriptionInfo.requestsLimit !== -1 && subscriptionInfo.requestsRemaining < (3 + imageCount + (includeBusinessInfo ? 1 : 0))
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : subscriptionInfo !== null && !subscriptionLoading && subscriptionInfo.requestsLimit !== -1 && subscriptionInfo.requestsRemaining < (2 + imageCount + (includeBusinessInfo ? 1 : 0)) ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Not Enough Requests
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze & Generate ({2 + imageCount + (includeBusinessInfo ? 1 : 0)} requests)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generation Loading Modal */}
          <UniversalLoadingModal
            isOpen={isGenerating}
            progress={generationProgress}
            serviceType="image"
            includeBusinessInfo={includeBusinessInfo}
            imageCount={imageCount}
          />
        </>
      )}
    </div>
  );
};

export default TemplateTab;