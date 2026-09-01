import React, { useState } from 'react';
import { Clock, BookOpen, ChevronRight, Check, Play, Crown, Scroll, Music, Wind, Star } from 'lucide-react';
import { readingPlans } from '@/data/bibleData';

interface ReadingPlansProps {
  activePlan: string | null;
  planProgress: Record<string, number[]>;
  onStartPlan: (planId: string) => void;
  onCompleteDay: (planId: string, day: number) => void;
  onReadVerse: (reference: string) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  crown: Crown,
  book: BookOpen,
  scroll: Scroll,
  music: Music,
  wind: Wind,
  star: Star,
};

const ReadingPlans: React.FC<ReadingPlansProps> = ({
  activePlan,
  planProgress,
  onStartPlan,
  onCompleteDay,
  onReadVerse,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getProgress = (planId: string) => {
    const completed = planProgress[planId]?.length || 0;
    const plan = readingPlans.find(p => p.id === planId);
    const total = plan?.verses.length || 1;
    return Math.round((completed / total) * 100);
  };

  const isDayCompleted = (planId: string, day: number) => {
    return planProgress[planId]?.includes(day) || false;
  };

  const viewingPlan = selectedPlan ? readingPlans.find(p => p.id === selectedPlan) : null;

  if (viewingPlan) {
    const IconComponent = iconMap[viewingPlan.image] || BookOpen;
    const progress = getProgress(viewingPlan.id);

    return (
      <div className="bg-[#1a2332] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
        {/* Plan Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#d4af37]/20 to-transparent">
          <button
            onClick={() => setSelectedPlan(null)}
            className="absolute top-4 left-4 flex items-center space-x-1 text-[#f5f1e8]/60 hover:text-[#d4af37] transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-sm">Back</span>
          </button>

          <div className="text-center pt-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-[#d4af37]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#f5f1e8] mb-2">{viewingPlan.title}</h2>
            <p className="text-[#f5f1e8]/60 mb-4">{viewingPlan.description}</p>
            
            {/* Progress Bar */}
            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#f5f1e8]/60">Progress</span>
                <span className="text-[#d4af37]">{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#d4af37] to-[#b8962e] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Days List */}
        <div className="p-4 sm:p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {viewingPlan.verses.map((verse) => {
            const isCompleted = isDayCompleted(viewingPlan.id, verse.day);
            
            return (
              <div
                key={verse.day}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  isCompleted ? 'bg-[#d4af37]/10' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-[#d4af37] text-[#1a2332]' : 'bg-white/10 text-[#f5f1e8]/60'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-bold">{verse.day}</span>}
                  </div>
                  <div>
                    <h4 className={`font-medium ${isCompleted ? 'text-[#d4af37]' : 'text-[#f5f1e8]'}`}>
                      {verse.title}
                    </h4>
                    <p className="text-sm text-[#f5f1e8]/50">{verse.reference}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onReadVerse(verse.reference)}
                    className="p-2 text-[#f5f1e8]/60 hover:text-[#d4af37] transition-colors"
                    title="Read"
                  >
                    <BookOpen className="w-5 h-5" />
                  </button>
                  {!isCompleted && (
                    <button
                      onClick={() => onCompleteDay(viewingPlan.id, verse.day)}
                      className="p-2 bg-[#d4af37] text-[#1a2332] rounded-lg hover:bg-[#d4af37]/80 transition-colors"
                      title="Mark Complete"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#f5f1e8]">Reading Plans</h2>
          <p className="text-[#f5f1e8]/60">Guided scripture study journeys</p>
        </div>
        <div className="flex items-center space-x-2 text-[#d4af37]">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">{readingPlans.length} Plans</span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {readingPlans.map((plan) => {
          const IconComponent = iconMap[plan.image] || BookOpen;
          const progress = getProgress(plan.id);
          const isActive = activePlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`group bg-[#1a2332] rounded-xl border transition-all hover:border-[#d4af37]/50 ${
                isActive ? 'border-[#d4af37]' : 'border-[#d4af37]/20'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-[#d4af37] text-[#1a2332]' : 'bg-[#d4af37]/20 text-[#d4af37]'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  {isActive && (
                    <span className="px-2 py-1 bg-[#d4af37]/20 text-[#d4af37] text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-serif font-bold text-[#f5f1e8] mb-2 group-hover:text-[#d4af37] transition-colors">
                  {plan.title}
                </h3>
                <p className="text-sm text-[#f5f1e8]/60 mb-4 line-clamp-2">{plan.description}</p>

                <div className="flex items-center justify-between text-sm text-[#f5f1e8]/50 mb-4">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{plan.duration}</span>
                  </span>
                  <span>{plan.verses.length} readings</span>
                </div>

                {/* Progress Bar */}
                {progress > 0 && (
                  <div className="mb-4">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#d4af37] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#d4af37] mt-1">{progress}% complete</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white/5 text-[#f5f1e8] rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span>View Plan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {!isActive && (
                    <button
                      onClick={() => onStartPlan(plan.id)}
                      className="p-2 bg-[#d4af37] text-[#1a2332] rounded-lg hover:bg-[#d4af37]/80 transition-colors"
                      title="Start Plan"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReadingPlans;
