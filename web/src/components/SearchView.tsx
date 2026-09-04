import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Play, Pause, Sparkles, TrendingUp, Music, Zap, ListMusic } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Track } from '../types';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import { searchJioSaavn } from '../lib/jiosaavnClient';
import { ytifyResolver } from '../lib/ytifyResolver';

export function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<Track | null>(null);
  const { playTrack, currentTrack, isPlaying, togglePlayPause, showToast, theme, lastListenedTrack } = useMusic();
  const searchTimeout = useRef<number | null>(null);
  const suggestTimeout = useRef<number | null>(null);

  const isWhite = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  const isDynamic = theme === 'dynamic';

  const categories = [
    { title: 'Global Top 50', query: 'Top Hits 2026', color: 'from-amber-500 to-rose-600' },
    { title: 'Synthwave & Retro', query: 'Synthwave electronic', color: 'from-purple-600 to-indigo-600' },
    { title: 'Hip Hop & Rap', query: 'Hip Hop Rap hits', color: 'from-emerald-500 to-teal-700' },
    { title: 'Chill & Lo-Fi', query: 'Chill acoustic lo-fi', color: 'from-blue-500 to-cyan-600' },
    { title: 'Rock & Indie', query: 'Indie Rock alternative', color: 'from-red-600 to-orange-500' },
    { title: 'EDM & Dance', query: 'EDM Dance festival', color: 'from-fuchsia-600 to-pink-500' },
  ];

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      let saavnTracks: Track[] = [];
      try {
        saavnTracks = await searchJioSaavn(searchTerm);
      } catch (e) {}

      let ytTracks: Track[] = [];
      try {
        ytTracks = await ytifyResolver.searchYtify(searchTerm);
      } catch (e) {}

      const seen = new Set();
      const combined = [...saavnTracks, ...ytTracks].filter(t => {
        const k = (t.title + ' ' + t.artist).toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      setResults(combined);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (suggestTimeout.current) window.clearTimeout(suggestTimeout.current);

    suggestTimeout.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          const items: string[] = [];
          if (data?.songs?.data) {
            items.push(...data.songs.data.map((s: any) => s.title));
          }
          if (data?.albums?.data) {
            items.push(...data.albums.data.map((s: any) => s.title));
          }
          if (items.length > 0) {
            setSuggestions(items.slice(0, 6));
          }
        }
      } catch (e) {}
    }, 250);

    return () => {
      if (suggestTimeout.current) window.clearTimeout(suggestTimeout.current);
    };
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);

    searchTimeout.current = window.setTimeout(() => {
      performSearch(query);
    }, 400);

    return () => {
      if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    };
  }, [query]);

  const handleCategoryClick = (cat: typeof categories[0]) => {
    setSelectedCategory(cat.title);
    setQuery(cat.query);
    performSearch(cat.query);
    showToast(`Showing ${cat.title}`);
  };

  const handleSuggestionClick = (suggestText: string) => {
    setQuery(suggestText);
    setSuggestions([]);
    performSearch(suggestText);
  };

  const handleSelectTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
      showToast(`Playing: ${track.title}`);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-200 ${
      isDynamic 
        ? 'bg-black/40 backdrop-blur-3xl text-white' 
        : isWhite 
          ? 'bg-white text-zinc-900' 
          : 'bg-[#121212] text-white'
    }`}>
      
      {/* Sticky Header with Search Input */}
      <div className={`px-4 pt-safe pt-3 pb-3 sticky top-0 z-30 transition-colors ${
        isDynamic
          ? 'bg-black/30 border-b border-white/10 backdrop-blur-md'
          : isWhite 
            ? 'bg-white border-b border-zinc-200' 
            : 'bg-[#121212] border-b border-zinc-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Search</h1>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <SearchIcon className={`absolute left-3 w-5 h-5 ${isWhite ? 'text-zinc-400' : 'text-zinc-500'}`} />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className={`w-full h-12 pl-10 pr-10 rounded-xl text-sm font-medium focus:outline-none transition-colors ${
              isDynamic
                ? 'bg-black/30 text-white placeholder:text-zinc-400 border border-white/10 focus:bg-black/50'
                : isWhite
                  ? 'bg-zinc-100/50 text-black placeholder:text-zinc-500 focus:bg-zinc-200/80'
                  : 'bg-zinc-800/50 text-white placeholder:text-zinc-400 focus:bg-zinc-700/80'
            }`}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSuggestions([]);
                setSelectedCategory(null);
              }}
              className={`absolute right-3 p-1.5 rounded-full hover:opacity-70 transition-opacity ${isDynamic ? 'text-white' : 'text-zinc-400'}`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Live Auto-complete Suggestions Dropdown */}
        {suggestions.length > 0 && query.trim() !== '' && (
          <div className={`absolute left-4 right-4 top-[95px] mt-2 p-2 rounded-xl border shadow-xl z-50 backdrop-blur-xl ${
            isDynamic ? 'bg-black/50 border-white/10' : isWhite ? 'bg-white/90 border-zinc-200' : 'bg-zinc-900/90 border-zinc-800'
          }`}>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sug)}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    isDynamic
                      ? 'bg-black/40 hover:bg-black/60 text-white border border-white/5'
                      : isWhite 
                        ? 'bg-zinc-100 hover:bg-emerald-50 text-zinc-800' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <SearchIcon className="w-4 h-4 opacity-60" />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 pb-[160px]">
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Search Results List */}
        {!loading && query.trim() !== '' && (
          <div className="space-y-1">
            <div className="pb-3 text-sm font-semibold text-zinc-500">
              {results.length} results found
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 opacity-60 text-sm">
                No tracks found for "{query}"
              </div>
            ) : (
              results.map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                      isCurrent
                        ? isWhite ? 'bg-emerald-50' : 'bg-emerald-900/20'
                        : isWhite ? 'hover:bg-zinc-100' : 'hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            {isPlaying ? (
                              <div className="flex items-end gap-0.5 h-3">
                                <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-full" />
                                <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-3/4" />
                                <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite_300ms] h-1/2" />
                              </div>
                            ) : (
                              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-emerald-500' : isWhite ? 'text-zinc-900' : 'text-zinc-100'
                        }`}>
                          {track.title}
                        </h4>
                        <p className={`text-xs truncate mt-0.5 ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className={`text-xs font-mono ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {formatDuration(track.duration)}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrackForPlaylist(track);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          isWhite ? 'hover:bg-zinc-200 text-zinc-600' : 'hover:bg-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <ListMusic className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Empty State / Browse Categories & Suggestions */}
        {!loading && query.trim() === '' && (
          <div className="space-y-6">
            {/* Quick taste search based on last listened track */}
            {lastListenedTrack && (
              <div className={`p-4 rounded-xl transition-colors ${
                isWhite ? 'bg-emerald-50' : 'bg-emerald-900/10'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-emerald-500">
                    Based on your recent listening
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lastListenedTrack.artist && (
                    <button
                      onClick={() => {
                        setQuery(lastListenedTrack.artist);
                        performSearch(lastListenedTrack.artist);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isWhite ? 'bg-white text-zinc-900 hover:bg-emerald-100 shadow-sm' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      More from {lastListenedTrack.artist}
                    </button>
                  )}
                  {lastListenedTrack.title && (
                    <button
                      onClick={() => {
                        const q = `${lastListenedTrack.title} remix`;
                        setQuery(q);
                        performSearch(q);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isWhite ? 'bg-white text-zinc-900 hover:bg-emerald-100 shadow-sm' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      Remixes of {lastListenedTrack.title}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold">Browse Categories</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.title}
                    onClick={() => handleCategoryClick(cat)}
                    className={`h-24 p-4 rounded-xl bg-gradient-to-br ${cat.color} text-white font-bold cursor-pointer relative overflow-hidden flex flex-col justify-between`}
                  >
                    <span className="text-sm font-bold leading-tight">{cat.title}</span>
                    <div className="flex items-center justify-between text-xs opacity-90">
                      <span>Explore</span>
                      <Music className="w-4 h-4 opacity-70" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {selectedTrackForPlaylist && (
        <AddToPlaylistModal 
          track={selectedTrackForPlaylist} 
          onClose={() => setSelectedTrackForPlaylist(null)} 
        />
      )}
    </div>
  );
}
