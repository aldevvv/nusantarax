'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Upload, 
  Check,
  AlertTriangle,
  Copy,
  Smartphone,
  CreditCard,
  Wallet as WalletIcon,
  QrCode,
  Building2,
  Zap,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { topupAPI, handleApiError } from '@/lib/api';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
  {
    id: 'QRIS',
    name: 'QRIS',
    description: 'Scan QR Code with any payment App',
    icon: QrCode,
    iconColor: 'from-purple-500 to-purple-600',
    instructions: 'Please open your preferred payment application and scan the QR code to complete the transaction.'
  },
  {
    id: 'SEABANK',
    name: 'SeaBank',
    description: 'Manual Transfer via SeaBank App',
    icon: Building2,
    iconColor: 'from-blue-500 to-blue-600',
    accountNumber: '901660897975',
    accountName: 'MUH. ALIF',
    instructions: 'Transfer to the account number above using SeaBank App'
  },
  {
    id: 'ALLOBANK',
    name: 'AlloBank',
    description: 'Transfer via AlloBank App',
    icon: Zap,
    iconColor: 'from-orange-500 to-orange-600',
    accountNumber: '089643143750',
    accountName: 'MUH. ALIF',
    instructions: 'Transfer to the account number above using AlloBank App'
  },
  {
    id: 'BLU_BCA',
    name: 'BLU by BCA Digital',
    description: 'Transfer via BLU app',
    icon: Building2,
    iconColor: 'from-indigo-500 to-indigo-600',
    accountNumber: '001902846209',
    accountName: 'MUH. ALIF',
    instructions: 'Transfer to the account number above using BLU by BCA App'
  },
  {
    id: 'GOPAY',
    name: 'Gopay',
    description: 'Transfer via Gojek app',
    icon: Smartphone,
    iconColor: 'from-green-500 to-green-600',
    phone: '089643143750',
    accountName: 'MUH. ALIF',
    instructions: 'Send money to the phone number above via Gojek App'
  },
  {
    id: 'DANA',
    name: 'Dana',
    description: 'Transfer via Dana app',
    icon: Banknote,
    iconColor: 'from-cyan-500 to-cyan-600',
    phone: '089643143750',
    accountName: 'MUH. ALIF',
    instructions: 'Send money to the phone number above via Dana App'
  }
];

export default function ManualTopupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topupRequestId, setTopupRequestId] = useState<string>('');

  useEffect(() => {
    const amountParam = searchParams.get('amount');
    if (amountParam) {
      setAmount(parseInt(amountParam));
    } else {
      router.push('/dashboard/wallet');
    }
  }, [searchParams, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setProofFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProofPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSubmit = async () => {
    if (!selectedPaymentMethod || !proofFile) {
      toast.error('Please select payment method and upload proof');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Processing topup request...');

    try {
      // Step 1: Create manual topup request
      if (!topupRequestId) {
        const requestResponse = await topupAPI.createManualRequest(amount, selectedPaymentMethod);
        if (!requestResponse.success) {
          throw new Error(requestResponse.message);
        }
        setTopupRequestId(requestResponse.data.id);
      }

      // Step 2: Upload proof
      const proofResponse = await topupAPI.uploadProof(topupRequestId, proofFile);
      if (!proofResponse.success) {
        throw new Error(proofResponse.message);
      }

      toast.dismiss(loadingToast);
      toast.success('Topup request submitted successfully! Admin will review your request.');
      router.push('/dashboard/wallet');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Submit error:', error);
      const errorMessage = handleApiError(error);
      toast.error(`Failed to submit topup request: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create topup request when payment method is selected
  useEffect(() => {
    if (selectedPaymentMethod && amount > 0 && !topupRequestId) {
      const createRequest = async () => {
        try {
          const response = await topupAPI.createManualRequest(amount, selectedPaymentMethod);
          if (response.success) {
            setTopupRequestId(response.data.id);
          }
        } catch (error) {
          console.error('Failed to create topup request:', error);
        }
      };
      createRequest();
    }
  }, [selectedPaymentMethod, amount, topupRequestId]);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">Manual Topup</h1>
                <p className="text-sm sm:text-base text-gray-400">Complete your wallet topup manually</p>
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

          {/* Amount Summary */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Topup Amount</p>
                <p className="text-2xl md:text-3xl font-bold text-[#72c306]">{formatCurrency(amount)}</p>
              </div>
              <div className="h-12 w-12 md:h-16 md:w-16 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-full flex items-center justify-center">
                <WalletIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className={`grid gap-4 md:gap-6 ${selectedMethod ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            <div className={`bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10 ${!selectedMethod ? 'max-w-4xl mx-auto' : ''}`}>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-[#72c306]" />
                Select Payment Method
              </h2>
              <div className={`grid gap-3 ${selectedMethod ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {PAYMENT_METHODS.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      className={`
                        w-full p-4 rounded-lg border transition-all duration-200 text-left
                        ${selectedPaymentMethod === method.id
                          ? 'border-[#72c306] bg-[#72c306]/10 shadow-lg shadow-[#72c306]/25'
                          : 'border-[#72c306]/30 hover:border-[#72c306] hover:bg-[#72c306]/5'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 bg-gradient-to-r ${method.iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{method.name}</p>
                          <p className="text-sm text-gray-400 truncate">{method.description}</p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <div className="h-8 w-8 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Instructions */}
            {selectedMethod && (
              <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-[#72c306]" />
                  Payment Instructions
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-100 text-sm">{selectedMethod.instructions}</p>
                    </div>
                  </div>

                  {/* QRIS Image */}
                  {selectedMethod.id === 'QRIS' && (
                    <div className="space-y-2">
                      <Label className="text-white font-medium">QR Code</Label>
                      <div className="bg-white rounded-lg p-4 flex justify-center">
                        <img
                          src="https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/images/QRIS2.jpg"
                          alt="QRIS QR Code"
                          className="max-w-full h-auto max-h-80 rounded-lg shadow-lg"
                        />
                      </div>
                      <p className="text-gray-400 text-xs text-center">
                        Scan this QR code with any payment app that supports QRIS
                      </p>
                    </div>
                  )}

                  {selectedMethod.accountNumber && (
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Account Number</Label>
                      <div className="flex items-center justify-between bg-black border border-[#72c306]/30 rounded-lg p-3">
                        <span className="font-mono text-white text-sm md:text-base break-all">{selectedMethod.accountNumber}</span>
                        <Button
                          size="sm"
                          onClick={() => handleCopyText(selectedMethod.accountNumber!)}
                          className="ml-2 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedMethod.phone && (
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Phone Number</Label>
                      <div className="flex items-center justify-between bg-black border border-[#72c306]/30 rounded-lg p-3">
                        <span className="font-mono text-white text-sm md:text-base">{selectedMethod.phone}</span>
                        <Button
                          size="sm"
                          onClick={() => handleCopyText(selectedMethod.phone!)}
                          className="ml-2 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedMethod.id !== 'QRIS' && (
                    <div className="space-y-2">
                      <Label className="text-white font-medium">Account Name</Label>
                      <div className="bg-black border border-[#72c306]/30 rounded-lg p-3">
                        <span className="text-white text-sm md:text-base">{selectedMethod.accountName}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white font-medium">Amount to Transfer</Label>
                    <div className="flex items-center justify-between bg-black border border-[#72c306]/30 rounded-lg p-3">
                      <span className="font-mono text-[#72c306] font-bold text-lg md:text-xl">
                        {formatCurrency(amount)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleCopyText(amount.toString())}
                        className="ml-2 bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25 flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Proof Upload */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-[#72c306]" />
              Upload Payment Proof
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#72c306]/30 rounded-lg p-6 md:p-8 text-center hover:border-[#72c306]/50 transition-colors">
                {proofPreview ? (
                  <div className="space-y-4">
                    <img
                      src={proofPreview}
                      alt="Payment proof preview"
                      className="max-h-48 md:max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <Button
                      onClick={() => document.getElementById('proof-upload')?.click()}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-16 w-16 bg-gradient-to-r from-[#72c306] to-[#8fd428] rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Upload Payment Proof</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 5MB</p>
                    </div>
                    <Button
                      onClick={() => document.getElementById('proof-upload')?.click()}
                      className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  id="proof-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-black border border-[#72c306]/30 rounded-lg p-4 md:p-6 shadow-lg shadow-[#72c306]/10">
            <Button
              onClick={handleSubmit}
              disabled={!selectedPaymentMethod || !proofFile || isSubmitting}
              className={`
                w-full h-12 md:h-14 font-medium transition-all duration-200
                ${selectedPaymentMethod && proofFile && !isSubmitting
                  ? 'bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 text-white shadow-lg shadow-[#72c306]/25'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Request...</span>
                </div>
              ) : (
                'Submit Topup Request'
              )}
            </Button>
            {(!selectedPaymentMethod || !proofFile) && (
              <p className="text-gray-400 text-sm mt-3 text-center">
                Please select payment method and upload proof to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}