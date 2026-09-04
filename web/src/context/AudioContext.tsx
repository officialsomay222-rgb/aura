import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, RepeatMode, EqualizerPreset } from '../types/music';
import { androidBridge } from '../services/androidBridge';
import { useLibrary } from './LibraryContext';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Track[];
  queueIndex: number;
  equalizerPreset: EqualizerPreset;
  sleepTimerRemaining: number | null; // in seconds
  isFullScreenOpen: boolean;
  isLoading: boolean;

  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  setSleepTimer: (minutes: number | null) => void;
  setIsFullScreenOpen: (open: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tracks, addRecentTrack } = useLibrary();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => tracks[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>(tracks);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [equalizerPreset, setEqualizerPreset] = useState<EqualizerPreset>('bass');
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<number | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      console.warn('Audio playback encountered an error or network timeout.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Update volume and mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle track ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  });

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerRemaining === null) {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
      return;
    }

    if (sleepTimerRemaining <= 0) {
      pause();
      setSleepTimerRemaining(null);
      androidBridge.showToast('Sleep timer reached. Playback paused.');
      return;
    }

    sleepTimerRef.current = window.setInterval(() => {
      setSleepTimerRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [sleepTimerRemaining]);

  // Sync MediaSession API for lockscreen & hardware keys
  useEffect(() => {
    if (!currentTrack) return;

    androidBridge.notifyTrackChanged(currentTrack.title, currentTrack.artist, isPlaying);

    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          artwork: [
            { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }
          ]
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        navigator.mediaSession.setActionHandler('play', () => resume());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) seek(details.seekTime);
        });
      } catch (err) {
        console.log('MediaSession error', err);
      }
    }
  }, [currentTrack, isPlaying]);

  const playTrack = (track: Track, newQueue?: Track[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    androidBridge.vibrate(20);
    setCurrentTrack(track);
    addRecentTrack(track.id);

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setQueueIndex(idx);
      } else {
        const updated = [track, ...queue];
        setQueue(updated);
        setQueueIndex(0);
      }
    }

    setDuration(track.duration);
    setCurrentTime(0);
    setIsLoading(true);

    audio.src = track.audioUrl;
    audio.load();
    audio.play().then(() => {
      setIsPlaying(true);
      setIsLoading(false);
    }).catch(e => {
      console.warn('Playback play request was prevented or failed:', e);
      setIsLoading(false);
    });
  };

  const togglePlay = () => {
    androidBridge.vibrate(25);
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (!audio.src || audio.src === '') {
        audio.src = currentTrack.audioUrl;
        audio.load();
      }
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Error starting playback:', err);
      });
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    androidBridge.vibrate(25);
    if (queue.length === 0) return;

    let nextIdx: number;
    if (isShuffled && queue.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * queue.length);
      } while (nextIdx === queueIndex);
    } else {
      nextIdx = (queueIndex + 1) % queue.length;
    }

    setQueueIndex(nextIdx);
    playTrack(queue[nextIdx], queue);
  };

  const prevTrack = () => {
    androidBridge.vibrate(25);
    const audio = audioRef.current;
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      return;
    }

    if (queue.length === 0) return;

    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    playTrack(queue[prevIdx], queue);
  };

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (isMuted && clamped > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleShuffle = () => {
    androidBridge.vibrate(20);
    setIsShuffled(prev => {
      const next = !prev;
      androidBridge.showToast(next ? 'Shuffle turned ON' : 'Shuffle turned OFF');
      return next;
    });
  };

  const toggleRepeat = () => {
    androidBridge.vibrate(20);
    setRepeatMode(prev => {
      let next: RepeatMode = 'off';
      if (prev === 'off') next = 'all';
      else if (prev === 'all') next = 'one';
      else next = 'off';

      const label = next === 'one' ? 'Repeat ONE' : next === 'all' ? 'Repeat ALL' : 'Repeat OFF';
      androidBridge.showToast(label);
      return next;
    });
  };

  const setSleepTimer = (minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerRemaining(null);
      androidBridge.showToast('Sleep timer cancelled');
    } else {
      setSleepTimerRemaining(minutes * 60);
      androidBridge.showToast(`Sleep timer set for ${minutes} minutes`);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
        queue,
        queueIndex,
        equalizerPreset,
        sleepTimerRemaining,
        isFullScreenOpen,
        isLoading,

        playTrack,
        togglePlay,
        pause,
        resume,
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};
