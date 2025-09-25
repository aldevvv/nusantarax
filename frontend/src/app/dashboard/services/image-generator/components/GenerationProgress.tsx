'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Sparkles,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface GenerationProgressProps {
  progress: string;
  includeBusinessInfo: boolean;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
  progress, 
  includeBusinessInfo 
}) => {
  const getProgressStep = () => {
    const progressLower = progress.toLowerCase();
    
    if (progressLower.includes('preparing') || progressLower.includes('starting')) {
      return { step: 1, total: 5, icon: Loader2, color: 'text-blue-400' };
    } else if (progressLower.includes('business') || progressLower.includes('context')) {
      return { step: 2, total: 5, icon: Brain, color: 'text-purple-400' };
    } else if (progressLower.includes('analyz') || progressLower.includes('enhancing')) {
      return { step: 3, total: 5, icon: Brain, color: 'text-yellow-400' };
    } else if (progressLower.includes('prompt') || progressLower.includes('creating')) {
      return { step: 4, total: 5, icon: Sparkles, color: 'text-orange-400' };
    } else if (progressLower.includes('generat') || progressLower.includes('image') || progressLower.includes('saving')) {
      return { step: 5, total: 5, icon: ImageIcon, color: 'text-[#72c306]' };
    } else if (progressLower.includes('completed')) {
      return { step: 5, total: 5, icon: CheckCircle, color: 'text-[#72c306]' };
    } else if (progressLower.includes('failed') || progressLower.includes('error')) {
      return { step: 0, total: 5, icon: AlertCircle, color: 'text-red-400' };
    }
    
    return { step: 1, total: 5, icon: Loader2, color: 'text-gray-400' };
  };

  const { step, total, icon: Icon, color } = getProgressStep();
  const progressPercentage = (step / total) * 100;

  const steps = [
    {
      label: 'Preparing Request',
      description: 'Setting up generation parameters',
      enabled: true
    },
    {
      label: 'Business Context',
      description: 'Analyzing business information',
      enabled: includeBusinessInfo
    },
    {
      label: 'Prompt Analysis',
      description: 'Enhancing your prompt with AI',
      enabled: true
    },
    {
      label: 'Prompt Creation',
      description: 'Creating optimized final prompt',
      enabled: true
    },
    {
      label: 'Generate Images & Saving Results',
      description: 'Generating 3 unique images and storing them',
      enabled: true
    },
  ];

  return (
    <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Icon className={`h-5 w-5 ${color} ${Icon === Loader2 ? 'animate-spin' : ''}`} />
          <span>Generation Progress</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          {progress}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Step {step} of {total}</span>
            <span className={color}>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-gray-800"
          />
        </div>

        {/* Step Details */}
        <div className="space-y-3">
          {steps.map((stepItem, index) => {
            if (!stepItem.enabled) return null;
            
            const stepNumber = steps.slice(0, index + 1).filter(s => s.enabled).length;
            const isActive = stepNumber === step;
            const isCompleted = stepNumber < step;
            const isPending = stepNumber > step;
            
            return (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#72c306]/10 border border-[#72c306]/30' 
                    : isCompleted 
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isActive 
                    ? 'bg-[#72c306]/20 text-[#72c306]' 
                    : isCompleted 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{stepNumber}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    isActive 
                      ? 'text-[#72c306]' 
                      : isCompleted 
                      ? 'text-green-400'
                      : 'text-gray-300'
                  }`}>
                    {stepItem.label}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stepItem.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated Time */}
        <div className="text-center p-4 bg-gray-800/30 rounded-lg">
          <p className="text-sm text-gray-400">
            Estimated time: <span className="text-[#72c306] font-medium">30-60 seconds</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Generation time may vary based on complexity and server load
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenerationProgress;