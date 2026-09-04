import React, { useState, useEffect } from 'react';
import { User, Bell, Sliders, Shield, Download, ChevronRight, Moon, Sun, Smartphone, Music2, Sparkles, Check } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { androidBridge } from '../services/androidBridge';

interface ProfileViewProps {
  themeMode: 'dark' | 'light' | 'dynamic';
  onToggleTheme: () => void;
  audioQuality: '320' | '160' | '96';
  onChangeQuality: (q: '320' | '160' | '96') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  themeMode,
  onToggleTheme,
  audioQuality,
  onChangeQuality,
}) => {
  const { likedTrackIds, playlists, tracks } = useLibrary();
  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem('pulse_profile_avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  });

  const isNative = androidBridge.isNative();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setAvatar(url);
        localStorage.setItem('pulse_profile_avatar', url);
        androidBridge.showToast('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-32 px-4 pt-4 space-y-6 select-none overflow-y-auto max-h-full">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center pt-2 pb-4 text-center">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-primary/40 shadow-xl shadow-brand-primary/20">
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold text-white">
            Change
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <h2 className="text-lg font-black text-white mt-3 flex items-center gap-1.5">
          Pulse Listener
          <Sparkles size={15} className="text-brand-primary" />
        </h2>
        <p className="text-xs text-slate-400">Owner-Vibe Edition</p>
      </div>

      {/* Listening Stats Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-dark-850/80 border border-dark-750 text-center">
          <p className="text-base font-black text-white">{likedTrackIds.length}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Favorites</p>
        </div>
        <div className="p-3 rounded-2xl bg-dark-850/80 border border-dark-750 text-center">
          <p className="text-base font-black text-brand-primary">{playlists.length}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Playlists</p>
        </div>
        <div className="p-3 rounded-2xl bg-dark-850/80 border border-dark-750 text-center">
          <p className="text-base font-black text-brand-accent">{tracks.length}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Library</p>
        </div>
      </div>

      {/* Audio Stream Quality */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Streaming Audio Quality
        </h3>
        <div className="p-4 rounded-2xl bg-dark-850/80 border border-dark-750 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Music2 size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Playback Bitrate</p>
                <p className="text-[10px] text-slate-400">JioSaavn & Global CDN Stream</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '320', label: '320 kbps', sub: 'Lossless / Ultra' },
              { id: '160', label: '160 kbps', sub: 'Balanced' },
              { id: '96', label: '96 kbps', sub: 'Data Saver' },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => onChangeQuality(q.id as any)}
                className={`py-2 px-1 rounded-xl text-center border transition-all ${
                  audioQuality === q.id
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                    : 'bg-dark-800 text-slate-300 border-dark-700 hover:border-slate-600'
                }`}
              >
                <p className="text-xs font-bold">{q.label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{q.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* App & Theme Settings */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Appearance & Environment
        </h3>
        <div className="rounded-2xl bg-dark-850/80 border border-dark-750 divide-y divide-dark-750 overflow-hidden">
          <div
            onClick={onToggleTheme}
            className="flex items-center justify-between p-3.5 hover:bg-dark-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                {themeMode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">App Theme</p>
                <p className="text-[10px] text-slate-400 capitalize">{themeMode} Mode</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-brand-primary">Toggle</span>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center">
                <Smartphone size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Platform Runtime</p>
                <p className="text-[10px] text-slate-400">
                  {isNative ? 'Native Kotlin APK (WebViewAssetLoader)' : 'Progressive Web Core'}
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-750 text-slate-300 font-mono">
              v1.1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
