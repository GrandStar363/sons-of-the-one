import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { stripePromise, stripeEnabled } from '@/lib/stripe';
import { X, Check, Crown, Sparkles, BookOpen, Headphones, Star, Shield, Zap } from 'lucide-react';

interface PaymentFormProps {
  customerId: string;
  planType: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ customerId, planType, onSuccess, onCancel }: PaymentFormProps) {
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
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: window.location.origin },
        redirect: 'if_required',
      });

      if (setupError) {
        setError(setupError.message || 'Payment setup failed');
        setLoading(false);
        return;
      }

      if (setupIntent?.status === 'succeeded') {
        const { data, error: subError } = await supabase.functions.invoke('create-subscription', {
          body: { action: 'activate-subscription', customerId, planType }
        });

        if (subError || data?.error) {
          setError(data?.error || subError?.message || 'Failed to activate subscription');
          setLoading(false);
          return;
        }
        onSuccess();
      }
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
          className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Start Free Trial'}
        </button>
      </div>
      <p className="text-center text-xs text-gray-500">
        Your 3-day free trial starts today. Cancel anytime before it ends to avoid charges.
      </p>
    </form>
  );
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [step, setStep] = useState<'plans' | 'info' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('plans');
      setClientSecret(null);
      setCustomerId(null);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleStartSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-subscription', {
        body: { email, name, planType: selectedPlan, action: 'create-setup-intent' }
      });
      if (fnError || data?.error) throw new Error(data?.error || fnError?.message);
      
      setClientSecret(data.clientSecret);
      setCustomerId(data.customerId);
      setStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
  };

  if (!isOpen) return null;

  const features = [
    { icon: BookOpen, text: 'Full Bible Access with All Translations' },
    { icon: Headphones, text: 'Unlimited Audio Bible Listening' },
    { icon: Sparkles, text: 'AI-Powered Study Insights' },
    { icon: Star, text: 'Personalized Daily Devotionals' },
    { icon: Shield, text: 'Ad-Free Experience' },
    { icon: Zap, text: 'Advanced Scripture Memory Tools' },
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
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Premium!</h2>
            <p className="text-gray-600 mb-6">
              Your 3-day free trial has started. Enjoy all premium features!
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all"
            >
              Start Exploring
            </button>
          </div>
        ) : step === 'plans' ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-center text-white rounded-t-2xl">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Divine Word Premium</h2>
              <p className="text-amber-100">Deepen your faith with premium features</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">3-Day Free Trial</span>
              </div>
            </div>

            <div className="p-6">
              {/* Plan Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm text-gray-500 mb-1">Monthly</div>
                  <div className="text-2xl font-bold text-gray-900">$9.99</div>
                  <div className="text-xs text-gray-500">/month</div>
                  {selectedPlan === 'monthly' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === 'annual'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    Save 33%
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Annual</div>
                  <div className="text-2xl font-bold text-gray-900">$79.99</div>
                  <div className="text-xs text-gray-500">/year ($6.67/mo)</div>
                  {selectedPlan === 'annual' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-900">Premium Features Include:</h3>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-gray-700 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('info')}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
              >
                Start 3-Day Free Trial
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Cancel anytime. No commitment required.
              </p>
            </div>
          </>
        ) : step === 'info' ? (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-gray-600 mb-6">
              Enter your details to start your {selectedPlan === 'annual' ? 'annual' : 'monthly'} subscription with a 3-day free trial.
            </p>

            <form onSubmit={handleStartSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">
                    {selectedPlan === 'annual' ? 'Annual Plan' : 'Monthly Plan'}
                  </span>
                  <span className="font-bold text-gray-900">
                    {selectedPlan === 'annual' ? '$79.99/year' : '$9.99/month'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Due today</span>
                  <span className="font-semibold text-green-600">$0.00 (3-day trial)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('plans')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        ) : step === 'payment' && clientSecret && customerId ? (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Details</h2>
            <p className="text-gray-600 mb-6">
              Add your payment method to start your 3-day free trial.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="w-5 h-5" />
                <span className="font-medium">You won't be charged today</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Your free trial lasts 3 days. Cancel anytime before it ends.
              </p>
            </div>

            <Elements stripe={stripePromise} options={{ 
              clientSecret,
              appearance: { 
                theme: 'stripe',
                variables: {
                  colorPrimary: '#f59e0b',
                }
              }
            }}>
              <PaymentForm 
                customerId={customerId}
                planType={selectedPlan}
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
