import React from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, barCount = 18, height = 36 }) => {
  // Deterministic heights for visually pleasing frequency curve
  const baseHeights = [30, 45, 75, 90, 60, 40, 85, 100, 70, 50, 80, 95, 65, 45, 70, 55, 35, 25];

  return (
    <div
      className="flex items-end justify-center gap-[3px] px-3 py-1"
      style={{ height: `${height}px` }}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const heightPercent = isPlaying ? baseHeights[i % baseHeights.length] : 12;
        const animDelay = `${(i * 0.08).toFixed(2)}s`;
        const animDuration = `${0.6 + ((i % 4) * 0.15)}s`;

        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all duration-200"
            style={{
              height: `${heightPercent}%`,
              background: 'linear-gradient(to top, #8b5cf6, #06b6d4)',
              opacity: isPlaying ? 0.9 : 0.25,
              animation: isPlaying ? `pulseBar ${animDuration} ease-in-out infinite alternate ${animDelay}` : 'none'
            }}
          />
        );
      })}

      <style>{`
        @keyframes pulseBar {
          0% { height: 15%; opacity: 0.5; }
          50% { height: 85%; opacity: 1; }
          100% { height: 40%; opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};
