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
  Plus,
  Radio,
  Music,
  Heart
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { Track } from '../../types/music';
import { AddToPlaylistModal } from '../AddToPlaylistModal';

interface HomeViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenProfile: () => void;
  themeMode: 'dark' | 'light' | 'dynamic';
  onToggleTheme: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateTab,
  onOpenProfile,
  themeMode,
  onToggleTheme,
}) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();
  const { tracks, recentTrackIds, getTrackById, isLiked, toggleLike } = useLibrary();

  const [selectedTrackForModal, setSelectedTrackForModal] = useState<Track | null>(null);

  // Profile avatar
  const profileAvatar = localStorage.getItem('pulse_profile_avatar') ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  // Owner-Vibe Top Picks
  const topPicks: Track[] = [
    {
      id: 'tp-1',
      title: 'Kesariya',
      artist: 'Arijit Singh, Pritam',
      album: 'Brahmastra',
      duration: 268,
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      genre: 'Bollywood / Romantic',
    },
    {
      id: 'tp-2',
      title: 'Believer',
      artist: 'Imagine Dragons',
      album: 'Evolve',
      duration: 204,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400&h=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      genre: 'Alt Rock / Global Hits',
    },
    {
      id: 'tp-3',
      title: 'Tauba Tauba',
      artist: 'Karan Aujla',
      album: 'Bad Newz',
      duration: 206,
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5646a?auto=format&fit=crop&q=80&w=400&h=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      genre: 'Punjabi / Hip Hop',
    },
  ];

  // Owner-Vibe New Hits & Trending Video Banners
  const trendingHits: Track[] = [
    {
      id: 'nm-1',
      title: 'Chuttamalle',
      artist: 'Anirudh Ravichander, Shilpa Rao',
      album: 'Devara',
      duration: 220,
      coverUrl: 'https://images.unsplash.com/photo-1621360811013-c76831f16283?auto=format&fit=crop&q=80&w=600&h=338',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      genre: 'Trending Now',
    },
    {
      id: 'nm-2',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 200,
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5646a?auto=format&fit=crop&q=80&w=600&h=338',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      genre: 'Synthwave Pop',
    },
  ];

  // Top Charts on Muzo / Pulse
  const topOnCharts: Track[] = [
    {
      id: 'tm-1',
      title: 'Tum Hi Ho',
      artist: 'Arijit Singh',
      album: 'Aashiqui 2',
      duration: 262,
      coverUrl: 'https://images.unsplash.com/photo-1598387181032-a3103ea27146?auto=format&fit=crop&q=80&w=300&h=300',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      genre: 'Evergreen Hindi',
    },
    {
      id: 'tm-2',
      title: 'Espresso',
      artist: 'Sabrina Carpenter',
      album: 'Short n Sweet',
      duration: 175,
      coverUrl: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=300&h=300',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      genre: 'Global Top 50',
    },
    {
      id: 'tm-3',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      album: 'Divide',
      duration: 233,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      genre: 'Pop Anthem',
    },
  ];

  const recentTracks = recentTrackIds
    .map((id) => getTrackById(id))
    .filter((t): t is Track => Boolean(t))
    .slice(0, 8);

  const handleTrackClick = (track: Track, queueList?: Track[]) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, queueList || [track, ...tracks]);
    }
  };

  return (
    <div className="pb-32 px-4 pt-3 space-y-6 select-none overflow-y-auto max-h-full">
      {/* Top Header matching Owner-Vibe style */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Zap size={17} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Owner-Vibe
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                PRO
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full bg-dark-850 hover:bg-dark-800 border border-dark-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {themeMode === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand-primary shadow-md hover:scale-105 active:scale-95 transition-transform"
            title="Open Profile"
          >
            <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      {/* Hero Continue Listening Card */}
      {currentTrack && (
        <div
          onClick={() => handleTrackClick(currentTrack)}
          className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r from-purple-950/80 via-dark-850 to-dark-900 border border-brand-primary/30 cursor-pointer group shadow-xl transition-all active:scale-99"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md">
                    {isPlaying ? (
                      <Pause size={13} className="fill-white" />
                    ) : (
                      <Play size={13} className="fill-white ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1">
                  <Radio size={12} className="animate-pulse" />
                  Continue Listening
                </p>
                <h3 className="text-sm font-bold text-white truncate mt-0.5">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack.id);
              }}
              className="p-2 rounded-full hover:bg-dark-800 text-slate-400 hover:text-white"
            >
              <Heart
                size={18}
                className={isLiked(currentTrack.id) ? 'fill-brand-secondary text-brand-secondary' : ''}
              />
            </button>
          </div>
        </div>
      )}

      {/* Recently Played Horizontal Carousel */}
      {recentTracks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History size={17} className="text-brand-accent" />
              Recently Played
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {recentTracks.map((item) => {
              const isCurrent = currentTrack?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleTrackClick(item, recentTracks)}
                  className="snap-start flex-shrink-0 w-28 cursor-pointer group"
                >
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden mb-2 shadow-md bg-dark-800 border border-white/5">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <div className="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg">
                        {isCurrent && isPlaying ? (
                          <Pause size={14} className="fill-white" />
                        ) : (
                          <Play size={14} className="fill-white ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Owner-Vibe Top Picks (Vertical Poster Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
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
                onClick={() => handleTrackClick(item, topPicks)}
                className="snap-start flex-shrink-0 w-36 cursor-pointer group"
              >
                <div className="relative w-36 h-48 rounded-2xl overflow-hidden mb-2 shadow-lg bg-dark-850 border border-dark-750">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-2.5">
                    <div className="self-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrackForModal(item);
                        }}
                        className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                        title="Add to Playlist"
                      >
                        <ListMusic size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {item.genre}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg">
                        {isCurrent && isPlaying ? (
                          <Pause size={13} className="fill-white" />
                        ) : (
                          <Play size={13} className="fill-white ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.artist}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending Video Hits (Wide 16:9 Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles size={17} className="text-amber-400" />
            Trending Music & Videos
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trendingHits.map((item) => {
            const isCurrent = currentTrack?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleTrackClick(item, trendingHits)}
                className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-dark-850 border border-dark-750 cursor-pointer group shadow-lg"
              >
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {item.genre}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      <p className="text-xs text-slate-300 truncate">{item.artist}</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                      {isCurrent && isPlaying ? (
                        <Pause size={16} className="fill-white" />
                      ) : (
                        <Play size={16} className="fill-white ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top on Chart (Ranked List) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp size={17} className="text-brand-green" />
            Top Charts
          </h2>
          <button
            onClick={() => onNavigateTab('search')}
            className="text-xs font-semibold text-brand-primary"
          >
            Explore
          </button>
        </div>

        <div className="space-y-1.5">
          {topOnCharts.map((item, idx) => {
            const isCurrent = currentTrack?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleTrackClick(item, topOnCharts)}
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

                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-md"
                  />

                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrackForModal(item);
                    }}
                    className="p-1.5 rounded-full hover:bg-dark-700 text-slate-400 hover:text-white"
                  >
                    <ListMusic size={15} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-dark-750 group-hover:bg-brand-primary text-white flex items-center justify-center transition-colors">
                    {isCurrent && isPlaying ? (
                      <Pause size={12} className="fill-white" />
                    ) : (
                      <Play size={12} className="fill-white ml-0.5" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        track={selectedTrackForModal}
        onClose={() => setSelectedTrackForModal(null)}
      />
    </div>
  );
};
