import React, { useEffect, useState } from 'react';
import { Home, Search, Library, User, Sparkles } from 'lucide-react';
import { androidBridge } from '../../services/androidBridge';

export type NavTab = 'home' | 'search' | 'owner' | 'library' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOwnerClickWithShockwave: (origin?: { x: number; y: number }) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOwnerClickWithShockwave,
}) => {
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
  const [ownerAvatar, setOwnerAvatar] = useState<string>(() => {
    return localStorage.getItem('pulse_owner_avatar') || defaultAvatar;
  });

  const handleTabClick = (tab: NavTab) => {
    androidBridge.vibrate(15);
    onChangeTab(tab);
  };

  const handleOwnerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    androidBridge.vibrate(30);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    onOwnerClickWithShockwave({ x, y });
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 h-[66px] bg-dark-900/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.15)] flex items-center justify-between z-40 max-w-[94vw] sm:max-w-md w-full select-none">
      {/* Home */}
      <button
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          activeTab === 'home' ? 'text-brand-primary scale-105' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Home size={20} className={activeTab === 'home' ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-semibold mt-1">Home</span>
      </button>

      {/* Search */}
      <button
        onClick={() => handleTabClick('search')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          activeTab === 'search' ? 'text-brand-primary scale-105' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Search size={20} className={activeTab === 'search' ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-semibold mt-1">Search</span>
      </button>

      {/* Mid Column: Owner with Glowing Avatar & Shockwave Trigger */}
      <button
        onClick={handleOwnerClick}
        className="relative flex flex-col items-center justify-center -top-3 group px-2 active:scale-95 transition-transform"
        title="Open Owner Site with Shockwave"
      >
        <div className="relative w-13 h-13 rounded-full p-[2.5px] bg-gradient-to-tr from-brand-primary via-purple-500 to-brand-secondary shadow-lg shadow-brand-primary/40 group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
            <img src={ownerAvatar} alt="Owner" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center text-[8px] shadow-sm">
            <Sparkles size={10} />
          </div>
        </div>
        <span className={`text-[10px] font-black tracking-wider uppercase mt-1 ${
          activeTab === 'owner' ? 'text-brand-primary' : 'text-slate-300'
        }`}>
          Owner
        </span>
      </button>

      {/* Library */}
      <button
        onClick={() => handleTabClick('library')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          activeTab === 'library' ? 'text-brand-primary scale-105' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Library size={20} className={activeTab === 'library' ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-semibold mt-1">Library</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => handleTabClick('profile')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          activeTab === 'profile' ? 'text-brand-primary scale-105' : 'text-slate-400 hover:text-white'
        }`}
      >
        <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5]' : ''} />
        <span className="text-[10px] font-semibold mt-1">Profile</span>
      </button>
    </div>
  );
};
