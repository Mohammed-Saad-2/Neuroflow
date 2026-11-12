/**
 * Guided Breathwork Modal Component
 * Provides Box Breathing and 4-7-8 relaxing breath patterns with smooth animated visual guidance.
 */

import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, HeartPulse } from 'lucide-react';
import { globalAudioEngine } from '../audio/AudioEngine.ts';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type BreathingTechnique = 'box' | 'relax_478';

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose }) => {
  const [technique, setTechnique] = useState<BreathingTechnique>('box');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [phaseName, setPhaseName] = useState<string>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    // Pattern definitions in seconds: [name, duration, targetScale]
    const pattern = technique === 'box'
      ? [
          { name: 'Inhale deeply', duration: 4, targetScale: 1.5 },
          { name: 'Hold gently', duration: 4, targetScale: 1.5 },
          { name: 'Exhale slowly', duration: 4, targetScale: 1.0 },
          { name: 'Hold empty', duration: 4, targetScale: 1.0 },
        ]
      : [
          { name: 'Inhale through nose', duration: 4, targetScale: 1.6 },
          { name: 'Hold breath', duration: 7, targetScale: 1.6 },
          { name: 'Exhale through mouth', duration: 8, targetScale: 1.0 },
        ];

    let currentStep = 0;
    setPhaseName(pattern[0].name);
    setPhaseSecondsLeft(pattern[0].duration);
    setScale(pattern[0].targetScale);

    const interval = window.setInterval(() => {
      setPhaseSecondsLeft(prev => {
        if (prev <= 1) {
          // Advance step
          currentStep = (currentStep + 1) % pattern.length;
          if (currentStep === 0) {
            setCyclesCompleted(c => c + 1);
            globalAudioEngine.strikeChime(528);
          }
          const nextStep = pattern[currentStep];
          setPhaseName(nextStep.name);
          setScale(nextStep.targetScale);
          return nextStep.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, technique]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Close breathing modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4" />
            <span>Autonomic Reset Companion</span>
          </div>
          <h2 className="text-xl font-bold text-white">Guided Breathwork</h2>
          <p className="text-xs text-slate-400 mt-1">
            Re-align your nervous system during short sprint intervals.
          </p>
        </div>

        {/* Technique Switcher */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs max-w-xs mx-auto">
          <button
            onClick={() => {
              setTechnique('box');
              setCyclesCompleted(0);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              technique === 'box' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Box Breathing (4-4-4-4)
          </button>
          <button
            onClick={() => {
              setTechnique('relax_478');
              setCyclesCompleted(0);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              technique === 'relax_478' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            4-7-8 Calming
          </button>
        </div>

        {/* Animated Breathing Circle */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center my-4">
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full bg-cyan-500/10 border border-cyan-500/20 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${scale * 1.1})` }}
          />
          {/* Main animated orb */}
          <div
            className="w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-600/40 via-indigo-600/30 to-purple-600/40 border border-cyan-400/40 flex flex-col items-center justify-center shadow-xl shadow-cyan-500/10 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${scale})` }}
          >
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {phaseSecondsLeft}s
            </span>
            <span className="text-[11px] text-cyan-200 font-medium px-2 text-center mt-0.5">
              {phaseName}
            </span>
          </div>
        </div>

        {/* Stats & Controls */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <span>
            Cycles Completed: <strong className="text-white font-mono">{cyclesCompleted}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="hover:text-white underline transition-colors"
          >
            {isRunning ? 'Pause Guide' : 'Resume Guide'}
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => {
              setCyclesCompleted(0);
              setPhaseSecondsLeft(4);
            }}
            className="hover:text-white underline transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
