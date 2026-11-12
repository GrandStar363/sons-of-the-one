import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

// The Back bar under the header on every page except Home.
//
// It stays put while you scroll, and steps back exactly like the phone's own
// Back: out of an open lesson/plan/game first, then to the previous page.

interface BackButtonProps {
  onBack: () => void;
  onHome: () => void;
  title: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onBack, onHome, title }) => (
  <div className="sticky top-16 sm:top-20 z-40 border-b border-[#14B8A6]/25 bg-[#0c1929]/95 backdrop-blur-md">
    <div className="max-w-7xl mx-auto flex h-12 items-center gap-3 px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#14B8A6]/50 bg-[#14B8A6]/20 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#14B8A6]/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/70"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>
      <h2 className="min-w-0 flex-1 truncate text-center font-serif text-base font-semibold text-white/90 sm:text-lg">
        {title}
      </h2>
      <button
        type="button"
        onClick={onHome}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/70"
        aria-label="Go to the home page"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Home</span>
      </button>
    </div>
  </div>
);

export default BackButton;
