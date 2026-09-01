import React from 'react';
import { Book, Heart, Mail, ExternalLink, Users, Bell, Church, CalendarDays, Sparkles, Scale } from 'lucide-react';
import { oldTestament, newTestament } from '@/data/bibleData';
interface FooterProps {
  onNavigate: (section: string) => void;
  onSelectBook: (book: string) => void;
}
const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSelectBook
}) => {
  const quickLinks = [{
    label: 'Home',
    action: () => onNavigate('home')
  }, {
    label: 'Scripture',
    action: () => onNavigate('bible')
  }, {
    label: 'Audio Bible',
    action: () => onNavigate('audio')
  }, {
    label: 'Compare Translations',
    action: () => onNavigate('compare')
  }, {
    label: 'Scripture Memory',
    action: () => onNavigate('memory')
  }, {
    label: 'WWJD',
    action: () => onNavigate('wwjd')
  }, {
    label: 'Baptism Journey',
    action: () => onNavigate('baptism')
  }, {
    label: 'Find a Church',
    action: () => onNavigate('churches')
  }, {
    label: 'Reading Plans',
    action: () => onNavigate('plans')
  }, {
    label: 'Daily Bible Reading',
    action: () => onNavigate('daily-reading')
  }, {
    label: 'Bookmarks',
    action: () => onNavigate('bookmarks')
  }, {
    label: 'Daily Reminders',
    action: () => onNavigate('daily-reminders')
  }, {
    label: 'Notifications',
    action: () => onNavigate('notifications')
  }, {
    label: 'Contact Us',
    action: () => onNavigate('contact')
  }, {
    label: 'Terms of Service',
    action: () => onNavigate('terms-of-service')
  }];











  const popularBooks = ['Genesis', 'Psalms', 'Proverbs', 'Isaiah', 'Matthew', 'John', 'Romans', 'Revelation'];
  return <footer className="bg-gradient-to-b from-[#0c1929] to-[#081018] border-t border-[#14B8A6]/20">
      {/* Founder Banner */}
      <div className="bg-gradient-to-r from-[#14B8A6]/10 via-[#F59E0B]/10 to-[#3B82F6]/10 border-b border-[#14B8A6]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Icons */}
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-[#F59E0B] animate-pulse" />
              <Users className="w-8 h-8 text-[#14B8A6]" />
              <Sparkles className="w-6 h-6 text-[#F59E0B] animate-pulse" />
            </div>
            
            


            <h2 className="text-2xl sm:text-3xl font-bold text-[#5EEAD4] tracking-wider mb-2">
              SONS' OF THE ONE LLC
            </h2>
            
            {/* Executive Director - Rev. Robert E. Dorsey */}
            <div className="text-center mb-4">
              <p className="text-xl font-serif text-[#60A5FA]">
                Executive Director
              </p>
              <p className="text-xl font-serif text-white font-semibold">
                Rev. Robert E. Dorsey
              </p>
            </div>







            {/* Holy and Accountable...WE ARE... */}
            <p className="text-base text-white/90 font-medium max-w-md mb-4">
              <span className="text-[#5EEAD4]">"Holy and Accountable"...</span>
              <span className="text-[#F59E0B] font-bold">"WE ARE"...</span>
              <br />
              <span className="text-white/80">standing fast before mankind and <span className="text-[#FFD700] font-semibold">The Father</span></span>
              <span className="ml-1">🙏</span>

            </p>
            
            {/* 1 John 1:9 Scripture */}
            <p className="text-base font-serif text-[#60A5FA] font-bold italic text-glow-blue max-w-lg mb-4">
              1John 1:9 if we confess our sins He is faithful and just to forgive us our sins and cleanse us from all unrighteousness...Repent for The Kingdom is at hand...Amen 🙏🙌🙏
            </p>
            
            {/* I am Robert... */}
            <p className="text-lg font-serif mb-3">
              <span className="font-bold italic text-[#F59E0B] text-glow-amber">I am Robert..."One "Son" of many..."©</span>
            </p>



            
            {/* Sons' of The One / God Almighty */}
            <div className="text-center">
              <p className="font-bold italic text-[#14B8A6] text-glow-teal text-base">
                Sons' of The One
              </p>
              <p className="font-bold italic text-[#F59E0B] text-glow-amber text-base">
                God Almighty!!! WE ARE!!!🙏

              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#14B8A6] via-[#0D9488] to-[#0F766E] flex items-center justify-center glow-teal">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Sons of God</h3>
                <p className="text-xs text-[#5EEAD4]">Scripture Teaching</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-4"><span className="text-[#14B8A6]"> — Romans 8:14</span>"For as many as are led by the Spirit of God, they are sons of God."</p>

            <p className="text-white/40 text-xs italic">
              Want equals change... Salvation IS that change!
            </p>
            <p className="text-xs mt-1">
              <span className="text-[#FFD700] font-bold">BE THAT MAN...</span> always asking <span className="text-[#FFD700] font-bold">WWJD</span>?
            </p>


          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#F59E0B] to-[#14B8A6] rounded-full" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(link => <li key={link.label}>
                  <button onClick={link.action} className="text-white/60 hover:text-[#5EEAD4] transition-colors text-sm hover:translate-x-1 transform inline-block">
                    {link.label}
                  </button>
                </li>)}
            </ul>
          </div>

          {/* Popular Books */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#3B82F6] to-[#14B8A6] rounded-full" />
              <span>Popular Books</span>
            </h4>
            <ul className="space-y-2">
              {popularBooks.map(book => <li key={book}>
                  <button onClick={() => onSelectBook(book)} className="text-white/60 hover:text-[#F59E0B] transition-colors text-sm hover:translate-x-1 transform inline-block">
                    {book}
                  </button>
                </li>)}
            </ul>
          </div>

          {/* About */}
          {/* About */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#F59E0B] to-[#3B82F6] rounded-full" />
              <span>About</span>
            </h4>
            <p className="text-white/60 text-sm mb-4">
              This teaching app is dedicated to exploring the profound truth of our identity as children of God through faith in Christ Jesus.
            </p>
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <Heart className="w-4 h-4 text-[#F59E0B]" />
              <span>Based on the King James Version (KJV) 1611</span>
            </div>
          </div>
        </div>

        {/* Bible Books Index */}
        <div className="mt-12 pt-8 border-t border-[#14B8A6]/20">
          <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <span className="w-8 h-1 bg-gradient-to-r from-[#F59E0B] to-[#14B8A6] rounded-full" />
            <span>Old Testament</span>
          </h4>
          <div className="flex flex-wrap gap-2 mb-6">
            {oldTestament.slice(0, 20).map(book => <button key={book.name} onClick={() => onSelectBook(book.name)} className="px-2 py-1 text-xs text-white/50 hover:text-[#5EEAD4] hover:bg-[#14B8A6]/10 rounded transition-all border border-transparent hover:border-[#14B8A6]/30">
                {book.abbr}
              </button>)}
            <span className="px-2 py-1 text-xs text-white/30">+{oldTestament.length - 20} more</span>
          </div>

          <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <span className="w-8 h-1 bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] rounded-full" />
            <span>New Testament</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {newTestament.map(book => <button key={book.name} onClick={() => onSelectBook(book.name)} className="px-2 py-1 text-xs text-white/50 hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded transition-all border border-transparent hover:border-[#F59E0B]/30">
                {book.abbr}
              </button>)}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#14B8A6]/20 bg-[#081018]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-white/60 text-xs font-medium">
                Sons' of the One LLC
              </p>
              <p className="text-white/40 text-xs mt-1">
                Scripture quotations from the King James Version (KJV) 1611 - Public Domain
              </p>
              <p className="text-white/40 text-xs">
                © {new Date().getFullYear()} Sons of God Teaching App. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://www.kingjamesbibleonline.org/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-white/40 hover:text-[#14B8A6] text-xs transition-colors">
                <span>KJV 1611</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;

