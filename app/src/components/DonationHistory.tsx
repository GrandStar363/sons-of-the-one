import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { stripePromise, stripeEnabled } from '@/lib/stripe';
import { 
  X, Heart, Gift, Calendar, DollarSign, Users, Globe, BookOpen, 
  TrendingUp, Clock, Check, RefreshCw, ChevronDown, ChevronUp,
  Sparkles, Award, HandHeart, Languages, Download, ArrowRight,
  Mail, FileText, Share2, ExternalLink, AlertCircle
} from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  status: string;
  donation_type: string;
  message: string | null;
  created_at: string;
  completed_at: string | null;
  receipt_number: string | null;
  email_receipt_sent: boolean;
  email_send_error: string | null;
  email_send_attempts: number;
}

interface RecurringDonation {
  id: string;
  amount: number;
  status: string;
  next_billing_date: string | null;
  created_at: string;
  cancelled_at: string | null;
  stripe_subscription_id: string;
}

interface PublicDonor {
  name: string;
  amount: number;
  message: string | null;
  created_at: string;
}

interface ImpactMetric {
  metric_name: string;
  metric_value: number;
  description: string;
  icon: string;
}

interface RecurringPaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  customerId: string;
  amount: number;
  email: string;
  name: string;
}

function RecurringPaymentForm({ onSuccess, onCancel, customerId, amount, email, name }: RecurringPaymentFormProps) {
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
        const { data, error: subError } = await supabase.functions.invoke('create-recurring-donation', {
          body: { action: 'activate-recurring', customerId, amount, email, name }
        });

        if (subError || data?.error) {
          setError(data?.error || subError?.message || 'Failed to activate recurring donation');
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
      <div className="flex gap-3">
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
          className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Start $${(amount / 100).toFixed(0)}/mo`}
        </button>
      </div>
    </form>
  );
}

interface DonationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

const recurringAmounts = [
  { value: 1000, label: '$10/mo', description: 'Supporter' },
  { value: 2500, label: '$25/mo', description: 'Partner' },
  { value: 5000, label: '$50/mo', description: 'Champion' },
  { value: 10000, label: '$100/mo', description: 'Ambassador' },
];

export default function DonationHistory({ isOpen, onClose, userEmail }: DonationHistoryProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'wall' | 'impact' | 'recurring'>('history');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>([]);
  const [publicDonors, setPublicDonors] = useState<PublicDonor[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReceipt, setSendingReceipt] = useState<string | null>(null);
  
  // Recurring donation state
  const [recurringStep, setRecurringStep] = useState<'select' | 'info' | 'payment'>('select');
  const [selectedRecurringAmount, setSelectedRecurringAmount] = useState(2500);
  const [recurringEmail, setRecurringEmail] = useState(userEmail || '');
  const [recurringName, setRecurringName] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [recurringLoading, setRecurringLoading] = useState(false);
  const [recurringSuccess, setRecurringSuccess] = useState(false);

  const [expandedHistory, setExpandedHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userEmail]);

  useEffect(() => {
    if (!isOpen) {
      setRecurringStep('select');
      setClientSecret(null);
      setRecurringSuccess(false);
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load user's donation history if email provided
      if (userEmail) {
        const { data: historyData, error: historyError } = await supabase.functions.invoke('get-donation-history', {
          body: { email: userEmail }
        });
        if (!historyError && historyData) {
          setDonations(historyData.donations || []);
          setRecurringDonations(historyData.recurringDonations || []);
          setLifetimeTotal(historyData.lifetimeTotal || 0);
          setTotalDonations(historyData.totalDonations || 0);
        }
      }

      // Load public donors
      const { data: publicData } = await supabase.functions.invoke('get-donation-history', {
        body: { action: 'get-public-donors' }
      });
      if (publicData?.donors) {
        setPublicDonors(publicData.donors);
      }

      // Load impact metrics
      const { data: impactData } = await supabase.functions.invoke('get-donation-history', {
        body: { action: 'get-impact-metrics' }
      });
      if (impactData?.metrics) {
        setImpactMetrics(impactData.metrics);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendReceipt = async (donationId: string) => {
    setSendingReceipt(donationId);
    try {
      const { data, error } = await supabase.functions.invoke('send-donation-receipt', {
        body: { donationId }
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      
      // Update the donation in state
      setDonations(prev => prev.map(d => 
        d.id === donationId 
          ? { ...d, email_receipt_sent: true, receipt_number: data.receiptNumber }
          : d
      ));
      alert('Receipt sent successfully!');
    } catch (err: any) {
      alert('Failed to send receipt: ' + err.message);
    } finally {
      setSendingReceipt(null);
    }
  };

  const handleStartRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurringEmail) return;
    setRecurringLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-recurring-donation', {
        body: { 
          email: recurringEmail, 
          name: recurringName,
          amount: selectedRecurringAmount,
          action: 'create-setup-intent' 
        }
      });
      if (fnError || data?.error) throw new Error(data?.error || fnError?.message);
      
      setClientSecret(data.clientSecret);
      setCustomerId(data.customerId);
      setRecurringStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRecurringLoading(false);
    }
  };

  const handleRecurringSuccess = () => {
    setRecurringSuccess(true);
    loadData();
  };

  const handleCancelRecurring = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this recurring donation? Your support means so much to our ministry.')) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-recurring-donation', {
        body: { action: 'cancel', subscriptionId }
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateStr);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      book: <BookOpen className="w-6 h-6" />,
      globe: <Globe className="w-6 h-6" />,
      heart: <Heart className="w-6 h-6" />,
      users: <Users className="w-6 h-6" />,
      languages: <Languages className="w-6 h-6" />,
      download: <Download className="w-6 h-6" />
    };
    return icons[iconName] || <Sparkles className="w-6 h-6" />;
  };

  if (!isOpen) return null;

  const displayedDonations = expandedHistory ? donations : donations.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <HandHeart className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Giving & Impact</h2>
              <p className="text-rose-100">See how your generosity spreads God's word</p>
            </div>
          </div>

          {userEmail && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-rose-100 text-sm">Lifetime Giving</p>
                <p className="text-2xl font-bold">${(lifetimeTotal / 100).toFixed(2)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-rose-100 text-sm">Total Donations</p>
                <p className="text-2xl font-bold">{totalDonations}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'history', label: 'My History', icon: Clock },
            { id: 'wall', label: 'Thank You Wall', icon: Heart },
            { id: 'impact', label: 'Impact', icon: TrendingUp },
            { id: 'recurring', label: 'Monthly Giving', icon: RefreshCw },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-4">
              {!userEmail ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Enter your email to view your donation history</p>
                  <p className="text-gray-400 text-sm">Your giving history will appear here</p>
                </div>
              ) : donations.length === 0 && recurringDonations.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No donations yet</p>
                  <p className="text-gray-400 text-sm">Your generosity will be recorded here</p>
                </div>
              ) : (
                <>
                  {/* Active Recurring Donations */}
                  {recurringDonations.filter(rd => rd.status === 'active').length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-emerald-600" />
                        Active Monthly Giving
                      </h3>
                      {recurringDonations.filter(rd => rd.status === 'active').map((rd) => (
                        <div key={rd.id} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-emerald-800">
                                ${(rd.amount / 100).toFixed(0)}/month
                              </p>
                              <p className="text-sm text-emerald-600">
                                Next billing: {rd.next_billing_date ? formatDate(rd.next_billing_date) : 'Soon'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCancelRecurring(rd.stripe_subscription_id)}
                              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* One-time Donations */}
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-rose-600" />
                    Donation History
                  </h3>
                  {displayedDonations.map((donation) => (
                    <div
                      key={donation.id}
                      className="p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            donation.status === 'completed' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {donation.status === 'completed' ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              ${(donation.amount / 100).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(donation.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          donation.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status}
                        </span>
                      </div>
                      
                      {/* Receipt Info */}
                      {donation.status === 'completed' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-400" />
                              {donation.receipt_number ? (
                                <span className="text-gray-600">
                                  Receipt: <span className="font-mono text-gray-800">{donation.receipt_number}</span>
                                </span>
                              ) : (
                                <span className="text-gray-500">No receipt generated</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {donation.email_receipt_sent ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-600">
                                  <Mail className="w-3 h-3" />
                                  Sent
                                </span>
                              ) : donation.email_send_error ? (
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1 text-xs text-red-600" title={donation.email_send_error}>
                                    <AlertCircle className="w-3 h-3" />
                                    Failed
                                  </span>
                                  {userEmail && (
                                    <button
                                      onClick={() => handleResendReceipt(donation.id)}
                                      disabled={sendingReceipt === donation.id}
                                      className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
                                    >
                                      <RefreshCw className={`w-3 h-3 ${sendingReceipt === donation.id ? 'animate-spin' : ''}`} />
                                      {sendingReceipt === donation.id ? 'Retrying...' : 'Retry'}
                                    </button>
                                  )}
                                </div>
                              ) : userEmail && (
                                <button
                                  onClick={() => handleResendReceipt(donation.id)}
                                  disabled={sendingReceipt === donation.id}
                                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
                                >
                                  <Mail className="w-3 h-3" />
                                  {sendingReceipt === donation.id ? 'Sending...' : 'Send Receipt'}
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Show error message if exists */}
                          {donation.email_send_error && (
                            <p className="text-xs text-red-500 mt-1">
                              Error: {donation.email_send_error}
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  ))}

                  {donations.length > 5 && (
                    <button
                      onClick={() => setExpandedHistory(!expandedHistory)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-rose-600 hover:text-rose-700 font-medium"
                    >
                      {expandedHistory ? (
                        <>Show Less <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Show All ({donations.length}) <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'wall' ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Thank You Wall</h3>
                <p className="text-gray-500 text-sm">Celebrating our generous supporters</p>
              </div>

              {publicDonors.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Be the first to appear on our thank you wall!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {publicDonors.map((donor, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {donor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{donor.name}</p>
                            <p className="text-sm text-amber-600">{formatTimeAgo(donor.created_at)}</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-amber-600">
                          ${(donor.amount / 100).toFixed(0)}
                        </span>
                      </div>
                      {donor.message && (
                        <p className="mt-3 text-gray-600 text-sm italic border-l-2 border-amber-300 pl-3">
                          "{donor.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'impact' ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Your Impact</h3>
                <p className="text-gray-500 text-sm">See how donations are spreading God's word</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {impactMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                      {getIconComponent(metric.icon)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.metric_value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl p-6 text-white text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-3" />
                <h4 className="text-lg font-semibold mb-2">Every Gift Matters</h4>
                <p className="text-rose-100 text-sm mb-4">
                  Your generosity helps us develop new features, reach more people, and spread God's word to every corner of the earth.
                </p>
                <button
                  onClick={() => setActiveTab('recurring')}
                  className="inline-flex items-center gap-2 bg-white text-rose-600 px-6 py-2 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
                >
                  Become a Monthly Partner <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : activeTab === 'recurring' ? (
            <div className="space-y-4">
              {recurringSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-white fill-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-2">
                    You're now a monthly partner giving <span className="font-semibold">${(selectedRecurringAmount / 100).toFixed(0)}/month</span>
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    Your faithful giving will help spread God's word every month.
                  </p>
                  <button
                    onClick={() => {
                      setRecurringSuccess(false);
                      setActiveTab('history');
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
                  >
                    View My Giving
                  </button>
                </div>
              ) : recurringStep === 'select' ? (
                <>
                  <div className="text-center mb-6">
                    <RefreshCw className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Giving</h3>
                    <p className="text-gray-500 text-sm">Join our community of faithful monthly supporters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {recurringAmounts.map((amount) => (
                      <button
                        key={amount.value}
                        onClick={() => setSelectedRecurringAmount(amount.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedRecurringAmount === amount.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <p className="text-lg font-bold text-gray-900">{amount.label}</p>
                        <p className="text-sm text-emerald-600">{amount.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-emerald-800 mb-2">Monthly Partner Benefits:</h4>
                    <ul className="space-y-2 text-sm text-emerald-700">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Exclusive monthly prayer updates
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Early access to new features
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Special recognition on Thank You Wall
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Cancel anytime with no obligation
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setRecurringStep('info')}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
                  >
                    Continue with ${(selectedRecurringAmount / 100).toFixed(0)}/month
                  </button>
                </>
              ) : recurringStep === 'info' ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Information</h3>
                  <p className="text-gray-600 mb-6">
                    Set up your monthly gift of <span className="font-semibold">${(selectedRecurringAmount / 100).toFixed(0)}/month</span>
                  </p>

                  <form onSubmit={handleStartRecurring} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={recurringName}
                        onChange={(e) => setRecurringName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={recurringEmail}
                        onChange={(e) => setRecurringEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setRecurringStep('select')}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={recurringLoading || !recurringEmail}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold disabled:opacity-50"
                      >
                        {recurringLoading ? 'Loading...' : 'Continue to Payment'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : recurringStep === 'payment' && clientSecret && customerId ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Details</h3>
                  <p className="text-gray-600 mb-6">
                    Complete your monthly gift of <span className="font-semibold">${(selectedRecurringAmount / 100).toFixed(0)}/month</span>
                  </p>

                  <Elements stripe={stripePromise} options={{ 
                    clientSecret,
                    appearance: { 
                      theme: 'stripe',
                      variables: { colorPrimary: '#10b981' }
                    }
                  }}>
                    <RecurringPaymentForm 
                      customerId={customerId}
                      amount={selectedRecurringAmount}
                      email={recurringEmail}
                      name={recurringName}
                      onSuccess={handleRecurringSuccess} 
                      onCancel={() => { setRecurringStep('info'); setClientSecret(null); }}
                    />
                  </Elements>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
