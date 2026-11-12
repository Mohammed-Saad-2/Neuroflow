/**
 * 60fps Reactive Harmonic Particle & Waveform Canvas
 * Connects directly to Web Audio AnalyserNode for audio reactivity
 */

import React, { useEffect, useRef, useState } from 'react';
import { globalAudioEngine } from '../audio/AudioEngine.ts';
import { Sparkles, Activity, Disc } from 'lucide-react';

export type VisualizerMode = 'constellation' | 'aurora' | 'zen_ripple';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  baseAlpha: number;
}

export const FlowCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('constellation');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 420;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = Math.min(65, Math.floor((width * height) / 12000));
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: 1.5 + Math.random() * 2.5,
        hue: 200 + Math.random() * 60, // Blue to indigo/violet spectrum
        baseAlpha: 0.2 + Math.random() * 0.45,
      });
    }

    // Audio frequency buffer
    const analyser = globalAudioEngine.getAnalyser();
    const frequencyData = new Uint8Array(64);
    let timeStep = 0;

    const render = () => {
      timeStep += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Sample real audio reactivity
      let audioEnergy = 0;
      if (globalAudioEngine.getIsRunning() && analyser) {
        analyser.getByteFrequencyData(frequencyData);
        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          sum += frequencyData[i];
        }
        audioEnergy = (sum / frequencyData.length) / 255; // 0..1
      }

      const isSounding = globalAudioEngine.getIsRunning();
      const boost = isSounding ? 1 + audioEnergy * 1.8 : 0.6;

      if (mode === 'constellation') {
        // Draw constellation particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Mouse gentle repel
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distMouse = Math.sqrt(dx * dx + dy * dy);
          if (distMouse < 120) {
            const force = (120 - distMouse) / 120;
            p.x += (dx / distMouse) * force * 2;
            p.y += (dy / distMouse) * force * 2;
          }

          p.x += p.vx * boost;
          p.y += p.vy * boost;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Draw node
          const currentSize = p.size * (1 + audioEnergy * 1.2);
          const alpha = Math.min(1, p.baseAlpha * boost);
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha})`;
          ctx.fill();

          // Connect nearby nodes
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const distX = p.x - p2.x;
            const distY = p.y - p2.y;
            const dist = Math.sqrt(distX * distX + distY * distY);
            const maxConnectDist = 110 + audioEnergy * 40;

            if (dist < maxConnectDist) {
              const lineAlpha = (1 - dist / maxConnectDist) * 0.25 * boost;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `hsla(215, 80%, 60%, ${lineAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      } else if (mode === 'aurora') {
        // Liquid Auroral Waves
        const waveCount = 4;
        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          const baseHeight = height * (0.45 + w * 0.12);
          ctx.moveTo(0, height);
          ctx.lineTo(0, baseHeight);

          for (let x = 0; x <= width; x += 15) {
            const freqIdx = Math.floor((x / width) * 32);
            const freqBonus = frequencyData[freqIdx] ? (frequencyData[freqIdx] / 255) * 45 : 0;
            const yOffset =
              Math.sin(x * 0.006 + timeStep * (1.2 + w * 0.4)) * (20 + w * 8) +
              Math.cos(x * 0.003 - timeStep * 0.8) * 15 +
              (isSounding ? freqBonus : 0);

            ctx.lineTo(x, baseHeight + yOffset);
          }

          ctx.lineTo(width, height);
          ctx.closePath();

          const gradient = ctx.createLinearGradient(0, baseHeight - 50, 0, height);
          const hue = 195 + w * 25;
          gradient.addColorStop(0, `hsla(${hue}, 85%, 60%, ${0.12 * boost})`);
          gradient.addColorStop(1, `hsla(${hue + 30}, 90%, 40%, 0)`);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      } else if (mode === 'zen_ripple') {
        // Concentric expanding calm ripples
        const centerX = width / 2;
        const centerY = height / 2;
        const ringCount = 6;

        for (let r = 0; r < ringCount; r++) {
          const phase = (timeStep * 0.8 + r / ringCount) % 1;
          const radius = phase * Math.min(width, height) * 0.45;
          const alpha = (1 - phase) * 0.4 * boost;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius + audioEnergy * 30, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${210 + r * 15}, 80%, 65%, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Center glowing nucleus
        ctx.beginPath();
        const coreSize = 12 + audioEnergy * 16;
        ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(210, 90%, 70%, ${0.5 * boost})`;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none bg-slate-950' : 'h-[280px] md:h-[340px]'
      }`}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-full w-full block cursor-crosshair"
      />

      {/* Visualizer Mode Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-800 text-xs text-slate-300">
        <button
          onClick={() => setMode('constellation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            mode === 'constellation' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'hover:text-white'
          }`}
          aria-label="Constellation visualizer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Constellation</span>
        </button>

        <button
          onClick={() => setMode('aurora')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            mode === 'aurora' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'hover:text-white'
          }`}
          aria-label="Aurora waves visualizer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Aurora Waves</span>
        </button>

        <button
          onClick={() => setMode('zen_ripple')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            mode === 'zen_ripple' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'hover:text-white'
          }`}
          aria-label="Zen ripple visualizer"
        >
          <Disc className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Zen Pulse</span>
        </button>
      </div>

      {/* Ambient interactive hint & fullscreen toggle */}
      <div className="absolute bottom-3 right-4 flex items-center gap-3 text-xs text-slate-400 select-none">
        <span className="hidden sm:inline">Move cursor to warp flow field</span>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="text-xs px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          {isFullscreen ? 'Exit Zen' : 'Zen Mode'}
        </button>
      </div>
    </div>
  );
};
