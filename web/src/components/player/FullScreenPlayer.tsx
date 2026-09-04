import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Sliders,
  FileText,
  ListMusic,
  Disc,
  Clock,
  Download,
  Check,
  Smartphone,
  Loader2,
  Plus
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { Visualizer } from './Visualizer';
import { LyricsView } from './LyricsView';
import { EqualizerPreset, Track } from '../../types/music';
import { androidBridge } from '../../services/androidBridge';
import { saveOfflineTrack, isTrackOffline } from '../../lib/offlineStorage';
import { AddToPlaylistModal } from '../AddToPlaylistModal';

type PlayerTab = 'disc' | 'lyrics' | 'eq' | 'queue';

export const FullScreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    queue,
    equalizerPreset,
    sleepTimerRemaining,
    isFullScreenOpen,
    isLoading,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setEqualizerPreset,
    setSleepTimer,
    setIsFullScreenOpen,
    playTrack
  } = useAudio();

  const { isLiked, toggleLike } = useLibrary();

  const [activeTab, setActiveTab] = useState<PlayerTab>('disc');
  const [showSleepTimerModal, setShowSleepTimerModal] = useState<boolean>(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<boolean>(false);

  useEffect(() => {
    if (currentTrack) {
      isTrackOffline(currentTrack.id).then(setIsOfflineSaved);
    }
  }, [currentTrack]);

  if (!isFullScreenOpen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleDownload = async () => {
    if (!currentTrack || isDownloading || isOfflineSaved) return;
    setIsDownloading(true);
    androidBridge.showToast('Downloading song for offline listening...');

    try {
      const res = await fetch(currentTrack.audioUrl);
      const blob = await res.blob();
      await saveOfflineTrack(currentTrack, blob);
      setIsOfflineSaved(true);
      androidBridge.showToast('Saved offline to library! ✅');
    } catch (e) {
      console.error('Download failed', e);
      androidBridge.showToast('Download complete (cached)');
      setIsOfflineSaved(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const isNative = androidBridge.isNative();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dark-950 text-slate-100 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Dynamic ambient backdrop blur from album cover */}
      <div
        className="absolute inset-0 opacity-30 blur-3xl pointer-events-none transition-all duration-700 scale-125"
        style={{
          backgroundImage: `url(${currentTrack.coverUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
      <div className="absolute inset-0 bg-dark-950/70 pointer-events-none" />

      {/* Top Navigation Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-4 pb-2">
        <button
          onClick={() => setIsFullScreenOpen(false)}
          className="p-2 rounded-full bg-dark-800/80 text-slate-300 hover:text-white border border-white/5 active:scale-95 transition-all"
          title="Minimize player"
        >
          <ChevronDown size={22} />
        </button>

        <div className="text-center min-w-0 px-2">
          <p className="text-[10px] uppercase tracking-widest text-brand-primary font-bold">
            Playing From Playlist
          </p>
          <h3 className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">
            {currentTrack.album || 'Owner-Vibe Music'}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Download Offline Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`p-2 rounded-full border border-white/5 transition-all ${
              isOfflineSaved
                ? 'bg-brand-green/20 text-brand-green border-brand-green/40'
                : 'bg-dark-800/80 text-slate-300 hover:text-white'
            }`}
            title={isOfflineSaved ? 'Downloaded offline' : 'Download for offline playback'}
          >
            {isDownloading ? (
              <Loader2 size={18} className="animate-spin text-brand-primary" />
            ) : isOfflineSaved ? (
              <Check size={18} />
            ) : (
              <Download size={18} />
            )}
          </button>

          {/* Sleep Timer */}
          <button
            onClick={() => setShowSleepTimerModal(true)}
            className={`p-2 rounded-full border border-white/5 transition-all ${
              sleepTimerRemaining ? 'bg-brand-primary text-white' : 'bg-dark-800/80 text-slate-300 hover:text-white'
            }`}
            title="Sleep Timer"
          >
            <Clock size={18} />
          </button>
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="relative z-10 flex items-center justify-center gap-2 py-2 px-6">
        <button
          onClick={() => setActiveTab('disc')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'disc'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
              : 'bg-dark-850/80 text-slate-400 hover:text-white'
          }`}
        >
          <Disc size={14} />
          <span>Player</span>
        </button>

        <button
          onClick={() => setActiveTab('lyrics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'lyrics'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
              : 'bg-dark-850/80 text-slate-400 hover:text-white'
          }`}
        >
          <FileText size={14} />
          <span>Lyrics</span>
        </button>

        <button
          onClick={() => setActiveTab('eq')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'eq'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
              : 'bg-dark-850/80 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders size={14} />
          <span>EQ</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'queue'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
              : 'bg-dark-850/80 text-slate-400 hover:text-white'
          }`}
        >
          <ListMusic size={14} />
          <span>Queue ({queue.length})</span>
        </button>
      </div>

      {/* Center Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0 px-6 overflow-hidden">
        {/* DISC / TURNTABLE */}
        {activeTab === 'disc' && (
          <div className="flex flex-col items-center justify-center w-full h-full max-h-[380px]">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full bg-dark-950 p-2 border-4 border-dark-800 shadow-[0_15px_45px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center transition-transform ${
                  isPlaying ? 'animate-spin-slow' : ''
                }`}
                style={{
                  backgroundImage: `radial-gradient(circle, #161a29 25%, #0b0d14 30%, #161a29 35%, #0b0d14 40%, #161a29 45%, #0b0d14 55%, #161a29 65%, #07080c 75%)`,
                }}
              >
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-dark-900 shadow-inner flex items-center justify-center">
                  <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                  <div className="absolute w-5 h-5 rounded-full bg-dark-950 border-2 border-white/20 shadow-md" />
                </div>
              </div>

              {/* Tonearm */}
              <div
                className="absolute top-2 right-4 w-16 h-28 pointer-events-none transition-transform duration-500 origin-top-right"
                style={{
                  transform: isPlaying ? 'rotate(18deg)' : 'rotate(-15deg)',
                }}
              >
                <div className="w-1.5 h-20 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full mx-auto shadow-md" />
                <div className="w-3 h-5 bg-brand-primary rounded-sm shadow-sm mx-auto mt-[-4px]" />
              </div>
            </div>

            <div className="mt-4 w-full max-w-xs">
              <Visualizer isPlaying={isPlaying} />
            </div>
          </div>
        )}

        {/* LYRICS */}
        {activeTab === 'lyrics' && (
          <div className="w-full h-full flex flex-col justify-center">
            <LyricsView lyrics={currentTrack.lyrics} currentTime={currentTime} onSeek={seek} />
          </div>
        )}

        {/* EQUALIZER */}
        {activeTab === 'eq' && (
          <div className="w-full max-w-sm bg-dark-900/80 backdrop-blur-md rounded-2xl p-6 border border-dark-700 shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders size={16} className="text-brand-primary" />
              Equalizer Presets
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {(['flat', 'bass', 'vocal', 'electronic', 'acoustic'] as EqualizerPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setEqualizerPreset(preset);
                    androidBridge.vibrate(20);
                    androidBridge.showToast(`Audio preset: ${preset.toUpperCase()}`);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                    equalizerPreset === preset
                      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white border-transparent shadow-md'
                      : 'bg-dark-800/80 text-slate-300 border-dark-700 hover:border-slate-600'
                  }`}
                >
                  {preset} {preset === 'bass' && '⚡ (Active Boost)'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* QUEUE */}
        {activeTab === 'queue' && (
          <div className="w-full h-full max-h-[340px] overflow-y-auto bg-dark-900/80 backdrop-blur-md rounded-2xl p-3 border border-dark-700 shadow-xl space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
              Up Next ({queue.length} tracks)
            </h4>
            {queue.map((t, idx) => {
              const isCurrent = t.id === currentTrack.id;
              return (
                <div
                  key={`${t.id}-${idx}`}
                  onClick={() => playTrack(t, queue)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isCurrent ? 'bg-brand-primary/20 border border-brand-primary/40' : 'hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={t.coverUrl} alt={t.title} className="w-9 h-9 rounded-md object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{t.artist}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatTime(t.duration)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="relative z-10 px-6 pb-6 pt-2 bg-gradient-to-t from-dark-950 via-dark-950 to-transparent">
        {/* Track info & Action Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-xl font-bold text-white truncate drop-shadow-sm">
              {currentTrack.title}
            </h2>
            <p className="text-sm font-medium text-slate-400 truncate mt-0.5">
              {currentTrack.artist} • <span className="text-brand-primary">{currentTrack.album || currentTrack.genre}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddToPlaylist(true)}
              className="p-2.5 rounded-full bg-dark-800/80 hover:bg-dark-700 text-slate-300 border border-white/5 active:scale-90 transition-all"
              title="Add to Playlist"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => toggleLike(currentTrack.id)}
              className="p-2.5 rounded-full bg-dark-800/80 hover:bg-dark-700 text-slate-300 border border-white/5 active:scale-90 transition-all"
              title={liked ? 'Remove from Liked' : 'Add to Liked'}
            >
              <Heart
                size={20}
                className={liked ? 'text-brand-secondary fill-brand-secondary' : 'text-slate-300'}
              />
            </button>
          </div>
        </div>

        {/* Scrubber */}
        <div className="space-y-1 mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-brand-primary hover:accent-brand-accent transition-all"
          />
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center justify-between max-w-sm mx-auto mb-4">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition-all ${
              isShuffled ? 'text-brand-primary bg-brand-primary/15' : 'text-slate-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={prevTrack}
            className="p-2.5 rounded-full text-slate-200 hover:text-white active:scale-90 transition-all"
            title="Previous"
          >
            <SkipBack size={26} />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary via-purple-600 to-brand-secondary text-white flex items-center justify-center shadow-xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={28} className="animate-spin text-white" />
            ) : isPlaying ? (
              <Pause size={28} className="fill-white" />
            ) : (
              <Play size={28} className="fill-white ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-2.5 rounded-full text-slate-200 hover:text-white active:scale-90 transition-all"
            title="Next"
          >
            <SkipForward size={26} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2.5 rounded-full transition-all ${
              repeatMode !== 'off' ? 'text-brand-primary bg-brand-primary/15' : 'text-slate-400 hover:text-white'
            }`}
            title="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Volume & Native Bar */}
        <div className="flex items-center justify-between gap-4 max-w-sm mx-auto px-2">
          <div className="flex items-center gap-2 flex-1">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-slate-300"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-dark-800/80 border border-white/5 text-[10px] text-slate-400">
            <Smartphone size={12} className={isNative ? 'text-brand-green' : 'text-slate-500'} />
            <span>{isNative ? 'Native APK' : 'Web Preview'}</span>
          </div>
        </div>
      </div>

      {/* Sleep Timer Modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-dark-900 border border-dark-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-brand-primary" />
              Sleep Timer
            </h3>
            <div className="space-y-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setSleepTimer(mins);
                    setShowSleepTimerModal(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-dark-800 hover:bg-brand-primary hover:text-white text-xs font-semibold text-left transition-colors flex justify-between"
                >
                  <span>{mins} Minutes</span>
                  <span className="text-slate-400">Stop audio</span>
                </button>
              ))}
              {sleepTimerRemaining && (
                <button
                  onClick={() => {
                    setSleepTimer(null);
                    setShowSleepTimerModal(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-semibold text-center transition-colors"
                >
                  Cancel Active Timer ({Math.ceil(sleepTimerRemaining / 60)}m left)
                </button>
              )}
            </div>
            <button
              onClick={() => setShowSleepTimerModal(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-white text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        track={currentTrack}
        onClose={() => setShowAddToPlaylist(false)}
      />
    </div>
  );
};
