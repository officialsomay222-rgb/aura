import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Play, Pause, Heart, ListMusic, Loader2, Music, Sparkles } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { Track } from '../../types/music';
import { searchJioSaavn } from '../../lib/jiosaavnClient';
import { AddToPlaylistModal } from '../AddToPlaylistModal';

export const SearchView: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();
  const { tracks: initialTracks, isLiked, toggleLike } = useLibrary();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTrackForModal, setSelectedTrackForModal] = useState<Track | null>(null);

  const searchDebounce = useRef<number | null>(null);

  const categories = [
    { title: 'Global Top 50', query: 'Top Hits', color: 'from-amber-500 to-rose-600' },
    { title: 'Synthwave & Retro', query: 'Synthwave', color: 'from-purple-600 to-indigo-600' },
    { title: 'Bollywood Hits', query: 'Arijit Singh', color: 'from-pink-600 to-rose-500' },
    { title: 'Hip Hop & Punjabi', query: 'Karan Aujla', color: 'from-emerald-500 to-teal-700' },
    { title: 'Chill & Lo-Fi', query: 'Lofi Chill', color: 'from-blue-500 to-cyan-600' },
    { title: 'EDM & Dance', query: 'EDM', color: 'from-fuchsia-600 to-pink-500' },
  ];

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1. Search local curated library
      const localMatches = initialTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // 2. Query live JioSaavn stream API
      const liveMatches = await searchJioSaavn(searchTerm);

      // Combine results with local matches first
      const combined = [...localMatches, ...liveMatches];
      const unique = combined.filter(
        (t, idx, arr) => arr.findIndex((x) => x.title.toLowerCase() === t.title.toLowerCase()) === idx
      );

      setResults(unique);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedCategory(null);

    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = window.setTimeout(() => {
      performSearch(val);
    }, 450);
  };

  const handleCategoryClick = (cat: typeof categories[0]) => {
    setSelectedCategory(cat.title);
    setQuery(cat.query);
    performSearch(cat.query);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="pb-32 px-4 pt-3 space-y-4 select-none overflow-y-auto max-h-full">
      <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
        Search & Stream
        <Sparkles size={18} className="text-brand-primary" />
      </h1>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <SearchIcon size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search any song, artist, album, or genre..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-dark-850 border border-dark-750 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills / Badges */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.title}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.title
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                : 'bg-dark-850 text-slate-400 hover:text-white border border-dark-750'
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Results / Empty Browse State */}
      <div className="space-y-1.5 pt-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <Loader2 size={28} className="animate-spin text-brand-primary" />
            <p className="text-xs text-slate-400 font-medium">Searching live streaming audio...</p>
          </div>
        ) : query && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center text-slate-500">
              <Music size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-300">No tracks found</p>
            <p className="text-xs text-slate-500">Try another search term or check spelling.</p>
          </div>
        ) : query && results.length > 0 ? (
          <>
            <p className="text-xs font-semibold text-slate-400 px-1 pb-1">
              Found {results.length} songs
            </p>
            {results.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const liked = isLiked(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playTrack(track, results);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-2xl bg-dark-850/60 hover:bg-dark-800 border border-dark-750 cursor-pointer group transition-all duration-200 active:scale-98 ${
                    isCurrent ? 'border-brand-primary/40 bg-brand-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {isCurrent && isPlaying ? (
                          <Pause size={16} className="fill-white" />
                        ) : (
                          <Play size={16} className="fill-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {track.artist} • <span className="text-brand-accent">{track.album}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2">
                    <span className="text-[11px] text-slate-500 font-medium mr-1">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrackForModal(track);
                      }}
                      className="p-1.5 rounded-full hover:bg-dark-700 text-slate-400 hover:text-white"
                      title="Add to Playlist"
                    >
                      <ListMusic size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-dark-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <Heart
                        size={16}
                        className={liked ? 'text-brand-secondary fill-brand-secondary' : 'text-slate-400'}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          /* Browse Categories Grid */
          <div className="pt-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Browse All Genres
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => (
                <div
                  key={cat.title}
                  onClick={() => handleCategoryClick(cat)}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} cursor-pointer hover:opacity-95 active:scale-98 transition-all shadow-md`}
                >
                  <h4 className="text-xs font-black text-white">{cat.title}</h4>
                  <p className="text-[10px] text-white/80 mt-1">Tap to stream</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddToPlaylistModal
        track={selectedTrackForModal}
        onClose={() => setSelectedTrackForModal(null)}
      />
    </div>
  );
};
