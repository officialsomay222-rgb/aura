import React, { useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface Wave {
  id: number;
  originX: number;
  originY: number;
  radius: number;
  maxRadius: number;
  speed: number;
  thickness: number;
  alpha: number;
  color: string;
  secondaryColor: string;
  particles: Particle[];
  startTime: number;
}

export function ShockwaveOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { shockwaveTrigger, theme } = useMusic();
  const wavesRef = useRef<Wave[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const isWhite = theme === 'light';

  useEffect(() => {
    if (!shockwaveTrigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const originX = shockwaveTrigger.x;
    const originY = shockwaveTrigger.y;
    const maxRadius = Math.sqrt(width * width + height * height) * 1.1;

    // Generate kinetic burst particles from epicenter
    const particles: Particle[] = [];
    const particleCount = 28;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 8 + 4;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        alpha: 1,
        color: isWhite ? '#000000' : '#ffffff',
      });
    }

    const newWave: Wave = {
      id: Date.now() + Math.random(),
      originX,
      originY,
      radius: 0,
      maxRadius,
      speed: 18,
      thickness: 18,
      alpha: 1,
      color: isWhite ? 'rgba(0, 0, 0,' : 'rgba(255, 255, 255,',
      secondaryColor: isWhite ? 'rgba(30, 30, 30,' : 'rgba(251, 191, 36,',
      particles,
      startTime: performance.now(),
    };

    wavesRef.current.push(newWave);

    // Subtle device haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([15, 30, 20]);
      } catch (e) {
        // ignore
      }
    }

    // Start render loop if not running
    if (!animFrameRef.current) {
      const loop = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentWaves = wavesRef.current;
        for (let i = currentWaves.length - 1; i >= 0; i--) {
          const wave = currentWaves[i];
          const elapsed = performance.now() - wave.startTime;
          const progress = Math.min(1, wave.radius / wave.maxRadius);

          // Explosive shockwave physics: high speed burst decaying over distance
          const currentSpeed = wave.speed * Math.pow(1 - progress * 0.75, 1.4);
          wave.radius += currentSpeed * 1.6;
          wave.alpha = Math.max(0, 1 - Math.pow(progress, 0.75));

          if (wave.alpha <= 0.01 || wave.radius >= wave.maxRadius) {
            currentWaves.splice(i, 1);
            continue;
          }

          // 1. Primary Compression Crest (Luminous high-density front shockwave)
          ctx.save();
          ctx.beginPath();
          ctx.arc(wave.originX, wave.originY, Math.max(0, wave.radius), 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, wave.thickness * (1 - progress * 0.65));
          ctx.strokeStyle = `${wave.color} ${wave.alpha * 0.95})`;
          ctx.shadowColor = isWhite ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)';
          ctx.shadowBlur = 24 * (1 - progress * 0.5);
          ctx.stroke();
          ctx.restore();

          // 2. Secondary Harmonic Ring (Trailing diffraction pressure wave)
          const secondaryRadius = Math.max(0, wave.radius - 22);
          if (secondaryRadius > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(wave.originX, wave.originY, secondaryRadius, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(1, (wave.thickness * 0.6) * (1 - progress * 0.6));
            ctx.strokeStyle = `${wave.secondaryColor} ${wave.alpha * 0.65})`;
            ctx.shadowColor = isWhite ? 'rgba(0,0,0,0.3)' : 'rgba(251,191,36,0.6)';
            ctx.shadowBlur = 16;
            ctx.stroke();
            ctx.restore();
          }

          // 3. Inner Rarefaction Wave (Thin high-frequency ripple)
          const tertiaryRadius = Math.max(0, wave.radius - 48);
          if (tertiaryRadius > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(wave.originX, wave.originY, tertiaryRadius, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(0.5, 2 * (1 - progress));
            ctx.strokeStyle = `${wave.color} ${wave.alpha * 0.4})`;
            ctx.stroke();
            ctx.restore();
          }

          // 4. Update and Draw Epicenter Particles
          for (const p of wave.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.92;
            p.vy *= 0.92;
            p.alpha *= 0.93;

            if (p.alpha > 0.05) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.alpha * wave.alpha;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.restore();
            }
          }

          // 5. Epicenter Radial Energy Flash in first 200ms
          if (elapsed < 300) {
            const flashAlpha = (1 - elapsed / 300) * 0.7;
            const flashRadius = Math.min(120, elapsed * 0.6);
            const gradient = ctx.createRadialGradient(
              wave.originX,
              wave.originY,
              0,
              wave.originX,
              wave.originY,
              flashRadius
            );
            gradient.addColorStop(0, `${wave.color} ${flashAlpha})`);
            gradient.addColorStop(0.5, `${wave.secondaryColor} ${flashAlpha * 0.5})`);
            gradient.addColorStop(1, `${wave.color} 0)`);

            ctx.save();
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(wave.originX, wave.originY, flashRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        if (wavesRef.current.length > 0) {
          animFrameRef.current = requestAnimationFrame(loop);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(loop);
    }
  }, [shockwaveTrigger, isWhite]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99999] w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
