/**
 * Cognitive Sprint & Pomodoro Focus Timer
 * Features circular animated SVG progress, customizable intervals, and task integration.
 */

import React, { useState, useEffect } from 'react';
import { formatTime, SessionRecord } from '../utils/timerUtils.ts';
import { globalAudioEngine } from '../audio/AudioEngine.ts';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Flame, CheckCircle } from 'lucide-react';

export type SprintPhase = 'focus' | 'short_break' | 'long_break';

interface FocusSprintTimerProps {
  activeTaskTitle?: string;
  onSessionComplete: (session: SessionRecord) => void;
}

export const FocusSprintTimer: React.FC<FocusSprintTimerProps> = ({
  activeTaskTitle,
  onSessionComplete,
}) => {
  const [phase, setPhase] = useState<SprintPhase>('focus');
  const [focusDurationMins, setFocusDurationMins] = useState<number>(25);
  const [breakDurationMins, setBreakDurationMins] = useState<number>(5);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  // Interval timer tick
  useEffect(() => {
    let timer: number | null = null;
    if (isRunning && timeLeftSec > 0) {
      timer = window.setInterval(() => {
        setTimeLeftSec(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeftSec <= 0) {
      handlePhaseTransition();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeftSec]);

  const handlePhaseTransition = () => {
    // Sound harmonic alert
    globalAudioEngine.strikeChime(639);

    if (phase === 'focus') {
      const record: SessionRecord = {
        id: `sess_${Date.now()}`,
        timestamp: Date.now(),
        durationMinutes: focusDurationMins,
        taskTitle: activeTaskTitle || 'Unassigned Focus Sprint',
        type: 'focus',
      };
      onSessionComplete(record);
      setCompletedSessionsCount(prev => prev + 1);

      // Transition to break
      const nextBreakPhase: SprintPhase = (completedSessionsCount + 1) % 4 === 0 ? 'long_break' : 'short_break';
      const breakMins = nextBreakPhase === 'long_break' ? breakDurationMins * 3 : breakDurationMins;
      setPhase(nextBreakPhase);
      setTimeLeftSec(breakMins * 60);
    } else {
      // Transition back to focus
      setPhase('focus');
      setTimeLeftSec(focusDurationMins * 60);
    }
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    const duration = phase === 'focus' ? focusDurationMins : breakDurationMins;
    setTimeLeftSec(duration * 60);
  };

  const handleSkipPhase = () => {
    setIsRunning(false);
    handlePhaseTransition();
  };

  const setPresetInterval = (focusMins: number, breakMins: number) => {
    setIsRunning(false);
    setFocusDurationMins(focusMins);
    setBreakDurationMins(breakMins);
    setPhase('focus');
    setTimeLeftSec(focusMins * 60);
  };

  // Circular progress calculations
  const totalSeconds = (phase === 'focus' ? focusDurationMins : breakDurationMins) * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeftSec) / totalSeconds : 0;
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md flex flex-col items-center">
      {/* Preset Interval Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800 text-xs mb-6">
        <button
          onClick={() => setPresetInterval(25, 5)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            focusDurationMins === 25 ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          25 / 5 Classic
        </button>
        <button
          onClick={() => setPresetInterval(50, 10)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            focusDurationMins === 50 ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          50 / 10 Deep Work
        </button>
        <button
          onClick={() => setPresetInterval(90, 15)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            focusDurationMins === 90 ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          90 / 15 Ultradian
        </button>
      </div>

      {/* SVG Animated Circular Timer */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="#1E293B"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke={phase === 'focus' ? '#38BDF8' : '#34D399'}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-linear"
          />
        </svg>

        {/* Center Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase mb-1">
            {phase === 'focus' ? (
              <span className="text-cyan-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Deep Focus</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5" />
                <span>Rest & Breathe</span>
              </span>
            )}
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight tabular-nums">
            {formatTime(timeLeftSec)}
          </div>

          <div className="mt-2 text-[11px] text-slate-400 max-w-[140px] truncate">
            {activeTaskTitle ? (
              <span className="text-slate-300 font-medium">{activeTaskTitle}</span>
            ) : (
              <span>No task selected</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleResetTimer}
          className="p-3 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
          title="Reset current interval"
          aria-label="Reset interval"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
            isRunning
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
          }`}
          aria-label={isRunning ? 'Pause sprint timer' : 'Start sprint timer'}
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pause Sprint' : 'Start Sprint'}</span>
        </button>

        <button
          onClick={handleSkipPhase}
          className="p-3 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
          title="Skip to next phase"
          aria-label="Skip to next phase"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Sprint Counter Indicator */}
      <div className="mt-5 text-xs text-slate-400 flex items-center gap-2">
        <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
        <span>Sprints Completed Today:</span>
        <span className="font-mono text-cyan-300 font-semibold tabular-nums">
          {completedSessionsCount}
        </span>
      </div>
    </div>
  );
};
