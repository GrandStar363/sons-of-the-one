import React from 'react';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

// "One Classroom teaching" — the ministry's front door, shown at the start of
// each visit. "Enter The Classroom" continues into the app (or to sign-in for
// visitors). Copy is Robert's, from the approved design; keep it verbatim.

interface WelcomeClassroomProps {
  onEnter: () => void;
}

const Divider: React.FC<{ dot?: 'amber' | 'teal' }> = ({ dot }) =>
  dot ? (
    <div className="flex items-center justify-center gap-3 my-7" aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#14B8A6]/40" />
      <span className={`h-2 w-2 rounded-full ${dot === 'amber' ? 'bg-[#F59E0B]' : 'bg-[#14B8A6]'}`} />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#14B8A6]/40" />
    </div>
  ) : (
    <div className="mx-auto my-7 h-px w-28 bg-[#14B8A6]/60" aria-hidden="true" />
  );

const WelcomeClassroom: React.FC<WelcomeClassroomProps> = ({ onEnter }) => (
  <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0c1929] via-[#0f2942] to-[#0c1929]">
    {/* Soft background glows */}
    <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#14B8A6]/10 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#F59E0B]/10 blur-3xl" />

    <main className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-5 pb-12 pt-10 text-center sm:pt-14">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] shadow-lg shadow-[#14B8A6]/30">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <div className="text-left">
          <p className="font-serif text-3xl font-bold leading-tight text-white">Sons of God</p>
          <p className="text-sm text-[#14B8A6]">Walking in Divine Identity</p>
        </div>
      </div>

      {/* Title */}
      <p className="mt-10 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#F59E0B]">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        Welcome to
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </p>
      <h1 className="mt-4 font-serif font-bold leading-tight">
        <span className="block text-4xl text-[#F59E0B] sm:text-5xl">One Classroom</span>
        <span className="mt-1 block text-3xl text-white sm:text-4xl">teaching</span>
      </h1>
      <p className="mt-3 font-serif text-3xl italic text-[#14B8A6] sm:text-4xl">"The Word of God"</p>

      {/* Message card */}
      <section className="mt-10 w-full rounded-3xl border border-[#14B8A6]/40 bg-gradient-to-b from-[#0f2942]/90 to-[#0c1929]/90 px-6 py-9 shadow-2xl shadow-black/30 sm:px-10">
        <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#14B8A6]" aria-hidden="true" />

        <p className="mt-8 text-lg leading-relaxed text-white/90">
          <span className="font-bold text-[#F59E0B]">FOCUSED</span> teachings thru guided lessons and direction
          creating knowledgeable individuals moving forward in{' '}
          <span className="font-semibold text-[#14B8A6]">Spiritual Growth</span> and a better life and the
          comprehension of <span className="font-semibold text-[#F59E0B]">self awareness...</span>
        </p>

        <Divider dot="amber" />

        <p className="text-lg leading-relaxed text-white/90">
          The walk with <span className="font-semibold text-[#F59E0B]">The Father</span> grows as each day passes,{' '}
          <span className="font-semibold text-[#14B8A6]">Obedient</span> is the true{' '}
          <span className="font-bold text-[#F59E0B]">KEY</span> to a life well lived...
        </p>

        <Divider dot="teal" />

        <p className="text-lg leading-relaxed text-white/90">
          <span className="font-semibold text-[#14B8A6]">Heaven awaits,</span>{' '}
          <span className="font-serif text-xl italic text-white">The Father calleth thee, come home my child, come home...</span>
        </p>

        <p className="mt-6 font-serif text-xl leading-relaxed text-white sm:text-2xl">
          Will you answer His <span className="italic text-[#F59E0B]">quiet</span> but{' '}
          <span className="italic text-[#14B8A6]">loving</span> voice...
        </p>

        <Divider />

        <p className="text-lg text-white/90">
          The choice is <span className="font-bold text-[#F59E0B]">yours</span> and yours alone...
        </p>
        <p className="mt-6 font-serif text-[22px] font-bold text-[#14B8A6] sm:text-3xl">
          Choose wisely my <span className="whitespace-nowrap">friend <span aria-hidden="true">🙏</span></span>
        </p>

        <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]" aria-hidden="true" />
      </section>

      {/* Call to action */}
      <button
        type="button"
        onClick={onEnter}
        className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] px-6 py-5 text-xl font-semibold text-white shadow-lg shadow-[#14B8A6]/30 transition-all hover:from-[#0D9488] hover:to-[#0F766E] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#14B8A6]/40"
      >
        Enter The Classroom
        <ArrowRight className="h-6 w-6" aria-hidden="true" />
      </button>
      <p className="mt-4 text-sm text-white/50">Begin your spiritual journey today</p>

      {/* Scripture */}
      <blockquote className="mt-10">
        <p className="italic text-white/60">
          "For as many as are led by the Spirit of God, they are the sons of God."
        </p>
        <footer className="mt-2 text-sm font-medium text-[#F59E0B]">— Romans 8:14 (KJV)</footer>
      </blockquote>
    </main>
  </div>
);

export default WelcomeClassroom;
