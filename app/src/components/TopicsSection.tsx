import React from 'react';
import { Crown, Wind, Heart, Shield, Gift, BookOpen, Anchor, Scale, Sun, Music, Eye, Infinity, Check, Route, Droplet, Sunrise, RefreshCw } from 'lucide-react';
import { topics } from '@/data/bibleData';

interface TopicsSectionProps {
  onSelectTopic: (topic: string) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  crown: Crown,
  wind: Wind,
  heart: Heart,
  shield: Shield,
  gift: Gift,
  book: BookOpen,
  dove: Heart,
  anchor: Anchor,
  scale: Scale,
  cross: Sun,
  infinity: Infinity,
  check: Check,
  music: Music,
  scroll: BookOpen,
  eye: Eye,
  sun: Sun,
  hands: Heart,
  road: Route,
  droplet: Droplet,
  sunrise: Sunrise,
  refresh: RefreshCw,
};

// Helper function to render topic name with gold highlight for "Salvation"
const renderTopicName = (name: string, highlight?: string) => {
  if (!highlight) {
    return <span>{name}</span>;
  }
  
  const parts = name.split(highlight);
  if (parts.length === 1) {
    return <span>{name}</span>;
  }
  
  return (
    <>
      {parts[0]}
      <span className="text-[#FFD700] font-bold" style={{ 
        textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
        background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {highlight}
      </span>
      {parts[1]}
    </>
  );
};

const TopicsSection: React.FC<TopicsSectionProps> = ({ onSelectTopic }) => {
  // Sort topics to put "The Road to Salvation" first, then "Baptism"
  const sortedTopics = [...topics].sort((a, b) => {
    if (a.name === 'The Road to Salvation') return -1;
    if (b.name === 'The Road to Salvation') return 1;
    if (a.name === 'Baptism') return -1;
    if (b.name === 'Baptism') return 1;
    return 0;
  });

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-gradient-to-r from-[#F59E0B]/20 to-[#14B8A6]/20 text-[#F59E0B] text-sm font-medium rounded-full mb-4 border border-[#F59E0B]/30">
            Topical Study
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            Explore Scripture by Topic
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Dive deep into God's Word through thematic studies. Each topic connects you to relevant passages throughout the Bible.
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedTopics.map((topic, index) => {
            const IconComponent = iconMap[topic.icon] || BookOpen;
            const isRoadToSalvation = topic.name === 'The Road to Salvation';
            const isBaptism = topic.name === 'Baptism';
            
            // Special bright blue styling for "The Road to Salvation" and "Baptism"
            if (isRoadToSalvation || isBaptism) {
              return (
                <button
                  key={topic.name}
                  onClick={() => onSelectTopic(topic.name)}
                  className="group relative col-span-2 sm:col-span-1 bg-gradient-to-br from-[#3B82F6]/30 via-[#2563EB]/20 to-[#1D4ED8]/30 hover:from-[#3B82F6]/50 hover:via-[#2563EB]/40 hover:to-[#1D4ED8]/50 border-2 border-[#3B82F6]/60 hover:border-[#60A5FA] rounded-xl p-4 sm:p-5 text-left transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                  style={{
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)'
                  }}
                >
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#60A5FA]/20 via-[#3B82F6]/10 to-[#60A5FA]/20 animate-pulse opacity-50" />
                  
                  {/* Sparkle decorations */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping opacity-60" />
                  <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-[#60A5FA] rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }} />
                  
                  <div className="relative z-10">
                    <div 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110 bg-gradient-to-br from-[#3B82F6]/40 to-[#1D4ED8]/40 border border-[#60A5FA]/50"
                    >
                      <IconComponent 
                        className="w-6 h-6 sm:w-7 sm:h-7 text-[#60A5FA] drop-shadow-lg" 
                      />
                    </div>
                    {isRoadToSalvation ? (
                      <h3 
                        className="font-bold text-[#60A5FA] group-hover:text-white transition-colors mb-1 text-lg"
                        style={{
                          textShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                        }}
                      >
                        The Road to{' '}
                        <span 
                          className="text-[#FFD700] font-bold"
                          style={{ 
                            textShadow: '0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.4)'
                          }}
                        >
                          Salvation
                        </span>
                      </h3>
                    ) : (
                      <h3 
                        className="font-bold text-[#60A5FA] group-hover:text-white transition-colors mb-1 text-lg"
                        style={{
                          textShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                        }}
                      >
                        {topic.name}
                      </h3>
                    )}
                    <p className="text-sm text-[#93C5FD]">
                      {topic.count} verses
                    </p>
                  </div>
                </button>
              );
            }

            
            // Regular topic styling
            const colorScheme = index % 3 === 0 
              ? { bg: '[#F59E0B]', text: '[#F59E0B]', hover: '[#FCD34D]' }
              : index % 3 === 1 
                ? { bg: '[#14B8A6]', text: '[#14B8A6]', hover: '[#5EEAD4]' }
                : { bg: '[#3B82F6]', text: '[#3B82F6]', hover: '[#60A5FA]' };
            
            return (
              <button
                key={topic.name}
                onClick={() => onSelectTopic(topic.name)}
                className={`group relative bg-white/5 hover:bg-${colorScheme.bg}/10 border border-${colorScheme.bg}/20 hover:border-${colorScheme.bg}/50 rounded-xl p-4 sm:p-5 text-left transition-all`}
                style={{
                  borderColor: index % 3 === 0 
                    ? 'rgba(245, 158, 11, 0.2)' 
                    : index % 3 === 1 
                      ? 'rgba(20, 184, 166, 0.2)' 
                      : 'rgba(59, 130, 246, 0.2)'
                }}
              >
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                  style={{
                    backgroundColor: index % 3 === 0 
                      ? 'rgba(245, 158, 11, 0.2)' 
                      : index % 3 === 1 
                        ? 'rgba(20, 184, 166, 0.2)' 
                        : 'rgba(59, 130, 246, 0.2)'
                  }}
                >
                  <IconComponent 
                    className="w-5 h-5 sm:w-6 sm:h-6 transition-colors" 
                    style={{
                      color: index % 3 === 0 
                        ? '#F59E0B' 
                        : index % 3 === 1 
                          ? '#14B8A6' 
                          : '#3B82F6'
                    }}
                  />
                </div>
                <h3 
                  className="font-medium text-white group-hover:text-opacity-100 transition-colors mb-1"
                >
                  {renderTopicName(topic.name, (topic as any).highlight)}
                </h3>
                <p className="text-xs text-white/50">
                  {topic.count} verses
                </p>
              </button>
            );
          })}
        </div>

        {/* Featured Topic Banner */}
        <div className="mt-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F59E0B]/20 via-[#14B8A6]/10 to-[#3B82F6]/20 border border-[#F59E0B]/30">
          <div className="absolute inset-0 bg-[url('https://d64gsuwffb70l.cloudfront.net/694fcc3ee4301f3ab0bd6a9d_1766838146418_85f747dc.jpg')] bg-cover bg-center opacity-10" />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/10 via-[#14B8A6]/10 to-[#3B82F6]/10 animate-gradient bg-[length:200%_auto]" />
          
          <div className="relative p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-[#F59E0B]/20 to-[#14B8A6]/20 rounded-full mb-4 border border-[#F59E0B]/30">
                <Crown className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[#F59E0B] text-sm font-medium">Featured Study</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                Sons of God
              </h3>
              <p className="text-white/70 max-w-lg">
                Discover what it means to be a child of God through faith in Christ Jesus. 
                Explore the profound truth of our adoption and inheritance as sons.
              </p>
            </div>
            <button
              onClick={() => onSelectTopic('Sons of God')}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:from-[#D97706] hover:to-[#B45309] transition-all whitespace-nowrap glow-amber"
            >
              <span>Begin Study</span>
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopicsSection;
