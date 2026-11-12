/**
 * Top Navigation Bar adhering to the Frontend Design Top Bar Contract:
 * [Zone 1: Brand wordmark] — [Zone 2: 4-5 text nav links] — [Zone 3: 1 primary action CTA]
 */

import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  onOpenBreathing: () => void;
  onOpenAnalytics: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBreathing,
  onOpenAnalytics,
  activeSection,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            NeuroFlow
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => onNavigate('visualizer')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'visualizer' ? 'text-white' : ''
            }`}
          >
            Visualizer
          </button>
          <button
            onClick={() => onNavigate('soundscapes')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'soundscapes' ? 'text-white' : ''
            }`}
          >
            Soundscapes
          </button>
          <button
            onClick={() => onNavigate('sprint')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'sprint' ? 'text-white' : ''
            }`}
          >
            Sprint Timer
          </button>
          <button
            onClick={onOpenAnalytics}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Daily Stats
          </button>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenBreathing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-sm hover:shadow-cyan-400/20 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guided Breathing</span>
          </button>
        </div>
      </div>
    </header>
  );
};
