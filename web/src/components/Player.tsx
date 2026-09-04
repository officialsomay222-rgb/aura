import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronDown,
  Infinity,
  Shuffle,
  Volume2,
  VolumeX,
  Mic2,
  ListMusic,
  Download,
  Share2, MoreVertical, Check, Plus,
  Heart,
  Sparkles,
  X,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Visualizer } from './Visualizer';
import { AddToPlaylistModal } from './AddToPlaylistModal';

export function Player() {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    nextTrack,
    prevTrack,
    progress,
    seekTo,
    volume,
    trackDuration,
    setVolume,
    showToast,
    theme,
    downloadTrack,
    offlineTracks,
    removeDownload,
    playlists,
    addToPlaylist,
    isRepeat,
    setIsRepeat,
    isShuffle,
    setIsShuffle
  } = useMusic();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const isWhite = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  const isDynamic = theme === 'dynamic';

  if (!currentTrack) return null;

  const isOffline = offlineTracks?.some(t => t.id === currentTrack.id);
  const handleDownload = async () => {
    if (isOffline) {
      await removeDownload(currentTrack.id);
    } else {
      setIsDownloading(true);
      showToast('Downloading to library...');
      await downloadTrack(currentTrack);
      setIsDownloading(false);
    }
    setShowMenu(false);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    seekTo(percent * trackDuration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sampleLyrics = [
    { time: 0, text: `[Instrumental Intro - ${currentTrack.artist}]` },
    { time: 8, text: 'City lights reflection on the road tonight' },
    { time: 20, text: 'Hear the rhythm beating in the starry light' },
    { time: 35, text: `Feel the lossless frequency of ${currentTrack.title}` },
    { time: 55, text: 'Moving with the pulse, we are infinite and free' },
    { time: 85, text: 'High above the skyline where the echoes play' },
    { time: 120, text: 'Lost inside the sound until the break of day' },
  ];

  return (
    <>
      {/* Mini Player */}
      
        {!isExpanded && (
          <div
            onClick={() => setIsExpanded(true)}
            className={`fixed bottom-[94px] left-4 right-4 h-[64px] rounded-2xl z-40 backdrop-blur-2xl flex items-center justify-between overflow-hidden cursor-pointer px-2.5 transition-all max-w-[94vw] sm:max-w-md mx-auto ${
              isDynamic
                ? 'bg-black/60 border border-white/20 shadow-[0_12px_35px_rgba(0,0,0,0.5)] text-white'
                : isWhite
                ? 'bg-white/95 border border-zinc-300 shadow-[0_12px_35px_rgba(0,0,0,0.15)] text-black'
                : 'bg-zinc-950/95 border border-white/15 shadow-[0_12px_35px_rgba(0,0,0,0.8)] text-white'
            }`}
          >
            <Visualizer />

            {/* Micro Scrub Bar at the bottom */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[3px] z-20 group ${
                isWhite ? 'bg-zinc-200' : 'bg-zinc-800'
              }`}
              onClick={handleSeek}
            >
              <div
                className={`h-full rounded-r-full transition-colors relative ${
                  isWhite ? 'bg-black' : 'bg-white'
                }`}
                style={{
                  width: `${Math.min(100, (progress / Math.max(1, trackDuration)) * 100)}%`,
                }}
              >
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 ${
                    isWhite ? 'bg-black' : 'bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Left Track Info */}
            <div className="flex items-center gap-3 z-10 overflow-hidden flex-1 pl-1">
              <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-black/20">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover animate-[spin_8s_linear_infinite]"
                  style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                />
                <div className="absolute inset-0 rounded-full border border-black/20 pointer-events-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]" />
                
              </div>
              <div className="truncate pr-2 text-left">
                <h4
                  className={`text-[13px] font-black truncate leading-tight tracking-tight ${
                    isWhite ? 'text-black' : 'text-white'
                  }`}
                >
                  {currentTrack.title}
                </h4>
                <p
                  className={`text-[11px] truncate mt-0.5 font-medium ${
                    isWhite ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Right Mini Controls */}
            <div className="flex items-center gap-1.5 z-10 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform shadow-md ${
                  isWhite ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextTrack();
                }}
                className={`w-9 h-9 flex items-center justify-center active:scale-90 transition-all ${
                  isWhite ? 'text-zinc-700 hover:text-black' : 'text-zinc-300 hover:text-white'
                }`}
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        )}
      

      {/* Expanded Full-Screen Studio Player */}
      
        {isExpanded && (
          <div
            className={`fixed inset-0 z-[100] backdrop-blur-3xl flex flex-col items-center px-6 pb-safe pt-safe overflow-y-auto custom-scrollbar transition-colors ${
              isDynamic
                ? 'bg-black/60 text-white'
                : isWhite 
                  ? 'bg-white text-zinc-900' 
                  : 'bg-black text-white'
            }`}
          >
            {/* Ambient Artwork Glow in Dark Mode */}
            {!isWhite && (
              <div
                className="absolute inset-0 opacity-20 filter blur-[120px] pointer-events-none"
                style={{
                  backgroundImage: `url(${currentTrack.coverUrl})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              />
            )}

            {/* Top Bar */}
            <div className="w-full max-w-md z-50 flex items-center justify-between mb-4 mt-5 shrink-0">
              <button
                onClick={() => setIsExpanded(false)}
                className={`p-2 -ml-2 rounded-full transition-colors active:scale-90 ${
                  isWhite ? 'text-zinc-700 hover:bg-zinc-100' : 'text-zinc-300 hover:bg-white/10'
                }`}
              >
                <ChevronDown className="w-7 h-7" />
              </button>

              <div className="flex flex-col items-center">
                <span
                  className={`text-[10px] font-black tracking-widest uppercase ${
                    isWhite ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  Playing From Studio
                </span>
                <span className="text-xs font-bold truncate max-w-[180px]">
                  {currentTrack.album || 'Studio Master'}
                </span>
              </div>

              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-2 rounded-full transition-colors active:scale-90 ${
                    isWhite ? 'text-zinc-700 hover:bg-zinc-100' : 'text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <MoreVertical className="w-6 h-6" />
                </button>
                {showMenu && (
                  <div className={`absolute top-12 right-0 w-48 rounded-2xl shadow-xl border overflow-hidden z-50 ${isWhite ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <button onClick={handleDownload} className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/10 ${isWhite ? 'text-zinc-800' : 'text-zinc-100'}`}>
                       {isDownloading ? <span className="animate-pulse flex items-center gap-2"><Download className="w-4 h-4"/> Downloading...</span> : isOffline ? <><Check className="w-4 h-4 text-emerald-500" /> Remove Download</> : <><Download className="w-4 h-4" /> Download</>}
                    </button>
                    <button onClick={() => { setShowLyrics(!showLyrics); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/10 ${isWhite ? 'text-zinc-800' : 'text-zinc-100'}`}>
                      <Mic2 className="w-4 h-4" /> {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
                    </button>
                    <button onClick={() => { setShowPlaylistModal(true); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/10 ${isWhite ? 'text-zinc-800' : 'text-zinc-100'}`}>
                      <ListMusic className="w-4 h-4" /> Add to Playlist
                    </button>
                    <button onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Link copied!'); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-black/5 dark:hover:bg-white/10 ${isWhite ? 'text-zinc-800' : 'text-zinc-100'}`}>
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Center Area: Album Cover / Synchronized Lyrics */}
            <div className="w-full max-w-md z-10 flex-1 flex flex-col justify-center min-h-[380px]">
              
                {!showLyrics ? (
                  <div
                    key="art"
                    className="w-full aspect-square max-h-[42vh] rounded-3xl overflow-hidden shadow-2xl mb-6 border mx-auto relative group"
                    style={{
                      borderColor: isWhite ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)',
                    }}
                  >
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-xs font-mono text-white/90">Lossless 24-bit 96kHz</span>
                    </div>
                  </div>
                ) : (
                  <div
                    key="lyrics"
                    className={`w-full h-[42vh] flex flex-col items-center justify-start mb-6 p-5 text-center overflow-y-auto custom-scrollbar rounded-3xl border ${
                      isWhite
                        ? 'bg-zinc-100/90 border-zinc-200 text-black'
                        : 'bg-zinc-900/90 border-white/10 text-white'
                    }`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-widest mb-4 ${
                        isWhite ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                    >
                      Studio Lyrics
                    </p>
                    <div className="space-y-4 my-auto">
                      {sampleLyrics.map((line, idx) => (
                        <p
                          key={idx}
                          className={`text-base font-bold transition-all ${
                            progress >= line.time
                              ? isWhite
                                ? 'text-black scale-105'
                                : 'text-white scale-105'
                              : isWhite
                              ? 'text-zinc-400'
                              : 'text-zinc-600'
                          }`}
                        >
                          {line.text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              

              {/* Title & Artist & Favorite */}
              <div className="w-full mb-5 flex items-center justify-between shrink-0">
                <div className="flex-1 min-w-0 pr-3">
                  <h2
                    className={`text-2xl font-black truncate tracking-tight ${
                      isWhite ? 'text-black' : 'text-white'
                    }`}
                  >
                    {currentTrack.title}
                  </h2>
                  <p
                    className={`text-sm truncate mt-0.5 font-semibold ${
                      isWhite ? 'text-zinc-600' : 'text-zinc-400'
                    }`}
                  >
                    {currentTrack.artist}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsLiked(!isLiked);
                    showToast(isLiked ? 'Removed from Favorites' : '❤️ Added to Favorites');
                  }}
                  className={`p-2.5 rounded-full transition-transform active:scale-90 ${
                    isLiked
                      ? 'text-rose-500'
                      : isWhite
                      ? 'text-zinc-400 hover:text-black'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="w-full mb-6 shrink-0 group">
                <div
                  className="h-6 w-full flex items-center cursor-pointer -my-2"
                  onClick={handleSeek}
                >
                  <div
                    className={`h-1.5 w-full rounded-full relative transition-all duration-300 group-hover:h-2 ${
                      isWhite ? 'bg-zinc-200' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full relative ${
                        isWhite ? 'bg-black' : 'bg-white'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (progress / Math.max(1, trackDuration)) * 100
                        )}%`,
                      }}
                    >
                      <div
                        className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          isWhite ? 'bg-black' : 'bg-white'
                        }`}
                        style={{ transform: 'translate(50%, -50%)' }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between mt-2 text-xs font-mono font-medium ${
                    isWhite ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(trackDuration)}</span>
                </div>
              </div>

              {/* Primary Transport Controls */}
              <div className="w-full flex items-center justify-between mb-5 shrink-0 px-2">
                <button
                  onClick={() => {
                    setIsShuffle(!isShuffle);
                    showToast(isShuffle ? 'Shuffle Off' : 'Shuffle On');
                  }}
                  className={`p-2.5 rounded-full transition-colors active:scale-90 ${
                    isShuffle
                      ? isWhite
                        ? 'text-black bg-zinc-200'
                        : 'text-white bg-white/20'
                      : isWhite
                      ? 'text-zinc-400 hover:text-black'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-6">
                  <button
                    onClick={prevTrack}
                    className={`p-2.5 rounded-full active:scale-90 transition-all ${
                      isWhite ? 'text-black hover:bg-zinc-100' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <SkipBack className="w-7 h-7 fill-current" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className={`w-16 h-16 flex items-center justify-center rounded-full active:scale-90 transition-all shadow-2xl ${
                      isWhite ? 'bg-black text-white' : 'bg-white text-black shadow-white/20'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-1" />
                    )}
                  </button>

                  <button
                    onClick={nextTrack}
                    className={`p-2.5 rounded-full active:scale-90 transition-all ${
                      isWhite ? 'text-black hover:bg-zinc-100' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <SkipForward className="w-7 h-7 fill-current" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsRepeat(!isRepeat);
                    showToast(isRepeat ? 'Repeat Off' : 'Repeat Track On');
                  }}
                  className={`p-2.5 rounded-full transition-colors active:scale-90 ${
                    isRepeat
                      ? isWhite
                        ? 'text-black bg-zinc-200'
                        : 'text-white bg-white/20'
                      : isWhite
                      ? 'text-zinc-400 hover:text-black'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Infinity className="w-5 h-5" />
                </button>
              </div>

              {/* Volume Slider & Secondary Actions */}
              <div className="w-full flex items-center justify-between mt-2 mb-6 shrink-0 px-2 gap-4">
                {/* Volume Bar */}
                <div className="flex items-center gap-2.5 flex-1 max-w-[200px]">
                  {volume === 0 ? (
                    <VolumeX className={`w-4 h-4 shrink-0 ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`} />
                  ) : (
                    <Volume2 className={`w-4 h-4 shrink-0 ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`} />
                  )}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-black dark:accent-white cursor-pointer h-1.5 rounded-full"
                  />
                </div>

                
              </div>
            </div>
          </div>
        )}
      
        {/* Add to Playlist Modal */}
        {showPlaylistModal && currentTrack && (
          <AddToPlaylistModal 
            track={currentTrack} 
            onClose={() => setShowPlaylistModal(false)} 
          />
        )}
    </>
  );
}
