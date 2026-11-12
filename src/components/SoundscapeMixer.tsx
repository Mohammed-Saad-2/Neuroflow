/**
 * Soundscape Mixer Component
 * Full multi-track ambient console with real-time Web Audio API control, preset management, and binaural tuning.
 */

import React, { useState, useEffect } from 'react';
import {
  globalAudioEngine,
  SOUND_CHANNELS,
  SOUNDSCAPE_PRESETS,
  SoundChannelId,
  SoundscapePreset,
} from '../audio/AudioEngine.ts';
import { calculateBinauralFrequencies } from '../utils/audioMath.ts';
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  BookmarkPlus,
  Trash2,
  Headphones,
  Bell,
  Waves,
  Activity,
  CloudRain,
  Wind,
  Radio,
} from 'lucide-react';

interface SoundscapeMixerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const SoundscapeMixer: React.FC<SoundscapeMixerProps> = ({ isPlaying, onTogglePlay }) => {
  const [channelVolumes, setChannelVolumes] = useState<Record<SoundChannelId, number>>(() =>
    globalAudioEngine.getChannelVolumes()
  );
  const [channelMutes, setChannelMutes] = useState<Record<SoundChannelId, boolean>>(() =>
    globalAudioEngine.getChannelMutes()
  );
  const [masterVolume, setMasterVolume] = useState<number>(() => globalAudioEngine.getMasterVolume());
  const [binauralBeatHz, setBinauralBeatHz] = useState<number>(() => globalAudioEngine.getBinauralBeatHz());
  const [activePresetId, setActivePresetId] = useState<string>('midnight_sprint');
  const [customPresets, setCustomPresets] = useState<SoundscapePreset[]>(() => {
    try {
      const saved = localStorage.getItem('vibeforge_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Sync state if audio engine changes
  useEffect(() => {
    setChannelVolumes(globalAudioEngine.getChannelVolumes());
    setChannelMutes(globalAudioEngine.getChannelMutes());
  }, [isPlaying]);

  const handleMasterVolumeChange = (val: number) => {
    setMasterVolume(val);
    globalAudioEngine.setMasterVolume(val);
  };

  const handleChannelVolumeChange = (channelId: SoundChannelId, val: number) => {
    const updated = { ...channelVolumes, [channelId]: val };
    setChannelVolumes(updated);
    globalAudioEngine.setChannelVolume(channelId, val);
  };

  const handleToggleMute = (channelId: SoundChannelId) => {
    const isMuted = globalAudioEngine.toggleChannelMute(channelId);
    setChannelMutes(prev => ({ ...prev, [channelId]: isMuted }));
  };

  const handleBinauralBeatChange = (beatHz: number) => {
    setBinauralBeatHz(beatHz);
    globalAudioEngine.setBinauralBeatHz(beatHz);
  };

  const handleApplyPreset = (preset: SoundscapePreset) => {
    setActivePresetId(preset.id);
    globalAudioEngine.applyPreset(preset);
    setChannelVolumes(preset.channelVolumes);
    setBinauralBeatHz(preset.binauralBeatHz);
  };

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: SoundscapePreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      description: 'Custom user crafted soundscape mix.',
      channelVolumes: { ...channelVolumes },
      binauralBeatHz,
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('vibeforge_custom_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewPresetName('');
    setShowSavePreset(false);
    setActivePresetId(newPreset.id);
  };

  const handleDeleteCustomPreset = (presetId: string) => {
    const updated = customPresets.filter(p => p.id !== presetId);
    setCustomPresets(updated);
    try {
      localStorage.setItem('vibeforge_custom_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (activePresetId === presetId) {
      setActivePresetId(SOUNDSCAPE_PRESETS[0].id);
    }
  };

  const binauralMeta = calculateBinauralFrequencies(216, binauralBeatHz);

  const getChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'Waves':
        return <Waves className="w-4 h-4 text-pink-400" />;
      case 'CloudRain':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-emerald-400" />;
      case 'Radio':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'Headphones':
        return <Headphones className="w-4 h-4 text-cyan-400" />;
      case 'Bell':
        return <Bell className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Console Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onTogglePlay}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all shadow-lg ${
              isPlaying
                ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
                : 'bg-white text-slate-950 hover:bg-slate-100'
            }`}
            aria-label={isPlaying ? 'Pause generative sound' : 'Start generative sound'}
          >
            {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-white">Audio Synthesis Console</h2>
              <div className="flex items-center gap-1 font-mono text-xs">
                {isPlaying && (
                  <span className="flex items-center gap-0.5 h-3 text-cyan-400 mr-1" aria-hidden="true">
                    <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:300ms]" />
                  </span>
                )}
                <span className={isPlaying ? 'text-cyan-300 font-medium' : 'text-slate-500'}>
                  {isPlaying ? 'LIVE SYNTHESIS' : 'STANDBY'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero audio loops — 100% synthesized in real time via Web Audio API.
            </p>
          </div>
        </div>

        {/* Master Volume Slider */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex flex-col gap-1 w-36 sm:w-44">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Master Gain</span>
              <span className="font-mono tabular-nums">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={e => handleMasterVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              aria-label="Master audio volume"
            />
          </div>

          <button
            onClick={() => globalAudioEngine.strikeChime(528)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700/60 transition-colors whitespace-nowrap"
            title="Interactive 528Hz Solfeggio singing bowl chime"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Strike Bowl</span>
          </button>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Curated Soundscape Presets
          </span>
          <button
            onClick={() => setShowSavePreset(!showSavePreset)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Save Current Mix</span>
          </button>
        </div>

        {showSavePreset && (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <input
              type="text"
              value={newPresetName}
              onChange={e => setNewPresetName(e.target.value)}
              placeholder="e.g. Rainy Night Code Flow"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSaveCustomPreset}
              className="px-3 py-1.5 text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap"
            >
              Save Preset
            </button>
            <button
              onClick={() => setShowSavePreset(false)}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Preset Buttons Grid */}
        <div className="flex flex-wrap gap-2">
          {SOUNDSCAPE_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isActive
                    ? 'bg-slate-800 border-cyan-500/60 text-cyan-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="whitespace-nowrap">{preset.name}</span>
              </button>
            );
          })}

          {customPresets.map(preset => {
            const isActive = activePresetId === preset.id;
            return (
              <div key={preset.id} className="flex items-center">
                <button
                  onClick={() => handleApplyPreset(preset)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-l-xl text-xs font-medium border-y border-l transition-all ${
                    isActive
                      ? 'bg-slate-800 border-cyan-500/60 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="whitespace-nowrap">{preset.name}</span>
                </button>
                <button
                  onClick={() => handleDeleteCustomPreset(preset.id)}
                  className="px-2 py-2 rounded-r-xl border-y border-r border-slate-800 bg-slate-900/60 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  aria-label={`Delete custom preset ${preset.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Channel Mixing Desk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SOUND_CHANNELS.map(channel => {
          const vol = channelVolumes[channel.id] ?? channel.defaultVolume;
          const isMuted = channelMutes[channel.id] ?? false;

          return (
            <div
              key={channel.id}
              className={`p-4 rounded-xl border transition-all ${
                vol > 0 && !isMuted
                  ? 'border-slate-700/80 bg-slate-900/80'
                  : 'border-slate-800/60 bg-slate-950/40 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                    {getChannelIcon(channel.iconName)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{channel.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{channel.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleMute(channel.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isMuted
                      ? 'border-rose-900/50 bg-rose-950/30 text-rose-400'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                  aria-label={isMuted ? `Unmute ${channel.name}` : `Mute ${channel.name}`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Volume Slider & Gauge */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">VOLUME</span>
                  <span className="text-slate-300 font-mono tabular-nums text-xs">
                    {isMuted ? 'MUTED' : `${Math.round(vol * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={vol}
                  onChange={e => handleChannelVolumeChange(channel.id, parseFloat(e.target.value))}
                  disabled={isMuted}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
                  aria-label={`${channel.name} channel volume`}
                />
              </div>

              {/* Extra channel control: Binaural Beat Frequency */}
              {channel.id === 'binaural' && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Beat Frequency</span>
                    <span className="text-cyan-400 font-mono tabular-nums font-medium">
                      {binauralBeatHz} Hz
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="0.5"
                    value={binauralBeatHz}
                    onChange={e => handleBinauralBeatChange(parseFloat(e.target.value))}
                    className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    aria-label="Binaural beat offset frequency"
                  />
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Target Brainwave:</span>
                    <span className="text-indigo-300 font-medium">{binauralMeta.stateName}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
