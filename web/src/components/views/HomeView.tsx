import React from 'react';
import { Play, Sparkles, Flame, Clock, Radio, UploadCloud } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { ActiveTab, Track } from '../../types/music';

interface HomeViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenImport: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigateTab, onOpenImport }) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { tracks, playlists, recentTrackIds, getTrackById } = useLibrary();

  const recentTracks = recentTrackIds
    .map((id) => getTrackById(id))
    .filter((t): t is Track => Boolean(t))
    .slice(0, 6);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handlePlayPlaylist = (trackIds: string[]) => {
    const playlistTracks = trackIds
      .map((id) => getTrackById(id))
      .filter((t): t is Track => Boolean(t));

    if (playlistTracks.length > 0) {
      playTrack(playlistTracks[0], playlistTracks);
    }
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-6 select-none overflow-y-auto max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} />
            {getGreeting()}
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
            PulseMusic
          </h1>
        </div>
        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800 hover:bg-dark-700 border border-white/10 text-xs font-medium text-slate-300 transition-all active:scale-95"
          title="Import MP3s"
        >
          <UploadCloud size={15} className="text-brand-accent" />
          <span>Import MP3</span>
        </button>
      </div>

      {/* Quick Play Grid (4 cards) */}
      <div className="grid grid-cols-2 gap-2.5">
        {tracks.slice(0, 4).map((track) => {
          const isCurrent = currentTrack?.id === track.id;

          return (
            <div
              key={track.id}
              onClick={() => playTrack(track, tracks)}
              className={`flex items-center gap-2.5 p-2 rounded-xl bg-dark-850/80 hover:bg-dark-800/90 border border-dark-700/60 cursor-pointer group transition-all duration-200 active:scale-98 ${
                isCurrent ? 'border-brand-primary/50 bg-brand-primary/10' : ''
              }`}
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                  {track.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {track.artist}
                </p>
              </div>
              <div className={`w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 transition-opacity ${
                isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <Play size={12} className="fill-white ml-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Mixes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame size={18} className="text-brand-secondary" />
            Curated Mixes
          </h2>
          <button
            onClick={() => onNavigateTab('library')}
            className="text-xs font-semibold text-slate-400 hover:text-brand-primary transition-colors"
          >
            See all
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handlePlayPlaylist(playlist.trackIds)}
              className="flex-shrink-0 w-40 bg-dark-850/70 hover:bg-dark-800 rounded-2xl p-3 border border-dark-700/60 cursor-pointer group transition-all active:scale-98 snap-start"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 shadow-lg">
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg">
                    <Play size={18} className="fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <h3 className="text-xs font-bold text-white truncate">
                {playlist.title}
              </h3>
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                {playlist.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      {recentTracks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-brand-accent" />
              Recently Played
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {recentTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, tracks)}
                className="flex-shrink-0 w-28 text-center cursor-pointer group snap-start"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-1.5 shadow-md border border-white/5">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {currentTrack?.id === track.id && (
                    <div className="absolute inset-0 bg-brand-primary/30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-white truncate">
                  {track.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {track.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood & Genre Quick Jump */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Radio size={18} className="text-brand-green" />
          Soundscapes
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Late Night Lofi', color: 'from-purple-900 to-indigo-900', desc: 'Chill & Study' },
            { name: 'Synthwave Cruise', color: 'from-pink-900 to-rose-900', desc: '80s Retro Neon' },
            { name: 'Deep Space Ambient', color: 'from-cyan-950 to-blue-900', desc: 'Focus & Meditation' },
            { name: 'Pure Acoustic', color: 'from-amber-950 to-orange-900', desc: 'Organic Melodies' },
          ].map((card, i) => (
            <div
              key={i}
              onClick={() => onNavigateTab('search')}
              className={`p-3 rounded-xl bg-gradient-to-br ${card.color} border border-white/10 cursor-pointer hover:opacity-90 active:scale-98 transition-all`}
            >
              <h4 className="text-xs font-bold text-white">{card.name}</h4>
              <p className="text-[10px] text-slate-300 mt-0.5">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
