import React, { useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';

export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying } = useMusic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let currentVoiceLevel = 1.0;
    let targetVoiceLevel = 1.0;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        time += 0.05;
      } else {
        time += 0.005;
      }

      let voiceLevel = 1.0;
      if (isPlaying) {
        const beat = Math.sin(time * 4) * Math.cos(time * 2);
        if (Math.random() > 0.92) {
          targetVoiceLevel = 0.5 + Math.random() * 0.9;
        }
        currentVoiceLevel += (targetVoiceLevel - currentVoiceLevel) * 0.1;
        voiceLevel = currentVoiceLevel + Math.abs(beat) * 0.2;
      }

      const drawWave = (offset: number, baseAmplitude: number, frequency: number, color: string) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 4) {
          const distanceToCenter = Math.abs(x - width / 2) / (width / 2);
          const edgeFade = Math.pow(1 - distanceToCenter, 1.5);
          const sine = Math.sin(x * frequency + time + offset);
          const y = height - (sine * baseAmplitude * voiceLevel * edgeFade + 10);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };

      drawWave(0, 35, 0.015, 'rgba(139, 92, 246, 0.25)'); // Brand Purple
      drawWave(2, 25, 0.02, 'rgba(6, 182, 212, 0.35)');   // Cyan
      drawWave(4, 15, 0.03, 'rgba(236, 72, 153, 0.45)');  // Pink

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-16 rounded-xl overflow-hidden shadow-inner border border-white/5 bg-zinc-950">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
