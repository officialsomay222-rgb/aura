import React, { useState } from 'react';
import { X, Plus, FolderPlus, Check } from 'lucide-react';
import { Track } from '../types/music';
import { useLibrary } from '../context/LibraryContext';

interface AddToPlaylistModalProps {
  track: Track | null;
  onClose: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ track, onClose }) => {
  const { playlists, addTrackToPlaylist, createPlaylist } = useLibrary();
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  if (!track) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const p = createPlaylist(newTitle.trim());
    addTrackToPlaylist(p.id, track.id);
    setNewTitle('');
    setShowCreate(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-dark-900 border border-dark-700 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <FolderPlus size={16} className="text-brand-primary" />
            Add to Playlist
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Track summary */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-800 border border-white/5">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{track.title}</p>
            <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Existing Playlists */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {playlists.map((playlist) => {
            const isAlreadyAdded = playlist.trackIds.includes(track.id);

            return (
              <button
                key={playlist.id}
                onClick={() => {
                  if (!isAlreadyAdded) {
                    addTrackToPlaylist(playlist.id, track.id);
                  }
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                  isAlreadyAdded
                    ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30'
                    : 'bg-dark-850 hover:bg-dark-800 text-slate-200 border border-dark-750'
                }`}
              >
                <span className="truncate">{playlist.title}</span>
                {isAlreadyAdded ? (
                  <Check size={14} className="text-brand-primary flex-shrink-0" />
                ) : (
                  <Plus size={14} className="text-slate-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick New Playlist Toggle */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-xs font-semibold text-brand-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={14} />
            Create New Playlist
          </button>
        ) : (
          <form onSubmit={handleCreate} className="space-y-2 pt-1">
            <input
              type="text"
              required
              autoFocus
              placeholder="Playlist name..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 py-1.5 rounded-lg bg-dark-800 text-[11px] text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-lg bg-brand-primary text-[11px] font-semibold text-white"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
