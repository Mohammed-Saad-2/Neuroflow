/**
 * Application Footer
 * Features mandatory visible credit: "Built for Vibe Forge by Saad"
 */

import { Sparkles, Heart, Keyboard } from 'lucide-react';

interface FooterProps {
  onOpenBreathing: () => void;
  onOpenAnalytics: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBreathing, onOpenAnalytics }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white tracking-tight">NeuroFlow</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Real-time Web Audio API soundscape synthesizer, binaural brainwave pacing, and cognitive sprint companion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button
              onClick={onOpenBreathing}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Autonomic Breathing</span>
            </button>
            <button
              onClick={onOpenAnalytics}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <span>Daily Stats</span>
            </button>
          </div>
        </div>

        {/* Mandatory Hackathon Credit & Shortcuts Line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-cyan-300">Built for Vibe Forge by Saad</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-slate-500">Hackathon Edition 2026</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Space: Play/Stop Synth</span>
            <span aria-hidden="true">·</span>
            <span>Esc: Dismiss Dialogs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
