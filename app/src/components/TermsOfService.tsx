import React, { useCallback } from 'react';
import { Shield, BookOpen, AlertTriangle, UserCheck, Ban, Mail, Phone, ArrowLeft, Scale, FileText, Users, Lock } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigateBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigateBack }) => {
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
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            Terms of Service & User Agreement
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
            Welcome to Sons of God, a biblical education platform operated by <span className="text-[#5EEAD4] font-semibold">Sons' of the One LLC</span>. 
            By creating an account and using this platform, you agree to be bound by the following Terms of Service. 
            Please read these terms carefully before using our services.
          </p>
        </div>

        {/* Section 1: Purpose of the Platform */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 flex items-center justify-center border border-[#F59E0B]/30">
              <BookOpen className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">1. Purpose of the Platform</h2>
              <p className="text-[#F59E0B] text-sm font-medium">Biblical Education Only</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#14B8A6]/20 rounded-xl p-6 space-y-4">
            <p className="text-white/80 leading-relaxed">
              Sons of God is exclusively designed as a <span className="text-[#5EEAD4] font-semibold">biblical education platform</span>. 
              This platform is <span className="text-[#F59E0B] font-bold uppercase">NOT</span> a social media platform, dating service, 
              messaging application, or any form of social networking service.
            </p>

            <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg p-4">
              <h3 className="text-[#5EEAD4] font-semibold mb-3">The platform is intended solely for:</h3>
              <ul className="space-y-2">
                {[
                  'Personal Bible study and scripture reading',
                  'Learning biblical teachings and doctrines',
                  'Spiritual growth and discipleship training',
                  'Scripture memorization and meditation',
                  'Understanding the Word of God through the King James Version (KJV) 1611',
                  'Exploring the theme of sonship and our identity in Christ',
                  'Participating in Bible trivia for educational purposes',
                  'Tracking personal spiritual progress and reading plans'
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3 text-white/70">
                    <span className="w-2 h-2 mt-2 rounded-full bg-[#14B8A6] flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-white/60 text-sm italic">
              "For as many as are led by the Spirit of God, they are sons of God." — Romans 8:14 (KJV 1611)

            </p>
          </div>
        </section>


        {/* Section 2: Prohibited Activities */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center border border-red-500/30">
              <Ban className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">2. Communication Policy</h2>
              <p className="text-red-400 text-sm font-medium">Email Only — Outside This Platform</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-red-500/20 rounded-xl p-6 space-y-6">
            {/* Critical Warning Box */}
            <div className="bg-red-500/10 border-2 border-red-500/40 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-red-400 font-bold text-lg mb-2">CRITICAL POLICY — NO IN-PLATFORM COMMUNICATION</h3>
                  <p className="text-white font-semibold leading-relaxed">
                    This platform contains <span className="text-red-400 uppercase">NO communication features</span>. 
                    There is no messaging, chatting, commenting, or any form of direct interaction between users 
                    within this application — <span className="text-red-400 uppercase">Period</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Only - Primary Highlight */}
            <div className="bg-gradient-to-br from-[#14B8A6]/20 via-[#0f2942] to-[#14B8A6]/10 border-2 border-[#14B8A6]/50 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-[#5EEAD4] font-bold text-xl mb-3">COMMUNICATION BY EMAIL ONLY</h3>
                  <div className="space-y-3">
                    <p className="text-white font-semibold leading-relaxed">
                      If users wish to communicate with one another, they may share their <span className="text-[#14B8A6] font-bold">email addresses</span> for 
                      the purpose of communicating <span className="text-[#F59E0B] font-bold uppercase">outside of this platform</span>.
                    </p>
                    <div className="bg-[#0c1929]/70 rounded-lg p-4 border border-[#14B8A6]/30">
                      <ul className="space-y-2">
                        <li className="flex items-start space-x-3 text-white/90">
                          <span className="w-2 h-2 mt-2 rounded-full bg-[#14B8A6] flex-shrink-0" />
                          <span><span className="text-[#14B8A6] font-semibold">Email addresses</span> are the <span className="text-[#F59E0B] font-semibold">ONLY</span> form of contact information that may be shared</span>
                        </li>
                        <li className="flex items-start space-x-3 text-white/90">
                          <span className="w-2 h-2 mt-2 rounded-full bg-[#14B8A6] flex-shrink-0" />
                          <span><span className="text-[#14B8A6] font-semibold">ALL communication</span> must occur <span className="text-[#F59E0B] font-semibold">OUTSIDE</span> of this platform via email</span>
                        </li>
                        <li className="flex items-start space-x-3 text-white/90">
                          <span className="w-2 h-2 mt-2 rounded-full bg-[#14B8A6] flex-shrink-0" />
                          <span>This platform provides <span className="text-red-400 font-semibold">NO</span> internal messaging or communication features</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold">The following are strictly prohibited:</h3>
              
              <div className="grid gap-3">
                {[
                  'Sharing phone numbers, physical addresses, or social media handles',
                  'Attempting to use any platform feature for user-to-user communication',
                  'Using the platform for purposes other than biblical education',
                  'Creating or participating in chat rooms, forums, or discussion groups',
                  'Using the platform to arrange in-person meetings or gatherings',
                  'Any form of solicitation or networking beyond email sharing',
                  'Harassment, abuse, or inappropriate behavior of any kind'
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-sm font-bold">✕</span>
                    </span>
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/40 rounded-xl p-5">
              <h4 className="text-[#F59E0B] font-bold mb-2 flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>In Summary</span>
              </h4>
              <p className="text-white/90 leading-relaxed">
                Sons of God is a <span className="text-[#5EEAD4] font-semibold">biblical education platform only</span>. 

                Users may share email addresses to communicate with each other, but all such communication 
                must take place <span className="text-[#F59E0B] font-semibold">outside of this platform via email</span>. 
                No other personal contact information may be shared, and no communication features exist within this application.
              </p>
            </div>
          </div>
        </section>


        {/* Section 3: User Responsibilities */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#2563EB]/20 flex items-center justify-center border border-[#3B82F6]/30">
              <UserCheck className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">3. User Responsibilities</h2>
              <p className="text-[#60A5FA] text-sm font-medium">Your Commitments</p>
            </div>
          </div>
          <div className="bg-[#0c1929]/50 border border-[#3B82F6]/20 rounded-xl p-6 space-y-6">
            <p className="text-white/80 leading-relaxed">
              By using Sons of God, you agree to the following responsibilities:
            </p>


            <div className="grid gap-4">
              {[
                {
                  title: 'Use Platform for Intended Purpose',
                  description: 'You will use this platform exclusively for biblical education, personal spiritual growth, and scripture study as outlined in Section 1.'
                },
                {
                  title: 'Respect the No-Communication Policy',
                  description: 'You will not attempt to communicate with other users through any means within this platform, except for sharing email addresses for external communication.'
                },
                {
                  title: 'Maintain Account Security',
                  description: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
                },
                {
                  title: 'Provide Accurate Information',
                  description: 'You will provide accurate and truthful information when creating your account and will update this information as necessary.'
                },
                {
                  title: 'Respect Intellectual Property',
                  description: 'You will not copy, distribute, or misuse any content from this platform without proper authorization. Scripture quotations are from the King James Version (KJV) 1611, which is in the public domain.'
                },
                {
                  title: 'Report Violations',
                  description: 'If you observe any user attempting to violate these terms, particularly the no-communication policy, you are encouraged to report such behavior to our support team.'
                },
                {
                  title: 'Age Requirement',
                  description: 'You confirm that you are at least 13 years of age. Users under 18 should have parental consent to use this platform.'
                },
                {
                  title: 'Lawful Use',
                  description: 'You will use this platform in compliance with all applicable local, state, national, and international laws and regulations.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-lg p-4">
                  <h4 className="text-[#60A5FA] font-semibold mb-2 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-white/70 text-sm pl-8">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Account Termination Policy */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 flex items-center justify-center border border-[#F59E0B]/30">
              <Shield className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">4. Account Termination Policy</h2>
              <p className="text-[#F59E0B] text-sm font-medium">Enforcement & Consequences</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#F59E0B]/20 rounded-xl p-6 space-y-6">
            <p className="text-white/80 leading-relaxed">
              Sons' of the One LLC reserves the right to suspend or terminate user accounts under the following circumstances:
            </p>

            <div className="space-y-4">
              <h3 className="text-white font-semibold">Grounds for Immediate Termination:</h3>
              
              <div className="grid gap-3">
                {[
                  'Any attempt to communicate with other users within the platform (excluding email sharing as permitted)',
                  'Sharing personal information other than email addresses',
                  'Using the platform for purposes other than biblical education',
                  'Creating multiple accounts to circumvent restrictions',
                  'Harassment, abuse, or inappropriate behavior of any kind',
                  'Attempting to exploit, hack, or compromise platform security',
                  'Violating any provision of these Terms of Service',
                  'Any activity that undermines the educational mission of this platform'
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-3">
                    <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
              <h3 className="text-red-400 font-bold mb-3">Termination Process:</h3>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">1.</span>
                  <span><span className="text-white font-semibold">First Violation:</span> Warning notification and temporary suspension (24-72 hours)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">2.</span>
                  <span><span className="text-white font-semibold">Second Violation:</span> Extended suspension (7-30 days) with final warning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold">3.</span>
                  <span><span className="text-white font-semibold">Third Violation:</span> Permanent account termination without refund</span>
                </li>
              </ul>
              <p className="text-white/60 text-sm mt-4 italic">
                Note: Severe violations may result in immediate permanent termination without prior warning.
              </p>
            </div>

            <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg p-4">
              <h4 className="text-[#5EEAD4] font-semibold mb-2">Upon Termination:</h4>
              <ul className="space-y-1 text-white/70 text-sm">
                <li>• Your access to the platform will be immediately revoked</li>
                <li>• Your personal data will be handled according to our Privacy Policy</li>
                <li>• Any active subscriptions will be cancelled without refund for cause-based terminations</li>
                <li>• You may appeal the decision by contacting our support team within 14 days</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: Contact Information */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6]/20 to-[#0D9488]/20 flex items-center justify-center border border-[#14B8A6]/30">
              <Mail className="w-6 h-6 text-[#14B8A6]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">5. Contact Information</h2>
              <p className="text-[#5EEAD4] text-sm font-medium">Questions About These Terms</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-[#14B8A6]/20 rounded-xl p-6 space-y-6">
            <p className="text-white/80 leading-relaxed">
              If you have any questions, concerns, or need clarification about these Terms of Service, 
              please contact us through the following channels:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#14B8A6]/10 to-[#0D9488]/10 border border-[#14B8A6]/30 rounded-xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="w-6 h-6 text-[#14B8A6]" />
                  <h4 className="text-white font-semibold">Email Support</h4>
                </div>
                <p className="text-[#5EEAD4] font-medium">support@sonsofgod.app</p>
                <p className="text-white/50 text-sm mt-2">Response within 24-48 hours</p>
              </div>

              <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/10 border border-[#F59E0B]/30 rounded-xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <FileText className="w-6 h-6 text-[#F59E0B]" />
                  <h4 className="text-white font-semibold">Contact Form</h4>
                </div>
                <p className="text-[#F59E0B] font-medium">Use our Contact Us page</p>
                <p className="text-white/50 text-sm mt-2">Available in the app footer</p>
              </div>
            </div>

            <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-xl p-5">
              <div className="flex items-start space-x-4">
                <Users className="w-8 h-8 text-[#3B82F6] flex-shrink-0" />
                <div>
                  <h4 className="text-[#60A5FA] font-bold mb-2">Sons' of the One LLC</h4>
                  <p className="text-white/70 text-sm mb-2">
                    Executive Director: <span className="text-white font-semibold">Rev. Robert E. Dorsey</span>
                  </p>
                  <p className="text-white/60 text-sm italic">
                    "Holy and Accountable"..."WE ARE"...standing fast before mankind and <span className="text-[#FFD700] font-semibold">The Father</span>
                  </p>

                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-white/50 text-sm">
                We are committed to maintaining a safe, focused environment for biblical education.
                <br />
                Thank you for being part of our community of learners.
              </p>
            </div>
          </div>
        </section>

        {/* Data Usage Policy */}
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center border border-purple-500/30">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">6. Data Usage Policy</h2>
              <p className="text-purple-400 text-sm font-medium">How We Handle Your Information</p>
            </div>
          </div>

          <div className="bg-[#0c1929]/50 border border-purple-500/20 rounded-xl p-6 space-y-4">
            <p className="text-white/80 leading-relaxed">
              We collect and use your data solely to provide and improve our biblical education services:
            </p>

            <div className="grid gap-3">
              {[
                {
                  title: 'Account Information',
                  description: 'Email address and display name for account identification and communication about your account.'
                },
                {
                  title: 'Study Progress',
                  description: 'Reading plans, bookmarks, highlights, notes, and trivia scores to personalize your learning experience.'
                },
                {
                  title: 'Usage Analytics',
                  description: 'Anonymous usage data to improve platform features and content (no personal identification).'
                },
                {
                  title: 'Data Security',
                  description: 'All data is encrypted and stored securely. We never sell or share your personal information with third parties.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-1">{item.title}</h4>
                  <p className="text-white/70 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agreement Acknowledgment */}
        <div className="bg-gradient-to-br from-[#14B8A6]/20 via-[#0f2942] to-[#F59E0B]/20 border-2 border-[#14B8A6]/40 rounded-2xl p-6 sm:p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-[#14B8A6]" />
          <h3 className="text-xl font-serif font-bold text-white mb-3">
            Agreement Acknowledgment
          </h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            By creating an account on Sons of God, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Service. Your continued use of the platform 
            constitutes acceptance of any updates to these terms.
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
            Scripture quotations from the King James Version (KJV) 1611 - Public Domain
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
