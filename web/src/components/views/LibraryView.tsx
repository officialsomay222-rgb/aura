import React, { useState } from 'react';
import { Plus, Heart, Music, FolderPlus, Trash2, Play, ArrowLeft, X } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLibrary } from '../../context/LibraryContext';
import { ActiveTab, Playlist, Track } from '../../types/music';

interface LibraryViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenImport: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onNavigateTab, onOpenImport }) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const {
    playlists,
    likedTrackIds,
    tracks,
    createPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    getTrackById
  } = useLibrary();

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const importedTracks = tracks.filter((t) => t.isLocal);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = createPlaylist(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
    setSelectedPlaylist(created);
  };

  // If viewing a specific playlist
  if (selectedPlaylist) {
    const playlistTracks = selectedPlaylist.trackIds
      .map((id) => getTrackById(id))
      .filter((t): t is Track => Boolean(t));

    return (
      <div className="pb-28 px-4 pt-4 space-y-4 select-none overflow-y-auto max-h-full animate-in fade-in duration-200">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Library
        </button>

        <div className="flex items-end gap-4 pt-2">
          <img
            src={selectedPlaylist.coverUrl}
            alt={selectedPlaylist.title}
            className="w-24 h-24 rounded-2xl object-cover shadow-2xl border border-white/10"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary">
              Playlist
            </span>
            <h1 className="text-xl font-bold text-white truncate">
              {selectedPlaylist.title}
            </h1>
            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
              {selectedPlaylist.description}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {playlistTracks.length} songs
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              if (playlistTracks.length > 0) playTrack(playlistTracks[0], playlistTracks);
            }}
            disabled={playlistTracks.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold shadow-lg shadow-brand-primary/20 hover:scale-102 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play size={15} className="fill-white" />
            Play All
          </button>

          {selectedPlaylist.isCustom && (
            <button
              onClick={() => {
                deletePlaylist(selectedPlaylist.id);
                setSelectedPlaylist(null);
              }}
              className="p-2 rounded-full hover:bg-dark-800 text-red-400 hover:text-red-300 transition-colors"
              title="Delete playlist"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Playlist Songs List */}
        <div className="space-y-1.5 pt-2">
          {playlistTracks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              This playlist is currently empty.
            </div>
          ) : (
            playlistTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, playlistTracks)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl bg-dark-850/60 hover:bg-dark-800 border border-dark-700/50 cursor-pointer group transition-all ${
                    isCurrent ? 'border-brand-primary/40 bg-brand-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-brand-primary' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {selectedPlaylist.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                      }}
                      className="p-1.5 rounded-full text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove from playlist"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 px-4 pt-4 space-y-5 select-none overflow-y-auto max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Your Library
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-primary text-white text-xs font-semibold shadow-md shadow-brand-primary/25 hover:scale-102 active:scale-95 transition-all"
        >
          <Plus size={15} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Primary Shortcut Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Liked Songs Shortcut */}
        <div
          onClick={() => onNavigateTab('favorites')}
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/60 to-brand-primary/40 border border-brand-primary/30 cursor-pointer hover:border-brand-primary/60 transition-all active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center mb-3 shadow-lg">
            <Heart size={20} className="fill-white" />
          </div>
          <h3 className="text-sm font-bold text-white">Liked Songs</h3>
          <p className="text-xs text-slate-300 mt-0.5">{likedTrackIds.length} tracks</p>
        </div>

        {/* Imported Audio Shortcut */}
        <div
          onClick={onOpenImport}
          className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-brand-accent/30 border border-brand-accent/30 cursor-pointer hover:border-brand-accent/60 transition-all active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-accent text-dark-950 flex items-center justify-center mb-3 shadow-lg">
            <Music size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">Imported Files</h3>
          <p className="text-xs text-slate-300 mt-0.5">{importedTracks.length} local files</p>
        </div>
      </div>

      {/* Playlists List */}
      <div className="space-y-3 pt-1">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FolderPlus size={18} className="text-brand-primary" />
          All Playlists ({playlists.length})
        </h2>

        <div className="space-y-2">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist)}
              className="flex items-center justify-between p-3 rounded-2xl bg-dark-850/70 hover:bg-dark-800 border border-dark-700/50 cursor-pointer group transition-all active:scale-98"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-12 h-12 rounded-xl object-cover shadow-md flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-white truncate group-hover:text-brand-primary transition-colors">
                    {playlist.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {playlist.isCustom ? 'User Playlist' : 'Curated'} • {playlist.trackIds.length} tracks
                  </p>
                </div>
              </div>

              {playlist.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist(playlist.id);
                  }}
                  className="p-2 rounded-full hover:bg-dark-750 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete playlist"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-sm bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-white">Create New Playlist</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Playlist Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Chill Workout Beats"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g., Favorite tracks for gym sessions"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-brand-primary hover:bg-purple-600 text-xs font-semibold text-white shadow-md shadow-brand-primary/20 transition-all"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
