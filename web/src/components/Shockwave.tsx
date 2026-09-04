import React, { useEffect, useRef } from 'react';

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

interface ShockwaveOverlayProps {
  trigger: { x: number; y: number } | null;
  isLight?: boolean;
}

export const ShockwaveOverlay: React.FC<ShockwaveOverlayProps> = ({ trigger, isLight = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wavesRef = useRef<Wave[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const originX = trigger.x;
    const originY = trigger.y;
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
        color: isLight ? '#8b5cf6' : '#ffffff',
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
      color: isLight ? 'rgba(139, 92, 246,' : 'rgba(255, 255, 255,',
      secondaryColor: isLight ? 'rgba(236, 72, 153,' : 'rgba(139, 92, 246,',
      particles,
      startTime: performance.now(),
    };

    wavesRef.current.push(newWave);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([15, 30, 20]);
      } catch {}
    }

    // Start render loop
    if (!animFrameRef.current) {
      const loop = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentWaves = wavesRef.current;
        for (let i = currentWaves.length - 1; i >= 0; i--) {
          const wave = currentWaves[i];
          const progress = Math.min(1, wave.radius / wave.maxRadius);

          const currentSpeed = wave.speed * Math.pow(1 - progress * 0.75, 1.4);
          wave.radius += currentSpeed * 1.6;
          wave.alpha = Math.max(0, 1 - Math.pow(progress, 0.75));

          if (wave.alpha <= 0.01 || wave.radius >= wave.maxRadius) {
            currentWaves.splice(i, 1);
            continue;
          }

          // 1. Primary Compression Crest
          ctx.save();
          ctx.beginPath();
          ctx.arc(wave.originX, wave.originY, Math.max(0, wave.radius), 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, wave.thickness * (1 - progress * 0.65));
          ctx.strokeStyle = `${wave.color} ${wave.alpha * 0.95})`;
          ctx.shadowColor = isLight ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255, 255, 255, 0.9)';
          ctx.shadowBlur = 24 * (1 - progress * 0.5);
          ctx.stroke();
          ctx.restore();

          // 2. Secondary Harmonic Ring
          const secondaryRadius = Math.max(0, wave.radius - 22);
          if (secondaryRadius > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(wave.originX, wave.originY, secondaryRadius, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(1, (wave.thickness * 0.6) * (1 - progress * 0.6));
            ctx.strokeStyle = `${wave.secondaryColor} ${wave.alpha * 0.65})`;
            ctx.shadowColor = isLight ? 'rgba(236, 72, 153, 0.3)' : 'rgba(139, 92, 246, 0.6)';
            ctx.shadowBlur = 16;
            ctx.stroke();
            ctx.restore();
          }

          // 3. Particles
          for (const p of wave.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.92;
            p.vy *= 0.92;
            p.alpha = Math.max(0, p.alpha - 0.025);

            if (p.alpha > 0) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.alpha * wave.alpha;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.restore();
            }
          }
        }

        if (currentWaves.length > 0) {
          animFrameRef.current = requestAnimationFrame(loop);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(loop);
    }
  }, [trigger, isLight]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
