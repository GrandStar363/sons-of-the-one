import React, { useState } from 'react';
import { useAppContext, BIBLE_VERSIONS, BibleVersion } from '@/contexts/AppContext';
import { Book, Star, ChevronDown, Check } from 'lucide-react';

interface BibleVersionSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown';
  showDescription?: boolean;
  className?: string;
}

const BibleVersionSelector: React.FC<BibleVersionSelectorProps> = ({
  variant = 'dropdown',
  showDescription = false,
  className = '',
}) => {
  const { selectedVersion, setSelectedVersion, availableVersions } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectVersion = (version: BibleVersion) => {
    setSelectedVersion(version);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/40 rounded-lg text-[#F59E0B] hover:from-[#F59E0B]/30 hover:to-[#D97706]/30 transition-all ${className}`}
        >
          <Book className="w-3.5 h-3.5" />
          <span className="font-medium text-sm">{selectedVersion.abbreviation}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-56 bg-[#081420] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
              {availableVersions.map(version => (
                <button
                  key={version.id}
                  onClick={() => handleSelectVersion(version)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    selectedVersion.id === version.id
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <span className="font-medium">{version.abbreviation}</span>
                    <p className="text-xs text-white/50">{version.name}</p>
                  </div>
                  {selectedVersion.id === version.id && (
                    <Check className="w-4 h-4 text-[#F59E0B]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`bg-gradient-to-br from-[#0f2942] to-[#0c1929] border border-[#F59E0B]/30 rounded-2xl p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/20 flex items-center justify-center">
            <Book className="w-6 h-6 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bible Translation</h3>
            <p className="text-white/60 text-sm">Choose your preferred version</p>
          </div>
        </div>

        {/* Version Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableVersions.map(version => (
            <button
              key={version.id}
              onClick={() => handleSelectVersion(version)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedVersion.id === version.id
                  ? 'bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/10 border-2 border-[#F59E0B]/50'
                  : 'bg-white/5 border border-white/10 hover:border-[#F59E0B]/30 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold ${selectedVersion.id === version.id ? 'text-[#F59E0B]' : 'text-white'}`}>
                  {version.abbreviation}
                </span>
                {selectedVersion.id === version.id && (
                  <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] text-xs rounded-full flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Selected</span>
                  </span>
                )}
                {version.isDefault && selectedVersion.id !== version.id && (
                  <span className="px-2 py-0.5 bg-white/10 text-white/60 text-xs rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm">{version.name}</p>
              <p className="text-white/50 text-xs mt-1">{version.description}</p>
            </button>
          ))}
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl">
          <div className="flex items-start space-x-3">
            <Book className="w-5 h-5 text-[#14B8A6] flex-shrink-0 mt-0.5" />
            <div className="text-white/80 text-sm">
              <p className="font-medium text-[#14B8A6] mb-1">About Bible Versions</p>
              <p>
                Each translation offers a unique perspective on Scripture. The KJV 1611 is known for its 
                majestic language, while modern translations like NIV and NLT offer contemporary readability.
                Choose the version that speaks most clearly to your heart.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/40 rounded-xl text-[#F59E0B] hover:from-[#F59E0B]/30 hover:to-[#D97706]/30 transition-all cursor-pointer"
      >
        <Book className="w-4 h-4 text-[#F59E0B]" />
        <div className="text-left">
          <span className="font-medium text-sm">{selectedVersion.abbreviation}</span>
          {showDescription && (
            <p className="text-white/50 text-xs">{selectedVersion.name}</p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-[#081420] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-white/10">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Select Bible Version</p>
            </div>
            {availableVersions.map(version => (
              <button
                key={version.id}
                onClick={() => handleSelectVersion(version)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                  selectedVersion.id === version.id
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{version.abbreviation}</span>
                    {version.isDefault && (
                      <span className="px-1.5 py-0.5 bg-white/10 text-white/50 text-[10px] rounded">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{version.name}</p>
                </div>
                {selectedVersion.id === version.id && (
                  <Check className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BibleVersionSelector;
