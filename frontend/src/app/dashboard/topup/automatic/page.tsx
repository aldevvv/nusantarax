'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Tag,
  AlertCircle,
  Shield,
  Zap,
  CheckCircle,
  X,
  Wallet,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { topupAPI, handleApiError } from '@/lib/api';
import { toast } from 'sonner';

// Declare Midtrans Snap for TypeScript
declare global {
  interface Window {
    snap: {
      pay: (snapToken: string, options?: any) => void;
    };
  }
}

interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount?: number;
  minAmount: number;
  isValid: boolean;
  errorMessage?: string;
}


export default function AutomaticTopupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState<number>(0);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const amountParam = searchParams.get('amount');
    if (amountParam) {
      setAmount(parseInt(amountParam));
    } else {
      router.push('/dashboard/wallet');
    }
  }, [searchParams, router]);

  // Remove available promo codes section as requested

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    
    if (appliedPromo.discountType === 'PERCENTAGE') {
      const discount = (amount * appliedPromo.discountValue) / 100;
      return appliedPromo.maxDiscount ? Math.min(discount, appliedPromo.maxDiscount) : discount;
    } else {
      return appliedPromo.discountValue;
    }
  };

  const getProcessingFee = () => {
    // Fee is FREE but we show it for psychological effect
    return 0;
  };

  const getFinalAmount = () => {
    const discount = calculateDiscount();
    const fee = getProcessingFee();
    return amount + fee - discount;
  };

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) return;

    setIsValidatingPromo(true);
    try {
      const response = await topupAPI.validatePromo(code, amount);
      
      if (response.success && response.data.isValid) {
        setAppliedPromo({
          id: '1',
          code: response.data.promoCode.code,
          discountType: response.data.promoCode.discountType,
          discountValue: response.data.promoCode.discountValue,
          maxDiscount: response.data.promoCode.maxDiscount,
          minAmount: response.data.promoCode.minAmount,
          isValid: true,
        });
        toast.success(`Promo code "${code}" applied successfully!`);
      } else {
        setAppliedPromo({
          id: '1',
          code: code,
          discountType: 'FIXED',
          discountValue: 0,
          minAmount: 0,
          isValid: false,
          errorMessage: response.data?.errorMessage || 'Invalid promo code'
        });
        toast.error(response.data?.errorMessage || 'Invalid promo code');
      }
    } catch (error: any) {
      console.error('Promo validation error:', error);
      const errorMessage = handleApiError(error);
      toast.error(`Failed to validate promo code: ${errorMessage}`);
      setAppliedPromo({
        id: '1',
        code: code,
        discountType: 'FIXED',
        discountValue: 0,
        minAmount: 0,
        isValid: false,
        errorMessage: 'Failed to validate promo code'
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleApplyPromo = () => {
    validatePromoCode(promoCode);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const handleProceedPayment = async () => {
    setIsProcessing(true);
    const loadingToast = toast.loading('Generating payment token...');

    try {
      // Process automatic topup and get Snap token
      const response = await topupAPI.processAutomatic(
        amount,
        appliedPromo?.isValid ? appliedPromo.code : undefined
      );

      toast.dismiss(loadingToast);

      if (!response.success) {
        throw new Error(response.message);
      }

      const { snapToken, orderId } = response.data;

      // Show Midtrans Snap payment popup
      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result);
            toast.success('Payment completed successfully!');
            router.push('/dashboard/wallet?payment=success');
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result);
            toast.info('Payment is being processed. Please check your wallet later.');
            router.push('/dashboard/wallet?payment=pending');
          },
          onError: function(result: any) {
            console.log('Payment error:', result);
            toast.error('Payment failed. Please try again.');
            setIsProcessing(false);
          },
          onClose: function() {
            console.log('Payment popup closed');
            toast.info('Payment cancelled.');
            setIsProcessing(false);
          }
        });
      } else {
        toast.error('Payment system not loaded. Please refresh the page.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Payment processing error:', error);
      const errorMessage = handleApiError(error);
      toast.error(`Failed to process payment: ${errorMessage}`);
      setIsProcessing(false);
    }
  };

  // Load Midtrans Snap script
  useEffect(() => {
    const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const midtransEnvironment = process.env.NEXT_PUBLIC_MIDTRANS_ENVIRONMENT || 'sandbox';
    
    if (!midtransClientKey) {
      console.error('Midtrans client key not configured');
      return;
    }

    const script = document.createElement('script');
    script.src = midtransEnvironment === 'production'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', midtransClientKey);
    script.async = true;
    
    script.onload = () => {
      console.log('Midtrans Snap script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap script');
      toast.error('Payment system failed to load. Please refresh the page.');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Automatic Topup</h1>
                <p className="text-sm sm:text-base text-gray-400">Complete your payment securely with Midtrans</p>
              </div>
            </div>
            <Button
              onClick={() => router.back()}
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wallet
            </Button>
          </div>

          {/* Topup Amount & Secure Payment - Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Amount Summary */}
            <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Topup Amount</p>
                  <p className="text-2xl md:text-3xl font-bold text-[#72c306]">{formatCurrency(amount)}</p>
                </div>
                <div className="h-12 w-12 md:h-16 md:w-16 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-[#72c306]/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Base Amount</span>
                  <span className="text-white">{formatCurrency(amount)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Processing Fee</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 line-through">Rp 2.500</span>
                    <span className="text-[#72c306] font-bold">FREE</span>
                  </div>
                </div>

                {appliedPromo && appliedPromo.isValid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400">Promo Discount ({appliedPromo.code})</span>
                    <span className="text-green-400">-{formatCurrency(calculateDiscount())}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-[#72c306]/20">
                  <span className="text-white font-bold">Total Amount</span>
                  <span className="text-[#72c306] font-bold text-xl">{formatCurrency(getFinalAmount())}</span>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-[#72c306]" />
                Secure Payment
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#72c306] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">SSL Encrypted</p>
                    <p className="text-gray-400 text-sm">Your payment information is protected with 256-bit SSL encryption</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#72c306] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Midtrans Secure</p>
                    <p className="text-gray-400 text-sm">Powered by Midtrans, Indonesia's leading payment gateway</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#72c306] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Instant Processing</p>
                    <p className="text-gray-400 text-sm">Funds will be added to your wallet immediately after payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code - Full Width */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-[#72c306]" />
              Promo Code
            </h3>
            
            {appliedPromo && appliedPromo.isValid ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-green-400 font-medium">{appliedPromo.code}</p>
                      <p className="text-green-300 text-sm">
                        {appliedPromo.discountType === 'PERCENTAGE'
                          ? `${appliedPromo.discountValue}% off${appliedPromo.maxDiscount ? ` (max ${formatCurrency(appliedPromo.maxDiscount)})` : ''}`
                          : `${formatCurrency(appliedPromo.discountValue)} off`
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRemovePromo}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="bg-black border border-[#72c306]/30 text-white placeholder:text-gray-500 focus:border-[#72c306] focus:ring-[#72c306]/20"
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim() || isValidatingPromo}
                    className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 px-6"
                  >
                    {isValidatingPromo ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
                
                {appliedPromo && !appliedPromo.isValid && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {appliedPromo.errorMessage}
                    </p>
                  </div>
                )}
                
              </div>
            )}
          </div>

          {/* Proceed Payment Button - Full Width */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10">
            <Button
              onClick={handleProceedPayment}
              disabled={isProcessing}
              className={`
                w-full h-12 md:h-14 font-medium transition-all duration-200
                ${!isProcessing
                  ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Proceed to Payment - {formatCurrency(getFinalAmount())}</span>
                </div>
              )}
            </Button>
            
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs md:text-sm">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}