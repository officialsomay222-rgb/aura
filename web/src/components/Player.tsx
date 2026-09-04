import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronDown,
  Shuffle,
  Volume2,
  VolumeX,
  Mic2,
  Download,
  Check,
  Plus,
  Heart,
  Sparkles,
  Loader2,
  Radio
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Visualizer } from './Visualizer';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import { isTrackOffline } from '../lib/offlineStorage';
import { androidBridge } from '../services/androidBridge';

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
    isRepeat,
    setIsRepeat,
    isShuffle,
    setIsShuffle,
    audioQuality,
    setAudioQuality
  } = useMusic();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      isTrackOffline(currentTrack.id).then(setIsOffline);
    }
  }, [currentTrack, offlineTracks]);

  if (!currentTrack) return null;

  const handleDownload = async () => {
    if (isOffline) {
      await removeDownload(currentTrack.id);
      setIsOffline(false);
    } else {
      setIsDownloading(true);
      await downloadTrack(currentTrack);
      setIsOffline(true);
      setIsDownloading(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    seekTo(percent * trackDuration);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sampleLyrics = [
    { time: 0, text: `[Intro - ${currentTrack.artist}]` },
    { time: 10, text: 'Music flowing through the digital stream' },
    { time: 24, text: 'Echoes of a timeless midnight dream' },
    { time: 40, text: `Now listening to ${currentTrack.title}` },
    { time: 60, text: 'High fidelity audio in 320kbps resolution' },
    { time: 85, text: 'Bass pulsing through the speakers' },
    { time: 110, text: 'Infinite frequency, endless horizon' }
  ];

  return (
    <>
      {/* 1. Floating Mini Player (Docked directly above the bottom nav) */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-[94px] left-1/2 -translate-x-1/2 w-[92vw] sm:w-[400px] h-14 bg-dark-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(139,92,246,0.15)] flex items-center justify-between px-3 z-30 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] select-none"
        >
          {/* Progress top line */}
          <div className="absolute top-0 left-3 right-3 h-[2px] bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-150"
              style={{ width: `${trackDuration > 0 ? (progress / trackDuration) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
              <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
              <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-1.5 text-slate-400 hover:text-brand-secondary transition-colors"
            >
              <Heart size={17} className={isLiked ? 'fill-brand-secondary text-brand-secondary' : ''} />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause size={15} className="fill-white" /> : <Play size={15} className="fill-white ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward size={17} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Fullscreen Expanded Player Sheet */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col bg-dark-950 text-white select-none animate-in fade-in zoom-in-95 duration-200">
          {/* Ambient blurred backdrop from cover */}
          <div
            className="absolute inset-0 opacity-30 blur-3xl pointer-events-none scale-125"
            style={{
              backgroundImage: `url(${currentTrack.coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-dark-950/70 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-full bg-dark-850 hover:bg-dark-800 border border-white/5 transition-colors"
            >
              <ChevronDown size={22} />
            </button>
            <div className="text-center min-w-0 px-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary">
                Playing Now
              </span>
              <p className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
                {currentTrack.album || 'Owner-Vibe'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`p-2 rounded-full border border-white/5 transition-colors ${
                  isOffline ? 'bg-brand-green/20 text-brand-green border-brand-green/30' : 'bg-dark-850 text-slate-300'
                }`}
                title={isOffline ? 'Downloaded offline' : 'Download song offline'}
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : isOffline ? <Check size={16} /> : <Download size={16} />}
              </button>
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="p-2 rounded-full bg-dark-850 hover:bg-dark-800 border border-white/5 text-slate-300"
                title="Add to playlist"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Center Stage: Album Art or Visualizer/Lyrics */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 min-h-0">
            {!showLyrics ? (
              <div className="flex flex-col items-center w-full max-w-sm">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-6">
                  <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                </div>
                {/* Fluid Wave Visualizer */}
                <div className="w-full max-w-xs mb-2">
                  <Visualizer />
                </div>
              </div>
            ) : (
              <div className="h-72 w-full max-w-sm overflow-y-auto px-4 py-6 space-y-4 text-center custom-scrollbar">
                {sampleLyrics.map((line, idx) => {
                  const isActive = progress >= line.time;
                  return (
                    <p
                      key={idx}
                      onClick={() => seekTo(line.time)}
                      className={`cursor-pointer transition-all duration-200 font-semibold text-sm ${
                        isActive ? 'text-white scale-105 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]' : 'text-slate-500'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Player Controls */}
          <div className="relative z-10 px-8 pb-8 pt-2">
            {/* Title, Artist, & Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0 flex-1 mr-4">
                <h2 className="text-xl font-bold text-white truncate">{currentTrack.title}</h2>
                <p className="text-xs text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`p-2 rounded-full border border-white/5 transition-colors ${
                    showLyrics ? 'bg-brand-primary text-white' : 'bg-dark-850 text-slate-400'
                  }`}
                  title="Lyrics"
                >
                  <Mic2 size={18} />
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-2 rounded-full bg-dark-850 text-slate-400 hover:text-white"
                >
                  <Heart size={18} className={isLiked ? 'fill-brand-secondary text-brand-secondary' : ''} />
                </button>
              </div>
            </div>

            {/* Seek Bar */}
            <div className="space-y-1.5 mb-5">
              <div
                onClick={handleSeek}
                className="relative w-full h-1.5 bg-dark-800 rounded-full cursor-pointer overflow-hidden group"
              >
                <div
                  className="h-full bg-gradient-to-r from-brand-primary via-purple-500 to-brand-secondary"
                  style={{ width: `${trackDuration > 0 ? (progress / trackDuration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(trackDuration)}</span>
              </div>
            </div>

            {/* Main Transport Buttons */}
            <div className="flex items-center justify-between max-w-xs mx-auto mb-5">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-full transition-colors ${
                  isShuffle ? 'text-brand-primary' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle size={18} />
              </button>

              <button onClick={prevTrack} className="p-2 text-slate-200 hover:text-white active:scale-95">
                <SkipBack size={26} />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary via-purple-600 to-brand-secondary text-white flex items-center justify-center shadow-xl shadow-brand-primary/30 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause size={26} className="fill-white" /> : <Play size={26} className="fill-white ml-1" />}
              </button>

              <button onClick={nextTrack} className="p-2 text-slate-200 hover:text-white active:scale-95">
                <SkipForward size={26} />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full transition-colors ${
                  isRepeat ? 'text-brand-primary' : 'text-slate-400 hover:text-white'
                }`}
                title="Repeat"
              >
                <Radio size={18} />
              </button>
            </div>

            {/* Audio Quality & Volume */}
            <div className="flex items-center justify-between gap-4 max-w-xs mx-auto">
              <div className="flex items-center gap-2 flex-1">
                <Volume2 size={15} className="text-slate-400" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-full h-1 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>

              {/* Bitrate Selector */}
              <button
                onClick={() => {
                  const next: '320' | '160' | '96' = audioQuality === '320' ? '160' : audioQuality === '160' ? '96' : '320';
                  setAudioQuality(next);
                }}
                className="px-2.5 py-1 rounded-full bg-dark-850 border border-white/10 text-[10px] font-bold text-brand-primary"
              >
                {audioQuality} kbps
              </button>
            </div>
          </div>

          <AddToPlaylistModal track={currentTrack} onClose={() => setShowPlaylistModal(false)} />
        </div>
      )}
    </>
  );
}
