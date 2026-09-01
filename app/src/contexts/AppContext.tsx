import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

// Bible version definitions - Multiple versions available
export interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  description: string;
  isDefault?: boolean;
  requiresApi?: boolean;
}

// Available Bible versions
export const BIBLE_VERSIONS: BibleVersion[] = [
  {
    id: 'kjv1611',
    name: 'King James Version 1611',
    abbreviation: 'KJV 1611',
    language: 'English',
    description: 'The Authorized King James Version (1611) - The Holy Bible',
    isDefault: true,
    requiresApi: false,
  },
  {
    id: 'nkjv',
    name: 'New King James Version',
    abbreviation: 'NKJV',
    language: 'English',
    description: 'Modern English update of the KJV maintaining traditional style',
    isDefault: false,
    requiresApi: false,
  },
  {
    id: 'niv',
    name: 'New International Version',
    abbreviation: 'NIV',
    language: 'English',
    description: 'Popular modern English translation for readability',
    isDefault: false,
    requiresApi: false,
  },
  {
    id: 'esv',
    name: 'English Standard Version',
    abbreviation: 'ESV',
    language: 'English',
    description: 'Essentially literal translation combining accuracy with readability',
    isDefault: false,
    requiresApi: false,
  },
  {
    id: 'nasb',
    name: 'New American Standard Bible',
    abbreviation: 'NASB',
    language: 'English',
    description: 'Literal word-for-word translation known for accuracy',
    isDefault: false,
    requiresApi: false,
  },
  {
    id: 'nlt',
    name: 'New Living Translation',
    abbreviation: 'NLT',
    language: 'English',
    description: 'Thought-for-thought translation in contemporary English',
    isDefault: false,
    requiresApi: false,
  },
  {
    id: 'amp',
    name: 'Amplified Bible',
    abbreviation: 'AMP',
    language: 'English',
    description: 'Expanded translation with additional clarifying words',
    isDefault: false,
    requiresApi: false,
  },
];

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  // Bible version preference
  selectedVersion: BibleVersion;
  setSelectedVersion: (version: BibleVersion) => void;
  availableVersions: BibleVersion[];
  apiKeyConfigured: boolean;
}

const defaultVersion = BIBLE_VERSIONS[0]; // KJV 1611

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  selectedVersion: defaultVersion,
  setSelectedVersion: () => {},
  availableVersions: BIBLE_VERSIONS,
  apiKeyConfigured: false,
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Load saved version from localStorage or use default
  const [selectedVersion, setSelectedVersionState] = useState<BibleVersion>(() => {
    const saved = localStorage.getItem('selectedBibleVersion');
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = BIBLE_VERSIONS.find(v => v.id === parsed.id);
      return found || defaultVersion;
    }
    return defaultVersion;
  });

  // API key not needed for local versions
  const [apiKeyConfigured] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Allow version selection
  const setSelectedVersion = (version: BibleVersion) => {
    setSelectedVersionState(version);
    localStorage.setItem('selectedBibleVersion', JSON.stringify(version));
    toast({
      title: 'Bible Version Changed',
      description: `Now using ${version.name} (${version.abbreviation})`,
      duration: 3000,
    });
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        selectedVersion,
        setSelectedVersion,
        availableVersions: BIBLE_VERSIONS,
        apiKeyConfigured,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
