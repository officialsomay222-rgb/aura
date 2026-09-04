import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Heart, Plus, Search, Bookmark, Download, Music, X, ListMusic } from 'lucide-react';
import { Track } from '../types';
import { AddToPlaylistModal } from './AddToPlaylistModal';

export function LibraryView() {
  const { playlists, playTrack, offlineTracks, setCurrentView, theme, createPlaylist, setActivePlaylist } = useMusic();
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'playlists' | 'liked' | 'saved' | 'downloaded'>('all');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState<Track | null>(null);
  
  const isWhite = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  const isDynamic = theme === 'dynamic';

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
      setActiveFilter('playlists');
    }
  };

  // Mock liked tracks (using offline tracks for demonstration, reversed)
  const likedTracks: Track[] = [...offlineTracks].reverse();
  const savedTracks: Track[] = offlineTracks.slice(0, 2);

  const getFilteredTracks = () => {
    switch(activeFilter) {
      case 'liked': return likedTracks;
      case 'saved': return savedTracks;
      case 'downloaded': return offlineTracks;
      default: return [...offlineTracks, ...likedTracks].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i); // unique
    }
  };

  const displayedTracks = getFilteredTracks();

  return (
    <div className={`flex-1 flex flex-col h-full pb-[180px] overflow-y-auto custom-scrollbar transition-colors duration-300 ${
      isDynamic 
        ? 'bg-black/40 backdrop-blur-3xl text-white' 
        : isWhite 
          ? 'bg-white text-zinc-900' 
          : 'bg-[#121212] text-white'
    }`}>
      {/* Unified Sticky Header */}
      <div className={`sticky top-0 z-20 flex flex-col backdrop-blur-md border-b transition-colors ${
        isDynamic
          ? 'bg-black/30 border-white/10'
          : isWhite 
            ? 'bg-white/90 border-zinc-200' 
            : 'bg-[#121212]/90 border-white/10'
      }`}>
        <div className="px-4 pt-8 pb-3 flex justify-between items-center">
          <h1 className={`text-2xl font-black tracking-tight ${isWhite && !isDynamic ? 'text-black' : 'text-white'}`}>Library</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentView('search')}
              className={`p-2 rounded-full border transition-colors ${
                isDynamic
                  ? 'bg-black/30 border-white/20 text-white hover:bg-black/50'
                  : isWhite ? 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsCreatingPlaylist(true)}
              className={`p-2 rounded-full border transition-colors ${
                isDynamic
                  ? 'bg-black/30 border-white/20 text-white hover:bg-black/50'
                  : isWhite ? 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black' : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'all', label: 'All Music' },
            { id: 'playlists', label: 'Playlists' },
            { id: 'liked', label: 'Liked' },
            { id: 'saved', label: 'Saved' },
            { id: 'downloaded', label: 'Downloaded' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeFilter === filter.id
                  ? isDynamic 
                    ? 'bg-white text-black border-transparent shadow-lg' 
                    : isWhite ? 'bg-black text-white border-transparent' : 'bg-white text-black border-transparent'
                  : isDynamic
                    ? 'bg-black/40 text-white/80 border-white/20 hover:bg-white/10'
                    : isWhite
                      ? 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                      : 'bg-zinc-900 text-zinc-400 border-white/10 hover:bg-zinc-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-8 pt-2">
        
        {/* Playlists Horizontal Scroll (Only show if 'all' is selected) */}
        {activeFilter === 'all' && (
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 px-2 ${isDynamic ? 'text-white/70' : isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>Your Playlists</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar px-2 -mx-2 snap-x">
              {/* Liked Songs Special Playlist Card */}
              <div 
                className={`snap-start shrink-0 w-36 h-48 rounded-[20px] p-4 flex flex-col justify-end relative overflow-hidden cursor-pointer shadow-lg transition-transform hover:scale-[1.02] border ${
                  isDynamic ? 'border-white/20' : isWhite ? 'border-zinc-200' : 'border-white/10'
                }`}
                onClick={() => setActiveFilter('liked')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-800 opacity-90 mix-blend-multiply" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-black text-xl text-white tracking-tight leading-tight">Liked<br/>Songs</h3>
                  <p className="font-medium text-xs text-white/70 mt-1">{likedTracks.length} tracks</p>
                </div>
              </div>

              {/* Downloaded Special Playlist Card */}
              <div 
                className={`snap-start shrink-0 w-36 h-48 rounded-[20px] p-4 flex flex-col justify-end relative overflow-hidden cursor-pointer shadow-lg transition-transform hover:scale-[1.02] border ${
                  isDynamic ? 'border-white/20' : isWhite ? 'border-zinc-200' : 'border-white/10'
                }`}
                onClick={() => setActiveFilter('downloaded')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-800 opacity-90 mix-blend-multiply" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white">
                  <Download className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-black text-xl text-white tracking-tight leading-tight">Saved<br/>Offline</h3>
                  <p className="font-medium text-xs text-white/70 mt-1">{offlineTracks.length} tracks</p>
                </div>
              </div>

              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={`snap-start shrink-0 w-36 flex flex-col gap-2 cursor-pointer group`}
                  onClick={() => {
                    if (playlist.tracks.length > 0) {
                      setActivePlaylist(playlist);
                      playTrack(playlist.tracks[0]);
                    }
                  }}
                >
                  <div className={`w-36 h-36 rounded-[20px] overflow-hidden shadow-md relative border ${isDynamic ? 'border-white/10' : isWhite ? 'border-zinc-200' : 'border-zinc-800'}`}>
                    <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm truncate ${isWhite && !isDynamic ? 'text-black' : 'text-white'}`}>{playlist.name}</h4>
                    <p className={`text-xs truncate mt-0.5 ${isDynamic ? 'text-white/60' : isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {playlist.tracks.length} tracks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeFilter === 'playlists' ? (
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isDynamic ? 'text-white/70' : isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                All Playlists
              </h2>
            </div>
            
            <div className="space-y-1.5">
              {playlists.length === 0 ? (
                <div className={`opacity-60 text-sm text-center py-10 border border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 ${isDynamic ? 'border-white/20 bg-black/20' : isWhite ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-800 bg-zinc-900/50'}`}>
                  <Music className="w-8 h-8 opacity-50" />
                  <p>You haven't created any playlists yet.</p>
                  <button onClick={() => setIsCreatingPlaylist(true)} className={`mt-2 px-4 py-2 rounded-full font-bold text-sm ${isDynamic ? 'bg-white text-black' : isWhite ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    Create Playlist
                  </button>
                </div>
              ) : (
                playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`group flex items-center gap-3.5 p-2.5 rounded-[18px] transition-all cursor-pointer border ${
                      isDynamic
                        ? 'hover:bg-white/10 border-transparent hover:border-white/5 shadow-[0_2px_10px_transparent] hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
                        : isWhite 
                          ? 'hover:bg-white hover:shadow-sm border-transparent hover:border-zinc-200' 
                          : 'hover:bg-zinc-900 border-transparent hover:border-white/5'
                    }`}
                    onClick={() => {
                      if (playlist.tracks.length > 0) {
                        setActivePlaylist(playlist);
                        playTrack(playlist.tracks[0]);
                      }
                    }}
                  >
                    <div className="w-14 h-14 rounded-[14px] overflow-hidden shrink-0 shadow-md relative">
                      <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold truncate text-[15px] ${isWhite && !isDynamic ? 'text-zinc-900' : 'text-white'}`}>{playlist.name}</h4>
                      <p className={`text-[13px] truncate mt-0.5 ${isDynamic ? 'text-white/60' : isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {playlist.tracks.length} tracks • {playlist.creator}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className={`text-xs font-bold uppercase tracking-widest ${isDynamic ? 'text-white/70' : isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {activeFilter === 'all' ? 'Recent Additions' : 
                 activeFilter === 'liked' ? 'Liked Tracks' : 
                 activeFilter === 'saved' ? 'Saved for Later' : 
                 'Downloaded Offline'}
              </h2>
            </div>
            
            <div className="space-y-1.5">
              {displayedTracks.length === 0 ? (
                <div className={`opacity-60 text-sm text-center py-10 border border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 ${isDynamic ? 'border-white/20 bg-black/20' : isWhite ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-800 bg-zinc-900/50'}`}>
                  {activeFilter === 'liked' ? <Heart className="w-8 h-8 opacity-50" /> : 
                   activeFilter === 'saved' ? <Bookmark className="w-8 h-8 opacity-50" /> : 
                   activeFilter === 'downloaded' ? <Download className="w-8 h-8 opacity-50" /> : 
                   <Music className="w-8 h-8 opacity-50" />}
                  <p>No {activeFilter} tracks yet.</p>
                </div>
              ) : (
                displayedTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`group flex items-center gap-3.5 p-2.5 rounded-[18px] transition-all cursor-pointer border ${
                      isDynamic
                        ? 'hover:bg-white/10 border-transparent hover:border-white/5 shadow-[0_2px_10px_transparent] hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
                        : isWhite 
                          ? 'hover:bg-white hover:shadow-sm border-transparent hover:border-zinc-200' 
                          : 'hover:bg-zinc-900 border-transparent hover:border-white/5'
                    }`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 shadow-md relative">
                      <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      {activeFilter === 'downloaded' && (
                         <div className="absolute bottom-1 right-1 bg-emerald-500 rounded-full p-0.5">
                           <Download className="w-2.5 h-2.5 text-black" />
                         </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold truncate text-[15px] ${isWhite && !isDynamic ? 'text-zinc-900' : 'text-white'}`}>{track.title}</h4>
                      <p className={`text-[13px] truncate mt-0.5 ${isDynamic ? 'text-white/60' : isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {track.artist}
                      </p>
                    </div>
                    
                    {/* Quick Action Buttons on hover/mobile */}
                    <div className="flex items-center gap-2 pr-1 opacity-60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrackForPlaylist(track);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          isWhite ? 'hover:bg-zinc-200 text-zinc-600' : 'hover:bg-zinc-700 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <ListMusic className="w-4 h-4" />
                      </button>
                      {activeFilter === 'liked' ? <Heart className="w-5 h-5 fill-current text-emerald-500" /> : 
                       activeFilter === 'saved' ? <Bookmark className="w-5 h-5 fill-current text-amber-500" /> : 
                       <Heart className="w-5 h-5" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {isCreatingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreatingPlaylist(false)} />
          <div className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl ${isDynamic ? 'bg-zinc-900 border border-white/10 text-white' : isWhite ? 'bg-white text-black' : 'bg-zinc-900 text-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">New Playlist</h3>
              <button onClick={() => setIsCreatingPlaylist(false)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-6">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDynamic ? 'text-white/60' : isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>Playlist Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Summer Vibes, Gym Mix"
                  autoFocus
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${isDynamic ? 'bg-black/30 border-white/20 text-white focus:ring-white/50' : isWhite ? 'bg-zinc-100 border-zinc-200 text-black focus:ring-black/20' : 'bg-zinc-800 border-zinc-700 text-white focus:ring-white/20'}`}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingPlaylist(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${isDynamic ? 'bg-white/10 hover:bg-white/20 text-white' : isWhite ? 'bg-zinc-100 hover:bg-zinc-200 text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${!newPlaylistName.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'} ${isDynamic ? 'bg-white text-black' : isWhite ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTrackForPlaylist && (
        <AddToPlaylistModal 
          track={selectedTrackForPlaylist} 
          onClose={() => setSelectedTrackForPlaylist(null)} 
        />
      )}
    </div>
  );
}
