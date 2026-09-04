import React from 'react';
import { Heart, Play, Shuffle, Music } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { Track } from '../../types/music';

export const FavoritesView: React.FC = () => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { likedTrackIds, toggleLike, getTrackById } = useLibrary();

  const likedTracks = likedTrackIds
    .map((id) => getTrackById(id))
    .filter((t): t is Track => Boolean(t));

  const totalDurationSecs = likedTracks.reduce((acc, t) => acc + t.duration, 0);
  const totalMinutes = Math.floor(totalDurationSecs / 60);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayAll = (shuffle: boolean = false) => {
    if (likedTracks.length === 0) return;
    const queueToPlay = shuffle ? [...likedTracks].sort(() => Math.random() - 0.5) : likedTracks;
    playTrack(queueToPlay[0], queueToPlay);
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-4 select-none overflow-y-auto max-h-full">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-pink-900/60 via-purple-900/40 to-dark-900 border border-pink-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-secondary to-purple-600 flex items-center justify-center text-white shadow-xl shadow-brand-secondary/30 flex-shrink-0">
            <Heart size={36} className="fill-white" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400">
              Collection
            </span>
            <h1 className="text-2xl font-black text-white">Liked Songs</h1>
            <p className="text-xs text-slate-300 mt-1">
              {likedTracks.length} tracks • {totalMinutes} mins of music
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 mt-5">
          <button
            onClick={() => handlePlayAll(false)}
            disabled={likedTracks.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-secondary to-purple-600 text-white text-xs font-bold shadow-lg shadow-brand-secondary/25 hover:scale-102 active:scale-95 transition-all disabled:opacity-40"
          >
            <Play size={15} className="fill-white" />
            Play
          </button>

          <button
            onClick={() => handlePlayAll(true)}
            disabled={likedTracks.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-semibold border border-white/10 active:scale-95 transition-all disabled:opacity-40"
          >
            <Shuffle size={15} />
            Shuffle
          </button>
        </div>
      </div>

      {/* Liked Tracks List */}
      <div className="space-y-1.5 pt-1">
        {likedTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center text-slate-500">
              <Music size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-300">No liked songs yet</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Tap the heart icon on any song to add it to your favorites list!
            </p>
          </div>
        ) : (
          likedTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, likedTracks)}
                className={`flex items-center justify-between p-2.5 rounded-2xl bg-dark-850/50 hover:bg-dark-800 border border-dark-700/50 cursor-pointer group transition-all active:scale-98 ${
                  isCurrent ? 'border-brand-primary/40 bg-brand-primary/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${
                      isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <Play size={16} className="fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {formatTime(track.duration)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className="p-2 rounded-full hover:bg-dark-700 text-brand-secondary transition-colors"
                  >
                    <Heart size={17} className="fill-brand-secondary" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
