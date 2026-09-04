import React, { useState } from 'react';
import { Search as SearchIcon, X, Play, Heart, Music } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { GENRES } from '../../data/mockTracks';

export const SearchView: React.FC = () => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { tracks, isLiked, toggleLike } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      selectedGenre === 'All' || track.genre.toLowerCase() === selectedGenre.toLowerCase();

    return matchesSearch && matchesGenre;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-4 select-none overflow-y-auto max-h-full">
      <h1 className="text-2xl font-black tracking-tight text-white">
        Search & Explore
      </h1>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <SearchIcon size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, or genres..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-dark-850 border border-dark-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Genre Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === genre
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                : 'bg-dark-850 text-slate-400 hover:text-white border border-dark-750'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Track Results */}
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1 pb-1">
          <span>{filteredTracks.length} tracks found</span>
        </div>

        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center text-slate-500">
              <Music size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-300">No tracks found</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or genre filter.</p>
          </div>
        ) : (
          filteredTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const liked = isLiked(track.id);

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, filteredTracks)}
                className={`flex items-center justify-between p-2.5 rounded-2xl bg-dark-850/50 hover:bg-dark-800/80 border border-dark-700/50 cursor-pointer group transition-all duration-200 active:scale-98 ${
                  isCurrent ? 'border-brand-primary/40 bg-brand-primary/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${
                      isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <Play size={16} className="fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {track.artist} • <span className="text-brand-accent">{track.genre}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {formatTime(track.duration)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className="p-2 rounded-full hover:bg-dark-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <Heart
                      size={17}
                      className={liked ? 'text-brand-secondary fill-brand-secondary' : 'text-slate-400'}
                    />
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
