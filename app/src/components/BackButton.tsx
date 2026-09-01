import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  show: boolean;
  previousSection?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, show, previousSection }) => {
  if (!show) return null;

  // Format section name for display
  const formatSectionName = (section: string) => {
    const sectionNames: Record<string, string> = {
      'home': 'Home',
      'bible': 'Bible',
      'plans': 'Reading Plans',
      'bookmarks': 'Bookmarks',
      'baptism': 'Baptism Journey',
      'memory': 'Scripture Memory',
      'journal': 'Journal',
      'audio': 'Audio Bible',
      'compare': 'Compare Versions',
      'notifications': 'Notifications',
      'churches': 'Church Finder',
      'daily-reading': 'Daily Reading',
      'faith-wonder': 'Faith & Wonder',
      'trivia': 'Bible Trivia',
      'daily-trivia': 'Daily Challenge',
      'contact': 'Contact Us',
      'profile': 'Profile',
      'lessons': 'Lessons',
      'certificates': 'Certificates',
      'leaderboard': 'Leaderboard',
      'daily-reminders': 'Reminders',
      'multiplayer-trivia': 'Multiplayer',
      'tournament': 'Tournament',
      'spectator': 'Spectator Mode',
      'terms-of-service': 'Terms',
      'prayer-wall': 'Prayer Wall',
      'devotional-emails': 'Devotional Emails',
      'wwjd': 'WWJD',
    };
    return sectionNames[section] || section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ');
  };

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-50 group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-semibold rounded-full shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:from-[#0D9488] hover:to-[#0F766E] transition-all duration-300 transform hover:scale-105"
      aria-label={`Go back to ${previousSection ? formatSectionName(previousSection) : 'previous page'}`}
    >
      {/* Back Arrow Icon */}
      <svg 
        className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      
      {/* Text with previous section name */}
      <span className="hidden sm:inline">
        Back{previousSection && previousSection !== 'home' ? ` to ${formatSectionName(previousSection)}` : ''}
      </span>
      
      {/* Mobile: Just show "Back" */}
      <span className="sm:hidden">Back</span>
      
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-[#14B8A6] animate-ping opacity-20" />
    </button>
  );
};

export default BackButton;
