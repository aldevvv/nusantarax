'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  Building,
  User,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { chatBotAPI, handleApiError } from '@/lib/api';

interface LeadCaptureFormProps {
  onClose: () => void;
}

interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
}

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    email: '',
    phone: '',
    company: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Call the real lead capture API
      const response = await chatBotAPI.captureLeads({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company
      });

      if (response.success) {
        setIsSubmitted(true);
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to submit lead');
      }

    } catch (error: any) {
      console.error('Failed to submit lead:', error);
      // Show error toast or message
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-sm"
      >
        <Card className="bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/10 border-[#72c306]/30 shadow-lg">
          <CardContent className="py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex p-3 rounded-full bg-[#72c306]/20 mb-4"
            >
              <CheckCircle2 className="h-8 w-8 text-[#72c306]" />
            </motion.div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Thank You!
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Our team will contact you soon to discuss how NusantaraX can help transform your business.
            </p>
            <div className="flex justify-center space-x-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-[#72c306] fill-current" />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-sm"
    >
      <Card className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 border-[#72c306]/30 shadow-lg backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Interested in NusantaraX?</CardTitle>
                <p className="text-gray-400 text-sm">Get in touch with our team</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white h-6 w-6 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-white text-sm font-medium">
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`pl-10 bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white ${
                    errors.fullName ? 'border-red-500' : ''
                  }`}
                  placeholder="Your full name"
                  disabled={isSubmitting}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-xs">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-white text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white"
                  placeholder="+62 xxx xxx xxxx"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Company (Optional) */}
            <div className="space-y-1">
              <Label htmlFor="company" className="text-white text-sm font-medium">
                Company Name
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 focus:border-[#72c306] text-white"
                  placeholder="Your company"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#72c306]/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Get In Touch
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Help text */}
          <div className="text-center pt-2 border-t border-gray-700/50">
            <p className="text-xs text-gray-500">
              Our team will reach out within 24 hours to discuss your needs
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LeadCaptureForm;