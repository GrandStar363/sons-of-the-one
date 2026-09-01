import React, { useCallback } from 'react';
import { Shield, Lock, Eye, Database, Mail, ArrowLeft, FileText, Globe, Clock, UserCheck, AlertTriangle, Server } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigateBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigateBack }) => {
  const lastUpdated = "January 8, 2026";

  // Wrap the navigation handler to ensure it's called correctly
  const handleBackClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNavigateBack && typeof onNavigateBack === 'function') {
      onNavigateBack();
    }
  }, [onNavigateBack]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBackClick}
          className="flex items-center space-x-2 text-[#5EEAD4] hover:text-white mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E] flex items-center justify-center glow-teal">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/60">
            Sons of God Biblical Education Platform

          </p>
          <p className="text-white/40 text-sm mt-2">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gradient-to-br from-[#14B8A6]/10 via-[#0f2942] to-[#3B82F6]/10 border border-[#14B8A6]/30 rounded-2xl p-6 sm:p-8 mb-8">
          <p className="text-white/80 leading-relaxed">
            At <span className="text-[#5EEAD4] font-semibold">Sons' of the One LLC</span>, we are committed to protecting your privacy 
            and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use the Sons of God biblical education platform.
          </p>
        </div>



        {/* Section 1: Information We Collect */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6]/20 to-[#0D9488]/20 flex items-center justify-center border border-[#14B8A6]/30">
              <Database className="w-6 h-6 text-[#14B8A6]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">1. Information We Collect</h2>
              <p className="text-[#5EEAD4] text-sm font-medium">Types of Data Gathered</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#14B8A6]/20 rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Personal Information You Provide:</h3>
              <div className="grid gap-3">
                {[
                  {
                    title: 'Account Information',
                    description: 'Email address, display name, and password when you create an account.'
                  },
                  {
                    title: 'Profile Data',
                    description: 'Optional information you choose to add to your profile for personalization.'
                  },
                  {
                    title: 'Payment Information',
                    description: 'Billing details processed securely through our payment provider (Stripe). We do not store your full credit card information.'
                  },
                  {
                    title: 'Communication Data',
                    description: 'Information you provide when contacting our support team or submitting feedback.'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-[#14B8A6]/5 border border-[#14B8A6]/20 rounded-lg p-4">
                    <h4 className="text-[#5EEAD4] font-semibold mb-1">{item.title}</h4>
                    <p className="text-white/70 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Information Collected Automatically:</h3>
              <div className="grid gap-3">
                {[
                  {
                    title: 'Usage Data',
                    description: 'Reading progress, bookmarks, highlights, notes, trivia scores, and study plan progress.'
                  },
                  {
                    title: 'Device Information',
                    description: 'Browser type, operating system, and device identifiers for platform optimization.'
                  },
                  {
                    title: 'Log Data',
                    description: 'IP address, access times, and pages viewed for security and analytics purposes.'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-lg p-4">
                    <h4 className="text-[#60A5FA] font-semibold mb-1">{item.title}</h4>
                    <p className="text-white/70 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Your Information */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 flex items-center justify-center border border-[#F59E0B]/30">
              <Eye className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">2. How We Use Your Information</h2>
              <p className="text-[#F59E0B] text-sm font-medium">Purpose of Data Processing</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#F59E0B]/20 rounded-xl p-6 space-y-4">
            <p className="text-white/80 leading-relaxed">
              We use the information we collect for the following purposes:
            </p>

            <div className="grid gap-3">
              {[
                'Provide, maintain, and improve our biblical education services',
                'Personalize your learning experience and track your spiritual growth progress',
                'Process subscriptions and manage your account',
                'Send important notifications about your account or service updates',
                'Respond to your inquiries and provide customer support',
                'Analyze usage patterns to enhance platform features',
                'Ensure platform security and prevent fraud',
                'Comply with legal obligations'
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-3">
                  <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#F59E0B] text-sm font-bold">{index + 1}</span>
                  </span>
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Information Sharing */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#2563EB]/20 flex items-center justify-center border border-[#3B82F6]/30">
              <Globe className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">3. Information Sharing</h2>
              <p className="text-[#60A5FA] text-sm font-medium">When We Share Your Data</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#3B82F6]/20 rounded-xl p-6 space-y-6">
            <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-[#14B8A6] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-[#5EEAD4] font-bold mb-2">We Do NOT Sell Your Data</h4>
                  <p className="text-white/70">
                    We will never sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-white/80 leading-relaxed">
              We may share your information only in the following limited circumstances:
            </p>

            <div className="grid gap-4">
              {[
                {
                  title: 'Service Providers',
                  description: 'Trusted third-party services that help us operate our platform (e.g., Supabase for database, Stripe for payments). These providers are bound by confidentiality agreements.'
                },
                {
                  title: 'Legal Requirements',
                  description: 'When required by law, court order, or governmental authority, or to protect our rights and safety.'
                },
                {
                  title: 'Business Transfers',
                  description: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.'
                },
                {
                  title: 'With Your Consent',
                  description: 'When you explicitly authorize us to share specific information for a particular purpose.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-lg p-4">
                  <h4 className="text-[#60A5FA] font-semibold mb-2">{item.title}</h4>
                  <p className="text-white/70 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Data Security */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center border border-purple-500/30">
              <Server className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">4. Data Security</h2>
              <p className="text-purple-400 text-sm font-medium">How We Protect Your Information</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-purple-500/20 rounded-xl p-6 space-y-4">
            <p className="text-white/80 leading-relaxed">
              We implement industry-standard security measures to protect your personal information:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Lock,
                  title: 'Encryption',
                  description: 'All data is encrypted in transit (TLS/SSL) and at rest.'
                },
                {
                  icon: Shield,
                  title: 'Secure Infrastructure',
                  description: 'Hosted on secure, SOC 2 compliant cloud infrastructure.'
                },
                {
                  icon: UserCheck,
                  title: 'Access Controls',
                  description: 'Strict access controls limit who can view your data.'
                },
                {
                  icon: Eye,
                  title: 'Monitoring',
                  description: 'Continuous monitoring for suspicious activities.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <item.icon className="w-5 h-5 text-purple-400" />
                    <h4 className="text-purple-400 font-semibold">{item.title}</h4>
                  </div>
                  <p className="text-white/70 text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <p className="text-white/70 text-sm">
                  While we strive to protect your information, no method of transmission over the Internet is 100% secure. 
                  We encourage you to use strong passwords and protect your account credentials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Data Retention */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6]/20 to-[#0D9488]/20 flex items-center justify-center border border-[#14B8A6]/30">
              <Clock className="w-6 h-6 text-[#14B8A6]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">5. Data Retention</h2>
              <p className="text-[#5EEAD4] text-sm font-medium">How Long We Keep Your Data</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#14B8A6]/20 rounded-xl p-6 space-y-4">
            <p className="text-white/80 leading-relaxed">
              We retain your personal information for as long as necessary to:
            </p>

            <ul className="space-y-2">
              {[
                'Provide our services and maintain your account',
                'Comply with legal obligations and resolve disputes',
                'Enforce our agreements and protect our rights',
                'Fulfill the purposes outlined in this Privacy Policy'
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3 text-white/70">
                  <span className="w-2 h-2 mt-2 rounded-full bg-[#14B8A6] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg p-4">
              <h4 className="text-[#5EEAD4] font-semibold mb-2">Account Deletion</h4>
              <p className="text-white/70 text-sm">
                You may request deletion of your account and personal data at any time by contacting our support team. 
                We will process your request within 30 days, subject to any legal retention requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Your Rights */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 flex items-center justify-center border border-[#F59E0B]/30">
              <UserCheck className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">6. Your Rights</h2>
              <p className="text-[#F59E0B] text-sm font-medium">Control Over Your Data</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#F59E0B]/20 rounded-xl p-6 space-y-4">
            <p className="text-white/80 leading-relaxed">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>

            <div className="grid gap-3">
              {[
                {
                  title: 'Access',
                  description: 'Request a copy of the personal information we hold about you.'
                },
                {
                  title: 'Correction',
                  description: 'Request correction of inaccurate or incomplete personal information.'
                },
                {
                  title: 'Deletion',
                  description: 'Request deletion of your personal information, subject to legal requirements.'
                },
                {
                  title: 'Portability',
                  description: 'Request a copy of your data in a portable, machine-readable format.'
                },
                {
                  title: 'Opt-Out',
                  description: 'Opt out of marketing communications at any time.'
                },
                {
                  title: 'Withdraw Consent',
                  description: 'Withdraw consent for data processing where consent is the legal basis.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-4">
                  <h4 className="text-[#F59E0B] font-semibold mb-1">{item.title}</h4>
                  <p className="text-white/70 text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            <p className="text-white/60 text-sm">
              To exercise any of these rights, please contact us at <span className="text-[#5EEAD4]">support@sonsofgod.app</span>
            </p>
          </div>
        </section>

        {/* Section 7: Children's Privacy */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#2563EB]/20 flex items-center justify-center border border-[#3B82F6]/30">
              <Shield className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">7. Children's Privacy</h2>
              <p className="text-[#60A5FA] text-sm font-medium">Protection of Minors</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#3B82F6]/20 rounded-xl p-6">
            <p className="text-white/80 leading-relaxed">
              Our platform is intended for users aged 13 and older. We do not knowingly collect personal information 
              from children under 13. If you are under 18, we recommend using this platform with parental guidance. 
              If we discover that we have collected information from a child under 13, we will promptly delete it.
            </p>
          </div>
        </section>

        {/* Section 8: Contact Information */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6]/20 to-[#0D9488]/20 flex items-center justify-center border border-[#14B8A6]/30">
              <Mail className="w-6 h-6 text-[#14B8A6]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">8. Contact Us</h2>
              <p className="text-[#5EEAD4] text-sm font-medium">Questions About This Policy</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#14B8A6]/20 rounded-xl p-6 space-y-4">
            <p className="text-white/80 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#14B8A6]/10 to-[#0D9488]/10 border border-[#14B8A6]/30 rounded-xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="w-6 h-6 text-[#14B8A6]" />
                  <h4 className="text-white font-semibold">Email</h4>
                </div>
                <p className="text-[#5EEAD4] font-medium">privacy@sonsofgod.app</p>
                <p className="text-white/50 text-sm mt-2">For privacy-related inquiries</p>
              </div>

              <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/10 border border-[#F59E0B]/30 rounded-xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <FileText className="w-6 h-6 text-[#F59E0B]" />
                  <h4 className="text-white font-semibold">General Support</h4>
                </div>
                <p className="text-[#F59E0B] font-medium">support@sonsofgod.app</p>
                <p className="text-white/50 text-sm mt-2">For general questions</p>
              </div>
            </div>

            <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-xl p-5">
              <h4 className="text-[#60A5FA] font-bold mb-2">Sons' of the One LLC</h4>
              <p className="text-white/70 text-sm">
                Executive Director: <span className="text-white font-semibold">Rev. Robert E. Dorsey</span>
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Changes to This Policy */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center border border-purple-500/30">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">9. Changes to This Policy</h2>
              <p className="text-purple-400 text-sm font-medium">Policy Updates</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-purple-500/20 rounded-xl p-6">
            <p className="text-white/80 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any material changes by posting the updated policy on our platform and updating the 
              "Last Updated" date. Your continued use of the platform after such changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* Agreement Acknowledgment */}
        <div className="bg-gradient-to-br from-[#14B8A6]/20 via-[#0f2942] to-[#F59E0B]/20 border-2 border-[#14B8A6]/40 rounded-2xl p-6 sm:p-8 text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-[#14B8A6]" />
          <h3 className="text-xl font-serif font-bold text-white mb-3">
            Your Privacy Matters
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            By using Sons of God, you acknowledge that you have read and understood this Privacy Policy. 
            We are committed to protecting your privacy and handling your data responsibly as you grow in your faith journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleBackClick}
              className="px-8 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-xl hover:from-[#0D9488] hover:to-[#0F766E] transition-all shadow-lg shadow-teal-500/25 cursor-pointer"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3 bg-[#0c1929] border border-[#14B8A6]/40 text-[#5EEAD4] font-semibold rounded-xl hover:bg-[#14B8A6]/10 transition-all cursor-pointer"
            >
              Back to Top
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Sons' of the One LLC. All rights reserved.
          </p>
          <p className="text-white/30 text-xs mt-1">
            Your trust is important to us. We handle your data with care.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
