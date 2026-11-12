/**
 * Session Analytics & Productivity Export Modal
 * Provides daily focus time, streak metrics, and 1-click Markdown export for standups.
 */

import React, { useState } from 'react';
import { X, Flame, Clock, CheckCircle2, FileText, Check, Trash2 } from 'lucide-react';
import {
  SessionRecord,
  formatDurationHuman,
  calculateTodayFocusMinutes,
  calculateStreak,
  generateSessionMarkdownReport,
} from '../utils/timerUtils.ts';

interface SessionAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionRecord[];
  completedTaskTitles: string[];
  onClearHistory: () => void;
}

export const SessionAnalyticsModal: React.FC<SessionAnalyticsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  completedTaskTitles,
  onClearHistory,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayMinutes = calculateTodayFocusMinutes(sessions);
  const streak = calculateStreak(sessions);
  const focusSessions = sessions.filter(s => s.type === 'focus');

  const handleCopyMarkdown = async () => {
    const md = generateSessionMarkdownReport(todayMinutes, completedTaskTitles, streak);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Close analytics modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-white">Focus Analytics & Summary</h2>
          <p className="text-xs text-slate-400 mt-1">
            Quantified deep work velocity and exportable summary for standups.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
            <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
            <span className="text-xs text-slate-400 block">Today's Focus</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">
              {formatDurationHuman(todayMinutes)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
            <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
            <span className="text-xs text-slate-400 block">Daily Streak</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">
              {streak} {streak === 1 ? 'day' : 'days'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
            <span className="text-xs text-slate-400 block">Sprints Finished</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">
              {focusSessions.length}
            </span>
          </div>
        </div>

        {/* Recent Session Logs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">
              Recent Sprint Records
            </span>
            {sessions.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {focusSessions.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No completed sprints logged yet today.
              </div>
            ) : (
              focusSessions.slice(-6).reverse().map(sess => (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="text-slate-200 font-medium">{sess.taskTitle}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="font-mono text-cyan-400 tabular-nums font-medium">
                    +{sess.durationMinutes}m
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Export Standup Report Action */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Copy formatted Markdown report</span>
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Standup Markdown'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
