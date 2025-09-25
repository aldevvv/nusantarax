'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon, 
  ArrowRight,
  Star
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  subCategory: string;
  promptTemplate: string;
  requiredFields: any[] | string;
  exampleImage?: string;
  sortOrder: number;
}

interface TemplateCardProps {
  // Accept broader type to avoid cross-file interface incompatibility
  template: any;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const fieldsCount =
    Array.isArray(template.requiredFields)
      ? template.requiredFields.length
      : (() => {
          try {
            const parsed = JSON.parse(template.requiredFields as string);
            return Array.isArray(parsed) ? parsed.length : 0;
          } catch {
            return 0;
          }
        })();

  return (
    <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10 hover:border-[#72c306]/50 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-base group-hover:text-[#72c306] transition-colors">
              {template.name}
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">
              {template.description || 'Professional template for your products'}
            </CardDescription>
          </div>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="h-4 w-4 text-[#72c306]" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category Info */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-[#72c306]/30 text-[#72c306] text-xs">
            {template.category}
          </Badge>
          <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
            {template.subCategory}
          </Badge>
        </div>

        {/* Example Preview */}
        {template.exampleImage ? (
          <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={template.exampleImage}
              alt={`${template.name} example`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Preview Coming Soon</p>
            </div>
          </div>
        )}

        {/* Template Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-400">
            <Star className="h-3 w-3" />
            <span>{fieldsCount} fields</span>
          </div>
          <div className="text-xs text-gray-500">
            #{template.sortOrder}
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25 group"
        >
          <span>Use Template</span>
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;