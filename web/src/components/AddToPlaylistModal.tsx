import React from 'react';
import { X } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Track } from '../types';

interface AddToPlaylistModalProps {
  track: Track;
  onClose: () => void;
}

export function AddToPlaylistModal({ track, onClose }: AddToPlaylistModalProps) {
  const { playlists, addToPlaylist, theme } = useMusic();
  
  const isWhite = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  const isDynamic = theme === 'dynamic';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl ${isDynamic ? 'bg-zinc-900 border border-white/10 text-white' : isWhite ? 'bg-white text-black' : 'bg-zinc-900 text-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Add to Playlist</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {playlists.length === 0 ? (
            <div className="text-center py-6 opacity-60">
              <p className="text-sm">No playlists yet.</p>
              <p className="text-xs mt-1">Create one in your library.</p>
            </div>
          ) : (
            playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => {
                  addToPlaylist(playlist.id, track);
                  onClose();
                }}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                  isDynamic ? 'hover:bg-white/10' : isWhite ? 'hover:bg-zinc-100' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-bold truncate text-[15px]">{playlist.name}</h4>
                  <p className={`text-xs truncate mt-0.5 ${isDynamic ? 'text-white/60' : isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {playlist.tracks.length} tracks
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
