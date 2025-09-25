'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Smartphone,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Wallet
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const QUICK_AMOUNTS = [
  { value: 5000, label: 'Rp 5.000', popular: false },
  { value: 10000, label: 'Rp 10.000', popular: false },
  { value: 50000, label: 'Rp 50.000', popular: true },
  { value: 100000, label: 'Rp 100.000', popular: true },
  { value: 250000, label: 'Rp 250.000', popular: false },
  { value: 500000, label: 'Rp 500.000', popular: false },
  { value: 1000000, label: 'Rp 1.000.000', popular: false },
];

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TopupModal({ isOpen, onClose }: TopupModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [topupMethod, setTopupMethod] = useState<'manual' | 'automatic' | null>(null);
  const [currentStep, setCurrentStep] = useState<'amount' | 'method'>('amount');
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    // Remove non-numeric characters and format
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue) {
      const amount = parseInt(numericValue);
      setSelectedAmount(amount);
      setCustomAmount(formatCurrency(amount));
    } else {
      setSelectedAmount(null);
      setCustomAmount('');
    }
  };

  const getFinalAmount = () => {
    if (customAmount && selectedAmount) {
      return selectedAmount;
    }
    return selectedAmount || 0;
  };

  const handleNextStep = () => {
    const amount = getFinalAmount();
    if (!amount || amount < 5000) {
      return;
    }
    setCurrentStep('method');
  };

  const handleBackToAmount = () => {
    setCurrentStep('amount');
  };

  const handleProceed = () => {
    const amount = getFinalAmount();
    if (!amount || amount < 5000 || !topupMethod) {
      return;
    }

    if (topupMethod === 'manual') {
      router.push(`/dashboard/topup/manual?amount=${amount}`);
    } else if (topupMethod === 'automatic') {
      router.push(`/dashboard/topup/automatic?amount=${amount}`);
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setTopupMethod(null);
    setCurrentStep('amount');
    onClose();
  };

  const isAmountValid = getFinalAmount() >= 5000;
  const isMethodValid = topupMethod !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${currentStep === 'amount' ? 'sm:max-w-lg' : 'sm:max-w-md'} bg-black border border-[#72c306]/30 text-white`}>
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {currentStep === 'amount' ? 'Choose Amount' : 'Payment Method'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            {currentStep === 'amount'
              ? 'Select or enter the amount you want to top up'
              : 'Choose your preferred payment method'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {currentStep === 'amount' ? (
            <>
              {/* Step 1: Amount Selection */}
              <div className="space-y-4">
                <Label className="text-white font-medium">Quick Amounts</Label>
                <div className="grid grid-cols-3 gap-3">
                  {QUICK_AMOUNTS.slice(0, 6).map((amount) => (
                    <Button
                      key={amount.value}
                      onClick={() => handleQuickAmountSelect(amount.value)}
                      className={`
                        relative h-12 text-sm font-medium transition-all duration-200
                        ${selectedAmount === amount.value
                          ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25'
                          : 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 opacity-70 hover:opacity-100'
                        }
                      `}
                    >
                      {amount.popular && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] px-1 py-0.5 rounded-md leading-none">
                          ★
                        </div>
                      )}
                      <span className="text-center leading-tight">
                        {amount.label}
                      </span>
                    </Button>
                  ))}
                  {/* 1M Amount - Full Width */}
                  <div className="col-span-3">
                    <Button
                      onClick={() => handleQuickAmountSelect(1000000)}
                      className={`
                        w-full h-12 text-sm font-medium transition-all duration-200
                        ${selectedAmount === 1000000
                          ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25'
                          : 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 opacity-70 hover:opacity-100'
                        }
                      `}
                    >
                      Rp 1.000.000
                    </Button>
                  </div>
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-3">
                <Label className="text-white font-medium">Custom Amount</Label>
                <Input
                  placeholder="Enter custom amount..."
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="bg-black border border-[#72c306]/30 text-white placeholder:text-gray-500 focus:border-[#72c306] focus:ring-[#72c306]/20"
                />
                {getFinalAmount() > 0 && getFinalAmount() < 5000 && (
                  <p className="text-red-400 text-sm">Minimum topup amount is Rp 5.000</p>
                )}
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNextStep}
                disabled={!isAmountValid}
                className={`
                  w-full h-12 font-medium transition-all duration-200
                  ${isAmountValid
                    ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {!isAmountValid ? (
                  'Select amount to continue'
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Next - {formatCurrency(getFinalAmount())}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Step 2: Payment Method & Fees */}
              <div className="space-y-4">
                <div className="bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Selected Amount</span>
                    <span className="text-[#72c306] font-bold text-lg">
                      {formatCurrency(getFinalAmount())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <Label className="text-white font-medium">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setTopupMethod('manual')}
                    className={`
                      h-16 flex flex-col items-center justify-center space-y-2 transition-all duration-200
                      ${topupMethod === 'manual'
                        ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25'
                        : 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 opacity-70 hover:opacity-100'
                      }
                    `}
                  >
                    <Smartphone className="h-6 w-6" />
                    <span className="text-sm font-medium">Manual</span>
                  </Button>
                  
                  <Button
                    onClick={() => setTopupMethod('automatic')}
                    className={`
                      h-16 flex flex-col items-center justify-center space-y-2 transition-all duration-200
                      ${topupMethod === 'automatic'
                        ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25'
                        : 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 opacity-70 hover:opacity-100'
                      }
                    `}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-sm font-medium">Automatic</span>
                  </Button>
                </div>
              </div>

              {/* Fee Information */}
              <div className="bg-[#72c306]/10 border border-[#72c306]/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Processing Fee</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm line-through">Rp 2.500</span>
                    <span className="text-[#72c306] font-bold">FREE</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#72c306]/20">
                  <span className="text-white font-medium">Total Amount</span>
                  <span className="text-[#72c306] font-bold text-lg">
                    {formatCurrency(getFinalAmount())}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleBackToAmount}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500/90 hover:to-blue-600/90 text-white shadow-lg shadow-blue-500/25"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleProceed}
                  disabled={!isMethodValid}
                  className={`
                    flex-2 h-12 font-medium transition-all duration-200
                    ${isMethodValid
                      ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {!isMethodValid ? (
                    'Select payment method'
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Proceed to {topupMethod === 'manual' ? 'Manual Payment' : 'Checkout'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}