import React, { useState } from 'react';
import {
  Play,
  Pause,
  Sun,
  Moon,
  Sparkles,
  Flame,
  History,
  TrendingUp,
  Zap,
  ListMusic,
  Radio,
  Music,
  Heart
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { topPicks, recentlyPlayed, newMusicVideos, topOnMuzo, popularEpisodes, playlists } from '../data/homeData';
import { Track } from '../types';
import { AddToPlaylistModal } from './AddToPlaylistModal';

export function MainView() {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    recentlyPlayedTracks,
    theme,
    toggleTheme,
    setCurrentView,
    showToast
  } = useMusic();

  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<Track | null>(null);

  const profileAvatar = localStorage.getItem('pulse_profile_avatar') ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  const isWhite = theme === 'light';

  const handleTrackClick = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar transition-colors duration-200 ${
      isWhite ? 'bg-white text-zinc-900' : 'bg-dark-950 text-white'
    }`}>
      {/* 1. Header */}
      <header className={`px-4 pt-4 pb-3 sticky top-0 z-30 flex items-center justify-between backdrop-blur-xl border-b transition-colors ${
        isWhite ? 'bg-white/90 border-zinc-200' : 'bg-dark-950/90 border-dark-750'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5">
            Owner-Vibe
            <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
              PRO
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
              isWhite ? 'bg-zinc-100 border-zinc-300 text-zinc-800' : 'bg-dark-850 border-dark-750 text-slate-300'
            }`}
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => setCurrentView('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand-primary shadow-md active:scale-95 transition-transform"
            title="Open Profile"
          >
            <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="px-4 py-4 space-y-6 pb-44">
        {/* Continue Listening Hero Banner */}
        {currentTrack && (
          <div
            onClick={() => handleTrackClick(currentTrack)}
            className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r from-purple-950/80 via-dark-850 to-dark-900 border border-brand-primary/30 cursor-pointer shadow-xl transition-all active:scale-99"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                  <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md">
                      {isPlaying ? <Pause size={13} className="fill-white" /> : <Play size={13} className="fill-white ml-0.5" />}
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1">
                    <Radio size={12} className="animate-pulse" />
                    Continue Listening
                  </span>
                  <h3 className="text-sm font-bold truncate mt-0.5 text-white">{currentTrack.title}</h3>
                  <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recently Played */}
        {recentlyPlayedTracks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold flex items-center gap-2">
                <History size={17} className="text-brand-accent" />
                Recently Played
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              {recentlyPlayedTracks.map((item) => {
                const isCurrent = currentTrack?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleTrackClick(item)}
                    className="snap-start flex-shrink-0 w-28 cursor-pointer group"
                  >
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden mb-2 shadow-md bg-dark-800 border border-white/5">
                      <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg">
                          {isCurrent && isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white ml-0.5" />}
                        </div>
                      </div>
                    </div>
                    <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : ''}`}>{item.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.artist}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Top Picks (Vertical Posters) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Flame size={18} className="text-brand-secondary" />
              Top Picks For You
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">Curated</span>
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x">
            {topPicks.map((item) => {
              const isCurrent = currentTrack?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleTrackClick(item)}
                  className="snap-start flex-shrink-0 w-36 cursor-pointer group"
                >
                  <div className="relative w-36 h-48 rounded-2xl overflow-hidden mb-2 shadow-lg bg-dark-850 border border-dark-750">
                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-2.5">
                      <div className="self-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrackForPlaylist(item);
                          }}
                          className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ListMusic size={13} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {item.album}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg">
                          {isCurrent && isPlaying ? <Pause size={13} className="fill-white" /> : <Play size={13} className="fill-white ml-0.5" />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : ''}`}>{item.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.artist}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* New Music Videos & Trending (Wide 16:9) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Sparkles size={17} className="text-amber-400" />
              New Music Videos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newMusicVideos.map((item) => {
              const isCurrent = currentTrack?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleTrackClick(item)}
                  className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-dark-850 border border-dark-750 cursor-pointer group shadow-lg"
                >
                  <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3.5 flex flex-col justify-end">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 mr-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Trending</span>
                        <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                        <p className="text-xs text-slate-300 truncate">{item.artist}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                        {isCurrent && isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-white ml-0.5" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top on Chart */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold flex items-center gap-2">
              <TrendingUp size={17} className="text-brand-green" />
              Top on Muzo
            </h2>
          </div>
          <div className="space-y-1.5">
            {topOnMuzo.map((item, idx) => {
              const isCurrent = currentTrack?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleTrackClick(item)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl bg-dark-850/60 hover:bg-dark-800/90 border border-dark-750 cursor-pointer group transition-all ${
                    isCurrent ? 'border-brand-primary/40 bg-brand-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`w-5 text-center text-xs font-black ${
                      idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-brand-secondary'
                    }`}>
                      #{idx + 1}
                    </span>
                    <img src={item.coverUrl} alt={item.title} className="w-11 h-11 rounded-xl object-cover shadow-md flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : ''}`}>{item.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrackForPlaylist(item);
                      }}
                      className="p-1.5 rounded-full hover:bg-dark-700 text-slate-400 hover:text-white"
                    >
                      <ListMusic size={15} />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-dark-750 group-hover:bg-brand-primary text-white flex items-center justify-center transition-colors">
                      {isCurrent && isPlaying ? <Pause size={12} className="fill-white" /> : <Play size={12} className="fill-white ml-0.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Curated Playlists */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Music size={17} className="text-purple-400" />
              Featured Playlists
            </h2>
          </div>
          <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setCurrentView('library')}
                className="snap-start flex-shrink-0 w-36 rounded-2xl p-2.5 bg-dark-850/70 hover:bg-dark-800 border border-dark-750 cursor-pointer group transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-md">
                  <img src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg">
                      <Play size={15} className="fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{pl.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{pl.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Episodes / Podcasts */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Radio size={17} className="text-cyan-400" />
              Popular Episodes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularEpisodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => handleTrackClick(ep)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-dark-850/60 hover:bg-dark-800 border border-dark-750 cursor-pointer group transition-all"
              >
                <img src={ep.coverUrl} alt={ep.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-md" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{ep.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{ep.artist}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-dark-750 group-hover:bg-brand-primary text-white flex items-center justify-center transition-colors">
                  <Play size={12} className="fill-white ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
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
