import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { stripePromise, stripeEnabled } from '@/lib/stripe';
import { X, Heart, Check, Sparkles, Users, Globe, BookOpen, Mail, Share2, Download, ExternalLink, AlertCircle, RefreshCw, FileText } from 'lucide-react';

interface PaymentFormProps {
  onSuccess: (receiptData: ReceiptData) => void;
  onCancel: () => void;
  amount: number;
}

interface ReceiptData {
  receiptSent: boolean;
  receiptNumber: string | null;
  amount: number;
  email: string | null;
  emailError?: string | null;
  emailHTML?: string | null;
}

function DonationPaymentForm({ onSuccess, onCancel, amount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '?donation=success',
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      onSuccess({ receiptSent: false, receiptNumber: null, amount, email: null });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Donate $${(amount / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetAmounts = [
  { value: 500, label: '$5' },
  { value: 1000, label: '$10' },
  { value: 2500, label: '$25' },
  { value: 5000, label: '$50' },
  { value: 10000, label: '$100' },
];

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [step, setStep] = useState<'amount' | 'info' | 'payment'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [showOnWall, setShowOnWall] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    receiptSent: boolean;
    receiptNumber: string | null;
    emailSent: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('amount');
      setClientSecret(null);
      setDonationId(null);
      setError(null);
      setSuccess(false);
      setCustomAmount('');
      setShowOnWall(false);
      setReceiptData(null);
    }
  }, [isOpen]);

  const getAmount = () => {
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : Math.round(parsed * 100);
    }
    return selectedAmount;
  };

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = getAmount();
    if (amount < 100) {
      setError('Minimum donation is $1.00');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-donation', {
        body: { amount, email, name, message, showOnWall }
      });
      if (fnError || data?.error) throw new Error(data?.error || fnError?.message);
      
      setClientSecret(data.clientSecret);
      setDonationId(data.donationId);
      setStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    // Mark donation as completed in database
    if (donationId) {
      try {
        const { data } = await supabase.functions.invoke('create-donation', {
          body: { action: 'complete', donationId }
        });
        
        // Store receipt data
        setReceiptData({
          receiptSent: data?.receiptSent || false,
          receiptNumber: data?.receiptNumber || null,
          emailSent: !!email && data?.receiptSent
        });
      } catch (err) {
        console.error('Error marking donation as complete:', err);
      }
    }
    setSuccess(true);
  };

  const handleResendReceipt = async () => {
    if (!donationId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-donation-receipt', {
        body: { donationId }
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      
      setReceiptData(prev => prev ? { ...prev, receiptSent: true, emailSent: true, receiptNumber: data.receiptNumber } : null);
      alert('Receipt sent successfully!');
    } catch (err: any) {
      alert('Failed to send receipt: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareOnSocial = (platform: string) => {
    const shareText = encodeURIComponent(`I just supported Divine Word Bible App in spreading God's word! Join me in making a difference. 🙏`);
    const shareUrl = encodeURIComponent(window.location.origin);
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  if (!isOpen) return null;

  const impactItems = [
    { icon: Globe, text: 'Spread God\'s word worldwide' },
    { icon: BookOpen, text: 'Develop new Bible study features' },
    { icon: Users, text: 'Support faith communities' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="p-8">
            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white fill-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-2">
                Your generous donation of <span className="font-semibold">${(getAmount() / 100).toFixed(2)}</span> has been received.
              </p>
              <p className="text-gray-500 text-sm">
                May God bless you abundantly for your support in spreading His word.
              </p>
            </div>

            {/* Receipt Information */}
            {receiptData && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-800 mb-1">Tax-Deductible Receipt</h3>
                    {receiptData.receiptNumber && (
                      <p className="text-sm text-emerald-700 mb-2">
                        Receipt #: <span className="font-mono font-semibold">{receiptData.receiptNumber}</span>
                      </p>
                    )}
                    {receiptData.emailSent && email ? (
                      <p className="text-sm text-emerald-600 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Receipt sent to {email}
                      </p>
                    ) : email ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-amber-600">Receipt not sent yet</p>
                        <button
                          onClick={handleResendReceipt}
                          disabled={loading}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline"
                        >
                          {loading ? 'Sending...' : 'Send Receipt'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No email provided - receipt available for download
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Impact Statement */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Your Impact
              </h3>
              <p className="text-sm text-purple-700 mb-3">
                Your ${(getAmount() / 100).toFixed(2)} donation helps us:
              </p>
              <ul className="space-y-2 text-sm text-purple-600">
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Reach people in 150+ countries
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Provide free Bible access to millions
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Support faith communities worldwide
                </li>
              </ul>
            </div>

            {/* Social Sharing */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Your Support
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Inspire others to support our mission by sharing on social media
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShareOnSocial('facebook')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button
                  onClick={() => handleShareOnSocial('twitter')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1da1f2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
                <button
                  onClick={() => handleShareOnSocial('linkedin')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-lg hover:bg-[#095196] transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Scripture Quote */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 italic text-sm mb-2">
                "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
              </p>
              <p className="text-amber-600 text-sm font-semibold">— 2 Corinthians 9:7</p>
            </div>

            <button
              onClick={onClose}
              className="w-full px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold hover:from-rose-600 hover:to-pink-700 transition-all"
            >
              Close
            </button>
          </div>
        ) : step === 'amount' ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 p-6 text-center text-white rounded-t-2xl">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Donation of Growth</h2>
              <p className="text-rose-100">Help us spread God's word to the world</p>
            </div>

            <div className="p-6">
              {/* Impact */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Your Donation Helps:</h3>
                <div className="space-y-2">
                  {impactItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-rose-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Select Amount</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() => {
                        setSelectedAmount(amount.value);
                        setCustomAmount('');
                      }}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        selectedAmount === amount.value && !customAmount
                          ? 'bg-rose-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {amount.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    min="1"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep('info')}
                disabled={getAmount() < 100}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue with ${(getAmount() / 100).toFixed(2)}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                <Sparkles className="w-3 h-3 inline mr-1" />
                100% of your donation supports our mission
              </p>
            </div>
          </>
        ) : step === 'info' ? (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Information</h2>
            <p className="text-gray-600 mb-6">
              Enter your details to complete your donation of <span className="font-semibold">${(getAmount() / 100).toFixed(2)}</span>
            </p>

            <form onSubmit={handleCreateDonation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-rose-500">(for tax receipt)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <Mail className="w-3 h-3 inline mr-1" />
                  We'll send your tax-deductible receipt to this email
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a prayer request or message..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Show on Thank You Wall option */}
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <input
                  type="checkbox"
                  id="showOnWall"
                  checked={showOnWall}
                  onChange={(e) => setShowOnWall(e.target.checked)}
                  className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                />
                <label htmlFor="showOnWall" className="text-sm text-gray-700">
                  <span className="font-medium">Display on Thank You Wall</span>
                  <p className="text-gray-500 text-xs">Share your name and message to encourage others</p>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('amount')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </div>
        ) : step === 'payment' && clientSecret ? (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Details</h2>
            <p className="text-gray-600 mb-6">
              Complete your donation of <span className="font-semibold">${(getAmount() / 100).toFixed(2)}</span>
            </p>

            <Elements stripe={stripePromise} options={{ 
              clientSecret,
              appearance: { 
                theme: 'stripe',
                variables: {
                  colorPrimary: '#f43f5e',
                }
              }
            }}>
              <DonationPaymentForm 
                amount={getAmount()}
                onSuccess={handleSuccess} 
                onCancel={() => { setStep('info'); setClientSecret(null); }}
              />
            </Elements>
          </div>
        ) : null}
      </div>
    </div>
  );
}
