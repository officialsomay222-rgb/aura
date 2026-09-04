import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track, Playlist } from '../types/music';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS } from '../data/mockTracks';
import { androidBridge } from '../services/androidBridge';

interface LibraryContextType {
  tracks: Track[];
  playlists: Playlist[];
  likedTrackIds: string[];
  recentTrackIds: string[];
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (title: string, description?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  addRecentTrack: (trackId: string) => void;
  importLocalTrack: (track: Track) => void;
  getTrackById: (id: string) => Track | undefined;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LIKED: 'pulsemusic_liked_tracks',
  PLAYLISTS: 'pulsemusic_playlists',
  RECENTS: 'pulsemusic_recents',
  IMPORTED: 'pulsemusic_imported_tracks',
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IMPORTED);
      if (saved) {
        const imported: Track[] = JSON.parse(saved);
        return [...INITIAL_TRACKS, ...imported];
      }
    } catch (e) {
      console.error('Error loading imported tracks:', e);
    }
    return INITIAL_TRACKS;
  });

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKED);
      return saved ? JSON.parse(saved) : ['track-1', 'track-2'];
    } catch {
      return ['track-1', 'track-2'];
    }
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
    }
  });

  const [recentTrackIds, setRecentTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENTS);
      return saved ? JSON.parse(saved) : ['track-1', 'track-2', 'track-4'];
    } catch {
      return ['track-1', 'track-2'];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(likedTrackIds));
  }, [likedTrackIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENTS, JSON.stringify(recentTrackIds));
  }, [recentTrackIds]);

  const toggleLike = (trackId: string) => {
    androidBridge.vibrate(30);
    setLikedTrackIds(prev => {
      const isAlreadyLiked = prev.includes(trackId);
      const updated = isAlreadyLiked ? prev.filter(id => id !== trackId) : [trackId, ...prev];
      androidBridge.showToast(isAlreadyLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs ❤️');
      return updated;
    });
  };

  const isLiked = (trackId: string) => likedTrackIds.includes(trackId);

  const createPlaylist = (title: string, description: string = '') => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      title,
      description: description || 'Custom playlist created by user',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      trackIds: [],
      createdAt: Date.now(),
      isCustom: true
    };
    setPlaylists(prev => [newPlaylist, ...prev]);
    androidBridge.showToast(`Playlist "${title}" created!`);
    return newPlaylist;
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    androidBridge.showToast('Playlist deleted');
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId && !p.trackIds.includes(trackId)) {
        return { ...p, trackIds: [...p.trackIds, trackId] };
      }
      return p;
    }));
    androidBridge.showToast('Track added to playlist');
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
      }
      return p;
    }));
    androidBridge.showToast('Track removed from playlist');
  };

  const addRecentTrack = (trackId: string) => {
    setRecentTrackIds(prev => {
      const filtered = prev.filter(id => id !== trackId);
      return [trackId, ...filtered].slice(0, 30);
    });
  };

  const importLocalTrack = (newTrack: Track) => {
    setTracks(prev => {
      const updated = [newTrack, ...prev];
      const customOnly = updated.filter(t => t.isLocal);
      localStorage.setItem(STORAGE_KEYS.IMPORTED, JSON.stringify(customOnly));
      return updated;
    });
    androidBridge.showToast(`Imported "${newTrack.title}" to library!`);
  };

  const getTrackById = (id: string) => tracks.find(t => t.id === id);

  return (
    <LibraryContext.Provider
      value={{
        tracks,
        playlists,
        likedTrackIds,
        recentTrackIds,
        toggleLike,
        isLiked,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        addRecentTrack,
        importLocalTrack,
        getTrackById,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
};
