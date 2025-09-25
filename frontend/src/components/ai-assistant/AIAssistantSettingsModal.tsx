'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Save,
  AlertCircle,
  CheckCircle,
  Info,
  ShoppingCart,
  Pizza
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { aiAssistantAPI } from '@/lib/api';
import { toast } from 'sonner';

interface AIAssistantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistantSettingsModal: React.FC<AIAssistantSettingsModalProps> = ({ isOpen, onClose }) => {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalContext, setOriginalContext] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConfiguration();
    }
  }, [isOpen]);

  useEffect(() => {
    setHasChanges(context !== originalContext);
  }, [context, originalContext]);

  const fetchConfiguration = async () => {
    try {
      const response = await aiAssistantAPI.getConfiguration();
      if (response.success && response.data) {
        const configData = response.data;
        setContext(configData.globalContext || '');
        setOriginalContext(configData.globalContext || '');
        if (configData.lastContextUpdate) {
          setLastUpdate(new Date(configData.lastContextUpdate));
        }
      }
    } catch (error) {
      console.error('Failed to fetch configuration:', error);
      toast.error('Failed to load configuration');
    }
  };

  const handleSaveContext = async () => {
    if (!hasChanges) return;

    setLoading(true);
    try {
      const response = await aiAssistantAPI.saveConfiguration({
        globalContext: context
      });

      if (response.success) {
        setOriginalContext(context);
        setLastUpdate(new Date());
        toast.success('Business context saved successfully');
      } else {
        throw new Error(response.message || 'Failed to save configuration');
      }
    } catch (error: any) {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleResetChanges = () => {
    setContext(originalContext);
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
        style={{ zIndex: 10001 }}
      >
        {/* Background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Settings modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-black border border-[#72c306]/30 rounded-2xl shadow-2xl shadow-[#72c306]/20 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-[#72c306]/20 bg-gradient-to-r from-[#72c306]/10 to-[#8fd428]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-[#72c306]" />
                <div>
                  <h3 className="text-white font-semibold">AI Assistant Settings</h3>
                  <p className="text-gray-400 text-sm">Configure business context for personalized responses</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Indicator */}
            {lastUpdate && (
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#72c306]" />
                  <span className="text-white text-sm">Context Active</span>
                </div>
                <Badge variant="outline" className="text-xs text-[#72c306] border-[#72c306]/50">
                  Updated {lastUpdate.toLocaleDateString('id-ID')}
                </Badge>
              </div>
            )}

            {/* Change Indicator */}
            {hasChanges && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">You have unsaved changes</span>
              </div>
            )}
            
            {/* Context Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Business Context</label>
                <span className="text-xs text-gray-400">
                  {context.length} characters
                </span>
              </div>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Describe your business, target audience, goals, products, services, brand voice, marketing challenges, industry, competitors, etc.

Example:
I run a coffee shop called 'Warung Kopi Nusantara' in Jakarta targeting young professionals aged 25-35. We specialize in premium Indonesian coffee beans and traditional brewing methods. Our brand voice is authentic and educational. Main challenges: increasing Instagram engagement, competing with international coffee chains, and building customer loyalty. Goals: expand to 3 locations by 2025, increase online orders by 200%, and establish ourselves as the go-to authentic Indonesian coffee experience."
                rows={12}
                className="bg-gray-900/50 border-[#72c306]/30 text-white placeholder-gray-400 focus:border-[#72c306]/60 resize-none text-sm leading-relaxed"
              />
              <p className="text-xs text-gray-400">
                This context will be used to personalize all AI responses. Include your business details, target market, goals, and specific marketing focuses.
              </p>
            </div>

            {/* Context Examples */}
            <Card className="bg-gray-900/50 border border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center space-x-2 text-lg">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>Context Examples</span>
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Examples of effective business context configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-[#72c306]" />
                    <span>E-commerce Business</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    "I run an online fashion store called 'StyleIndo' targeting young Indonesian women aged 18-30. We sell trendy clothing and accessories at affordable prices (50K-300K IDR). Our brand voice is casual and friendly. Main challenges: increasing Instagram engagement, improving conversion rates from social media traffic, and competing with Shopee/Tokopedia sellers. Goals: reach 10K Instagram followers, achieve 5% conversion rate, and launch our own mobile app."
                  </p>
                </div>
                
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                    <Pizza className="h-4 w-4 text-[#72c306]" />
                    <span>Local F&B Business</span>
                  </h4>
                  <p className="text-gray-400 leading-relaxed">
                    "I run 'Pizza Corner' - a local pizza restaurant in Bandung targeting families and young adults. We offer authentic Italian pizza with Indonesian twists. Brand voice is warm and community-focused. Main challenges: competing with delivery apps, building local brand awareness, and increasing weekend sales. Goals: become the #1 pizza place in our area, launch delivery service, and create a loyal customer base through social media."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 p-6 border-t border-[#72c306]/20 bg-gray-900/50">
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end">
              <Button
                onClick={handleSaveContext}
                disabled={loading || !hasChanges}
                className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 order-1 sm:order-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2">
                      <Save className="h-4 w-4" />
                    </div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Context
                  </>
                )}
              </Button>
              
              {hasChanges && (
                <Button
                  onClick={handleResetChanges}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 order-2 sm:order-1"
                >
                  Reset Changes
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistantSettingsModal;