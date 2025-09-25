'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Image,
  Sparkles,
  History,
  Info,
  Crown,
  Zap
} from 'lucide-react';
import TemplateTab from './components/TemplateTab';
import CustomTab from './components/CustomTab';
import HistoryTab from './components/HistoryTab';

const ImageGeneratorPage = () => {
  const { user } = useAuth();
  const [includeBusinessInfo, setIncludeBusinessInfo] = useState(false);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center justify-between">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center flex-shrink-0">
                <Image className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">
                  Image Generator
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-1 leading-relaxed">
                  Generate professional product images for your business using AI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information Toggle */}
        <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10 mb-4">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Info className="h-4 w-4 text-[#72c306]" />
                <div>
                  <Label htmlFor="business-info-toggle" className="text-white font-medium">
                    Include Business Information
                  </Label>
                  <p className="text-sm text-gray-400">
                    Add your business context to generate more relevant images
                  </p>
                </div>
              </div>
              <Switch
                id="business-info-toggle"
                checked={includeBusinessInfo}
                onCheckedChange={setIncludeBusinessInfo}
                className="data-[state=checked]:bg-[#72c306] data-[state=unchecked]:bg-gray-600 border-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 gap-2">
            <TabsTrigger 
              value="templates" 
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-3 py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Templates</span>
              <span className="sm:hidden text-xs">Templates</span>
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-3 py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <Image className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Custom</span>
              <span className="sm:hidden text-xs">Custom</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#72c306] data-[state=active]:to-[#8fd428] rounded-lg px-3 py-3 border border-transparent hover:border-[#72c306]/30 transition-colors"
            >
              <History className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden text-xs">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <TemplateTab includeBusinessInfo={includeBusinessInfo} />
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="space-y-6">
            <CustomTab includeBusinessInfo={includeBusinessInfo} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ImageGeneratorPage;