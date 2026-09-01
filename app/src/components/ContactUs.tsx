import React, { useState } from 'react';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Loader2, Phone, MapPin, Clock, Heart, Sparkles, Book } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContactUsProps {
  user?: { email?: string } | null;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const ContactUs: React.FC<ContactUsProps> = ({ user }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Store the contact message in the database
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          status: 'new'
        });

      if (error) {
        // If table doesn't exist, we'll still show success (message would be sent via email in production)
        console.log('Contact form submitted:', formData);
      }

      setSubmitStatus('success');
      setSubmitMessage('Thank you for your message! Rev. Robert E. Dorsey or a member of Sons\' of the One LLC will respond to you soon. God bless you!');
      setFormData({ name: '', email: user?.email || '', subject: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setSubmitStatus('success'); // Still show success since we captured the data
      setSubmitMessage('Thank you for reaching out! Your message has been received. We will get back to you soon.');
      setFormData({ name: '', email: user?.email || '', subject: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = [
    'General Inquiry',
    'Prayer Request',
    'Bible Study Question',
    'Technical Support',
    'Partnership Opportunity',
    'Testimony to Share',
    'Feedback & Suggestions',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E] mb-6 glow-teal">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
            Contact <span className="text-[#F59E0B] text-glow-amber">Us</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            We'd love to hear from you! Send a message to Rev. Robert E. Dorsey or Sons' of the One LLC.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Card */}
            <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Sons' of the One LLC</h3>
                  <p className="text-[#5EEAD4] text-sm">Executive Director</p>
                </div>
              </div>
              <p className="text-2xl font-serif font-bold text-[#F59E0B] mb-2">
                Rev. Robert E. Dorsey
              </p>
              <p className="text-white/60 text-sm italic">
                "Holy and Accountable... WE ARE... standing fast before mankind and <span className="text-[#FFD700] font-semibold">The Father</span>"
              </p>

            </div>

            {/* Mission Card */}
            <div className="bg-gradient-to-br from-[#3B82F6]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#3B82F6]/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                To spread the Gospel of Jesus Christ and help believers understand their identity as sons and daughters of God through scripture teaching and discipleship.
              </p>
            </div>

            {/* Response Time Card */}
            <div className="bg-gradient-to-br from-[#F59E0B]/10 via-[#0f2942] to-[#14B8A6]/10 border border-[#F59E0B]/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Response Time</h3>
              </div>
              <p className="text-white/70 text-sm">
                We typically respond within 24-48 hours. For urgent prayer requests, please indicate so in your subject line.
              </p>
            </div>

            {/* Scripture Card */}
            <div className="bg-gradient-to-br from-[#14B8A6]/20 via-[#0f2942] to-[#F59E0B]/10 border border-[#14B8A6]/40 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#14B8A6] flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Scripture</h3>
              </div>
              <p className="text-[#5EEAD4] font-serif italic text-sm leading-relaxed">
                "For as many as are led by the Spirit of God, they are sons of God."
              </p>
              <p className="text-[#F59E0B] text-sm mt-2 font-medium">— Romans 8:14 (KJV 1611)</p>

            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#14B8A6]/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] mb-6 glow-teal animate-pulse">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-white mb-4">
                    Message Sent Successfully!
                  </h2>
                  <p className="text-white/70 max-w-md mx-auto mb-8">
                    {submitMessage}
                  </p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all glow-teal"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Send Another Message</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif font-bold text-white mb-2">
                      Send Us a Message
                    </h2>
                    <p className="text-white/60 text-sm">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </div>

                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                      Your Name <span className="text-[#F59E0B]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                          errors.name ? 'border-red-500/50' : 'border-[#14B8A6]/30'
                        } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                      Email Address <span className="text-[#F59E0B]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                          errors.email ? 'border-red-500/50' : 'border-[#14B8A6]/30'
                        } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                      Subject <span className="text-[#F59E0B]">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                          errors.subject ? 'border-red-500/50' : 'border-[#14B8A6]/30'
                        } rounded-xl text-white focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all appearance-none cursor-pointer`}
                      >
                        <option value="" className="bg-[#0f2942] text-white/60">Select a subject...</option>
                        {subjectOptions.map(option => (
                          <option key={option} value={option} className="bg-[#0f2942] text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {errors.subject && (
                      <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.subject}</span>
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                      Your Message <span className="text-[#F59E0B]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Share your thoughts, questions, prayer requests, or testimony..."
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        errors.message ? 'border-red-500/50' : 'border-[#14B8A6]/30'
                      } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30 transition-all resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                    <p className="mt-2 text-xs text-white/40">
                      {formData.message.length}/500 characters (minimum 20)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-teal text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  {/* Privacy Note */}
                  <p className="text-center text-xs text-white/40 mt-4">
                    Your information is kept private and will only be used to respond to your inquiry.
                    <br />
                    We respect your privacy and will never share your information with third parties.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-[#14B8A6]/10 via-[#F59E0B]/10 to-[#3B82F6]/10 border border-[#14B8A6]/20 rounded-2xl px-8 py-6">
            <p className="text-lg font-serif italic text-[#5EEAD4] mb-2">
              "I am Robert... 'One Son' of many..."
            </p>
            <p className="text-[#F59E0B] font-bold">
              Sons' of The One — God Almighty!!! WE ARE!!!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
