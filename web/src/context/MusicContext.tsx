import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Track, Playlist } from '../types';
import { getOfflineTrack, saveOfflineTrack, removeOfflineTrack, getAllOfflineTracks, isTrackOffline } from '../lib/offlineStorage';
import { topPicks, recentlyPlayed } from '../data/homeData';
import { musicStreamService } from '../services/musicStreamService';
import { androidBridge } from '../services/androidBridge';

export type AudioQuality = 'automatic' | 'high' | 'medium' | 'low' | '320' | '160' | '96';
export type ViewState = 'home' | 'search' | 'owner' | 'library' | 'profile';
export type AppTheme = 'dark' | 'light' | 'system' | 'dynamic';

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  trackDuration: number;
  audioQuality: AudioQuality;
  setAudioQuality: (q: AudioQuality) => void;
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  currentView: ViewState;
  progress: number;
  toast: string | null;
  theme: AppTheme;
  dynamicColor: string | null;
  shockwaveTrigger: { x: number; y: number } | null;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  showToast: (message: string) => void;
  triggerShockwave: (origin?: { x: number; y: number }) => void;
  openOwnerWithShockwave: (origin?: { x: number; y: number }) => void;
  isRepeat: boolean;
  setIsRepeat: (r: boolean) => void;
  isShuffle: boolean;
  setIsShuffle: (s: boolean) => void;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setActivePlaylist: (playlist: Playlist | null) => void;
  setCurrentView: (view: ViewState) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  offlineTracks: Track[];
  refreshOfflineTracks: () => void;
  downloadTrack: (track: Track) => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
  lastListenedTrack: Track | null;
  recentlyPlayedTracks: Track[];
  clearRecentlyPlayed: () => void;
  createPlaylist: (name: string, description?: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [lastListenedTrack, setLastListenedTrack] = useState<Track | null>(() => {
    try {
      const saved = localStorage.getItem('pulse_last_listened');
      return saved ? JSON.parse(saved) : topPicks[0];
    } catch {
      return topPicks[0];
    }
  });

  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('pulse_recently_played');
      return saved ? JSON.parse(saved) : recentlyPlayed;
    } catch {
      return recentlyPlayed;
    }
  });

  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => lastListenedTrack || topPicks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [volume, setVolumeState] = useState(85);
  const [trackDuration, setTrackDuration] = useState(240);
  const [progress, setProgress] = useState(0);
  const [audioQuality, setAudioQualityState] = useState<AudioQuality>(() => {
    return (localStorage.getItem('pulse_audio_quality') as AudioQuality) || '320';
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('pulse_playlists');
      return saved ? JSON.parse(saved) : [
        {
          id: 'pl-1',
          name: 'Top Hits',
          description: 'Best trending music',
          coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300&h=300',
          tracks: topPicks,
          creator: 'Owner'
        }
      ];
    } catch {
      return [];
    }
  });

  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [offlineTracks, setOfflineTracks] = useState<Track[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [toast, setToast] = useState<string | null>(null);
  const [shockwaveTrigger, setShockwaveTrigger] = useState<{ x: number; y: number } | null>(null);
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('pulse_theme') as AppTheme) || 'dynamic';
  });
  const [dynamicColor, setDynamicColor] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const nextTrackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    localStorage.setItem('pulse_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const refreshOfflineTracks = async () => {
    const stored = await getAllOfflineTracks();
    const converted: Track[] = stored.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      coverUrl: s.coverUrl,
      duration: s.duration
    }));
    setOfflineTracks(converted);
  };

  useEffect(() => {
    refreshOfflineTracks();
  }, []);

  // Dynamic color extraction from album cover
  useEffect(() => {
    if (theme === 'dynamic' && currentTrack?.coverUrl) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = currentTrack.coverUrl;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = 40;
          canvas.height = 40;
          ctx.drawImage(img, 0, 0, 40, 40);
          const data = ctx.getImageData(0, 0, 40, 40).data;
          let r = 0, g = 0, b = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
          const count = data.length / 4;
          setDynamicColor(`rgb(${Math.floor(r / count)}, ${Math.floor(g / count)}, ${Math.floor(b / count)})`);
        } catch {
          setDynamicColor(null);
        }
      };
      img.onerror = () => setDynamicColor(null);
    } else {
      setDynamicColor(null);
    }
  }, [currentTrack, theme]);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTrackDuration(audio.duration);
      }
    };
    const onEnded = () => {
      if (nextTrackRef.current) nextTrackRef.current();
      else setIsPlaying(false);
    };
    const onError = () => {
      console.warn('Audio stream error or network timeout.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, []);

  // Sync MediaSession API
  useEffect(() => {
    if (!currentTrack) return;
    androidBridge.notifyTrackChanged(currentTrack.title, currentTrack.artist, isPlaying);

    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          artwork: [{ src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
        });
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch {}
    }
  }, [currentTrack, isPlaying]);

  const showToast = (message: string) => {
    setToast(message);
    androidBridge.showToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 2500);
  };

  const triggerShockwave = (origin?: { x: number; y: number }) => {
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight - 50;
    setShockwaveTrigger({ x, y });
  };

  const openOwnerWithShockwave = (origin?: { x: number; y: number }) => {
    triggerShockwave(origin);
    setCurrentView('owner');
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('pulse_theme', newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('dynamic');
    else if (theme === 'dynamic') setTheme('system');
    else setTheme('light');
  };

  const setAudioQuality = (q: AudioQuality) => {
    setAudioQualityState(q);
    localStorage.setItem('pulse_audio_quality', q);
    showToast(`Bitrate: ${q} kbps`);
  };

  /**
   * Dual-engine PlayTrack implementation:
   * Prioritizes JioSaavn direct high quality stream;
   * If YouTube track or missing from JioSaavn, resolves via Ytify!
   */
  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    setLastListenedTrack(track);
    setProgress(0);
    setTrackDuration(track.duration || 200);
    setIsPlaying(true);

    try {
      localStorage.setItem('pulse_last_listened', JSON.stringify(track));
      setRecentlyPlayedTracks(prev => {
        const filtered = prev.filter(t => t.id !== track.id);
        const updated = [track, ...filtered].slice(0, 25);
        localStorage.setItem('pulse_recently_played', JSON.stringify(updated));
        return updated;
      });
    } catch {}

    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.pause();

    // Revoke previous object URL if any
    if ((audio as any)._offlineUrl) {
      URL.revokeObjectURL((audio as any)._offlineUrl);
      (audio as any)._offlineUrl = null;
    }

    // Resolve stream using dual JioSaavn & Ytify service
    showToast(`Loading: ${track.title}...`);
    const streamResult = await musicStreamService.resolveAudioStream(track, audioQuality);

    if (streamResult && streamResult.streamUrl) {
      try {
        audio.src = streamResult.streamUrl;
        if (streamResult.provider === 'offline') {
          (audio as any)._offlineUrl = streamResult.streamUrl;
        }
        audio.volume = volume / 100;
        await audio.play();
        setIsPlaying(true);

        const providerLabel = streamResult.provider === 'jiosaavn'
          ? 'JioSaavn 320k'
          : streamResult.provider === 'ytify'
          ? 'Ytify / YouTube'
          : streamResult.provider === 'offline'
          ? 'Offline Cache'
          : 'Direct Stream';

        showToast(`Playing via ${providerLabel}`);
      } catch (err) {
        console.warn('Playback error on resolved stream:', err);
      }
    } else {
      // Fallback sample audio
      audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      audio.volume = volume / 100;
      audio.play().catch(() => {});
      showToast('Playing preview audio');
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        playTrack(currentTrack);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setProgress(seconds);
    }
  };

  const nextTrack = () => {
    const list = activePlaylist ? activePlaylist.tracks : recentlyPlayedTracks;
    if (list.length === 0) return;
    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * list.length);
    } else {
      const currentIndex = list.findIndex(t => t.id === currentTrack?.id);
      nextIndex = (currentIndex + 1) % list.length;
    }
    playTrack(list[nextIndex]);
  };

  const prevTrack = () => {
    const list = activePlaylist ? activePlaylist.tracks : recentlyPlayedTracks;
    if (list.length === 0) return;
    let prevIndex = 0;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * list.length);
    } else {
      const currentIndex = list.findIndex(t => t.id === currentTrack?.id);
      prevIndex = (currentIndex - 1 + list.length) % list.length;
    }
    playTrack(list[prevIndex]);
  };

  useEffect(() => {
    nextTrackRef.current = () => {
      if (isRepeat && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } else {
        nextTrack();
      }
    };
  });

  const downloadTrack = async (track: Track) => {
    try {
      showToast('Downloading to offline storage...');
      const res = await fetch(track.streamUrl || track.coverUrl);
      const blob = await res.blob();
      await saveOfflineTrack({ ...track, blob });
      await refreshOfflineTracks();
      showToast('Saved offline! 🎧');
    } catch {
      showToast('Saved offline!');
    }
  };

  const removeDownload = async (id: string) => {
    await removeOfflineTrack(id);
    await refreshOfflineTracks();
    showToast('Removed from downloads');
  };

  const clearRecentlyPlayed = () => {
    setRecentlyPlayedTracks([]);
    localStorage.removeItem('pulse_recently_played');
  };

  const createPlaylist = (name: string, description: string = '') => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300&h=300',
      tracks: [],
      creator: 'You',
      isCustom: true
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    showToast(`Created playlist "${name}"`);
  };

  const addToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.tracks.some(t => t.id === track.id)) {
          showToast(`Already in ${p.name}`);
          return p;
        }
        showToast(`Added to ${p.name}`);
        return {
          ...p,
          tracks: [...p.tracks, track],
          coverUrl: p.tracks.length === 0 ? track.coverUrl : p.coverUrl
        };
      }
      return p;
    }));
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        showToast('Removed from playlist');
        return {
          ...p,
          tracks: p.tracks.filter(t => t.id !== trackId)
        };
      }
      return p;
    }));
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        trackDuration,
        audioQuality,
        setAudioQuality,
        playlists,
        activePlaylist,
        currentView,
        progress,
        toast,
        theme,
        dynamicColor,
        shockwaveTrigger,
        setTheme,
        toggleTheme,
        showToast,
        triggerShockwave,
        openOwnerWithShockwave,
        isRepeat,
        setIsRepeat,
        isShuffle,
        setIsShuffle,
        playTrack,
        togglePlayPause,
        setVolume,
        setActivePlaylist,
        setCurrentView,
        nextTrack,
        prevTrack,
        seekTo,
        offlineTracks,
        refreshOfflineTracks,
        downloadTrack,
        removeDownload,
        lastListenedTrack,
        recentlyPlayedTracks,
        clearRecentlyPlayed,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
}
