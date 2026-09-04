import React from 'react';
import { Play, Pause, SkipForward, Heart, Loader2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    togglePlay,
    nextTrack,
    setIsFullScreenOpen
  } = useAudio();

  const { isLiked, toggleLike } = useLibrary();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  return (
    <div className="relative bg-dark-900/95 backdrop-blur-xl border-t border-dark-700/80 shadow-2xl transition-all">
      {/* Top progress line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-dark-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Track info & Cover - Click to expand */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          onClick={() => setIsFullScreenOpen(true)}
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-md border border-white/5">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate group-hover:text-brand-primary transition-colors">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pl-2">
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentTrack.id);
            }}
            className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={18}
              className={liked ? 'text-brand-secondary fill-brand-secondary' : 'text-slate-400'}
            />
          </button>

          {/* Play / Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : isPlaying ? (
              <Pause size={18} className="fill-white" />
            ) : (
              <Play size={18} className="fill-white ml-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Next Track"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
