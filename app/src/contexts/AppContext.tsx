import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

// Bible version definitions.
//
// Every version listed here is the full Bible (Genesis to Revelation), loaded
// chapter by chapter from bible-api.com (lib/bibleText.ts). All are public
// domain except La Biblia en Español Sencillo (CC BY 4.0, credited in the
// reader). Copyrighted versions (NIV, NKJV, ESV, NASB, NLT, AMP) need a licence
// from their publishers before they can be shown, so they are not listed.
export interface BibleVersion {
  id: string;
  /** bible-api.com translation id */
  apiId: string;
  name: string;
  abbreviation: string;
  language: string;
  description: string;
  license?: string;
  isDefault?: boolean;
  requiresApi?: boolean;
}

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: 'kjv1611', apiId: 'kjv', abbreviation: 'KJV', name: 'King James Version', language: 'English', description: 'The Authorized King James Version: the classic English Bible', license: 'Public Domain', isDefault: true, requiresApi: false },
  { id: 'bsb', apiId: 'bsb', abbreviation: 'BSB', name: 'Berean Standard Bible', language: 'English', description: 'Modern, accurate and easy to read', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'web', apiId: 'web', abbreviation: 'WEB', name: 'World English Bible', language: 'English', description: 'Modern English update of the American Standard Version', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'asv', apiId: 'asv', abbreviation: 'ASV', name: 'American Standard Version (1901)', language: 'English', description: 'Word-for-word classic, close to the KJV', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'bbe', apiId: 'bbe', abbreviation: 'BBE', name: 'Bible in Basic English', language: 'English', description: 'Simple English, easy for new readers', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'darby', apiId: 'darby', abbreviation: 'DARBY', name: 'Darby Bible', language: 'English', description: 'Literal translation by J. N. Darby', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'dra', apiId: 'dra', abbreviation: 'DRA', name: 'Douay-Rheims Bible', language: 'English', description: 'Traditional Catholic English Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'webbe', apiId: 'webbe', abbreviation: 'WEBBE', name: 'World English Bible (British)', language: 'English', description: 'British spelling edition of the WEB', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'bes', apiId: 'bes', abbreviation: 'BES', name: 'La Biblia en Español Sencillo', language: 'Español', description: 'Biblia en español sencillo', license: 'CC BY 4.0', isDefault: false, requiresApi: false },
  { id: 'cuv-simp', apiId: 'cuv-simp', abbreviation: 'CUVS', name: '和合本 (简体)', language: '中文', description: 'Chinese Union Version, Simplified', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'cuv', apiId: 'cuv', abbreviation: 'CUV', name: '和合本 (繁體)', language: '中文', description: 'Chinese Union Version, Traditional', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'korean', apiId: 'korean', abbreviation: 'KRV', name: '개역한글', language: '한국어', description: 'Korean Revised Version', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'kougo', apiId: 'kougo', abbreviation: '口語訳', name: '口語訳聖書', language: '日本語', description: 'Japanese Colloquial Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'synodal', apiId: 'synodal', abbreviation: 'SYNO', name: 'Синодальный перевод', language: 'Русский', description: 'Russian Synodal Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'riveduta', apiId: 'riveduta', abbreviation: 'RIV', name: 'Riveduta (Luzzi, 1924)', language: 'Italiano', description: 'Italian Riveduta Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'statenvertaling', apiId: 'statenvertaling', abbreviation: 'SV', name: 'Statenvertaling', language: 'Nederlands', description: 'Dutch States Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'rccv', apiId: 'rccv', abbreviation: 'RCCV', name: 'Cornilescu Corectată', language: 'Română', description: 'Romanian Corrected Cornilescu', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'gdanska', apiId: 'gdanska', abbreviation: 'PBG', name: 'Biblia Gdańska', language: 'Polski', description: 'Polish Gdańsk Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'karoli', apiId: 'karoli', abbreviation: 'KAR', name: 'Károli Biblia', language: 'Magyar', description: 'Hungarian Károli Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'bkr', apiId: 'bkr', abbreviation: 'BKR', name: 'Bible kralická', language: 'Čeština', description: 'Czech Kralice Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'tagalog', apiId: 'tagalog', abbreviation: 'ADB', name: 'Ang Dating Biblia', language: 'Tagalog', description: 'Tagalog Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'cadman', apiId: 'cadman', abbreviation: 'VI1934', name: 'Kinh Thánh 1934', language: 'Tiếng Việt', description: 'Vietnamese Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'norwegian', apiId: 'norwegian', abbreviation: 'NOR', name: 'Norsk Bibel', language: 'Norsk', description: 'Norwegian Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'swedish', apiId: 'swedish', abbreviation: 'SVE', name: 'Svenska Bibeln', language: 'Svenska', description: 'Swedish Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'danish', apiId: 'danish', abbreviation: 'DAN', name: 'Danske Bibel', language: 'Dansk', description: 'Danish Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'biblia', apiId: 'biblia', abbreviation: 'FIN', name: 'Raamattu', language: 'Suomi', description: 'Finnish Bible', license: 'Public Domain', isDefault: false, requiresApi: false },
  { id: 'clementine', apiId: 'clementine', abbreviation: 'VUL', name: 'Biblia Sacra Vulgata', language: 'Latina', description: 'Clementine Latin Vulgate', license: 'Public Domain', isDefault: false, requiresApi: false },
];

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
