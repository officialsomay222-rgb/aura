import React, { useEffect, useRef } from 'react';
import { LyricLine } from '../../types/music';

interface LyricsViewProps {
  lyrics?: LyricLine[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const LyricsView: React.FC<LyricsViewProps> = ({ lyrics, currentTime, onSeek }) => {
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-6">
        <p className="text-base font-medium">No lyrics available for this track.</p>
        <p className="text-xs text-slate-500 mt-1">Enjoy the instrumental melody!</p>
      </div>
    );
  }

  // Find the current active line
  let activeIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="h-[320px] overflow-y-auto px-6 py-8 space-y-6 text-center select-none"
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;

        return (
          <p
            key={idx}
            ref={isActive ? activeLineRef : null}
            onClick={() => onSeek(line.time)}
            className={`transition-all duration-300 cursor-pointer font-semibold ${
              isActive
                ? 'text-white text-xl scale-105 tracking-wide drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]'
                : isPast
                ? 'text-slate-500 text-base opacity-70 hover:text-slate-300'
                : 'text-slate-600 text-base opacity-50 hover:text-slate-400'
            }`}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
};
