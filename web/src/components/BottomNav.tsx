import React, { useEffect, useState } from 'react';
import { Home, Search, Library, User } from 'lucide-react';
import { useMusic } from '../context/MusicContext';


export function BottomNav() {
  const { currentView, setCurrentView, openOwnerWithShockwave, theme } = useMusic();
  const defaultAvatar = 'https://i.ibb.co/nq3h7TQs/Picsart-26-06-28-14-10-58-930.png';
  const [ownerAvatar, setOwnerAvatar] = useState<string>(() => {
    return localStorage.getItem('owner_avatar_img') || defaultAvatar;
  });

  useEffect(() => {
    const handleStorage = () => {
      setOwnerAvatar(localStorage.getItem('owner_avatar_img') || defaultAvatar);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isWhite = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  const isDynamic = theme === 'dynamic';

  const handleOwnerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    openOwnerWithShockwave({ x, y });
  };

  return (
    <div 
      className={`fixed bottom-5 transform-gpu will-change-transform left-1/2 -translate-x-1/2 px-3 h-[70px] backdrop-blur-3xl rounded-full flex items-center justify-between z-50 transition-all duration-300 max-w-[94vw] sm:max-w-md w-auto ${
        isDynamic
          ? 'bg-black/60 border border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10'
          : isWhite 
            ? 'bg-white/95 border border-zinc-300/90 text-black shadow-[0_15px_45px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5' 
            : 'bg-black/95 border border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-white/10'
      }`}
    >
      <NavItem 
        icon={<Home className="w-[21px] h-[21px]" fill={currentView === 'home' ? 'currentColor' : 'none'} strokeWidth={currentView === 'home' ? 2.5 : 1.8} />} 
        label="Home" 
        active={currentView === 'home'} 
        isWhite={isWhite}
        onClick={() => setCurrentView('home')} 
      />
      <NavItem 
        icon={<Search className="w-[21px] h-[21px]" fill={currentView === 'search' ? 'currentColor' : 'none'} strokeWidth={currentView === 'search' ? 2.5 : 1.8} />} 
        label="Search" 
        active={currentView === 'search'} 
        isWhite={isWhite}
        onClick={() => setCurrentView('search')} 
      />
      
      {/* Mid Column: Owner with Image & Shockwave Trigger - High Contrast */}
      <button 
        onClick={handleOwnerClick}
        className="relative flex flex-col items-center justify-center w-[70px] h-full gap-0.5 group px-1 active:scale-95 transition-transform"
        title="Open Owner Site with Shockwave"
      >
        {currentView === 'owner' && (
          <div 
            
            className={`absolute inset-1.5 rounded-2xl ${isWhite ? 'bg-black/[0.06]' : 'bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'}`} 
            
          />
        )}
        
        <div 
          
          
          className={`relative z-10 w-[34px] h-[34px] rounded-full p-[2px] transition-all duration-300 ${
            currentView === 'owner' 
              ? (isWhite ? 'bg-black shadow-lg ring-2 ring-black/20' : 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.7)] ring-2 ring-white/30') 
              : (isWhite ? 'bg-zinc-200 group-hover:bg-zinc-300' : 'bg-zinc-800 group-hover:bg-zinc-700')
          }`}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center border border-zinc-800">
            <img 
              src={ownerAvatar} 
              alt="Owner" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </div>
          {currentView === 'owner' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-black animate-ping" />
          )}
          {currentView === 'owner' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-black" />
          )}
        </div>

        <span className={`text-[10px] tracking-wide transition-all z-10 ${
          currentView === 'owner' 
            ? (isWhite ? 'text-black font-black opacity-100' : 'text-white font-black opacity-100') 
            : (isWhite ? 'text-zinc-500 font-medium opacity-80' : 'text-zinc-400 font-medium opacity-80')
        }`}>
          Owner
        </span>
      </button>

      <NavItem 
        icon={<Library className="w-[21px] h-[21px]" fill={currentView === 'library' ? 'currentColor' : 'none'} strokeWidth={currentView === 'library' ? 2.5 : 1.8} />} 
        label="Library" 
        active={currentView === 'library'} 
        isWhite={isWhite}
        onClick={() => setCurrentView('library')} 
      />
      <NavItem 
        icon={<User className="w-[21px] h-[21px]" fill={currentView === 'profile' ? 'currentColor' : 'none'} strokeWidth={currentView === 'profile' ? 2.5 : 1.8} />} 
        label="Profile" 
        active={currentView === 'profile'} 
        isWhite={isWhite}
        onClick={() => setCurrentView('profile')} 
      />
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active = false, 
  isWhite = false,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  isWhite?: boolean;
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick} 
      className={`relative flex flex-col items-center justify-center w-[62px] h-full gap-0.5 transition-all duration-300 active:scale-95 ${
        active 
          ? (isWhite ? 'text-black font-black' : 'text-white font-black') 
          : (isWhite ? 'text-zinc-500 hover:text-black font-medium' : 'text-zinc-400 hover:text-white font-medium')
      }`}
    >
      {active && (
        <div 
          
          className={`absolute inset-1.5 rounded-2xl ${isWhite ? 'bg-black/[0.06]' : 'bg-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'}`} 
          
        />
      )}
      <div className={`transition-transform duration-300 z-10 ${active ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[10px] tracking-wide transition-all z-10 ${
        active ? 'opacity-100 translate-y-0 font-black' : 'opacity-0 translate-y-2 font-medium'
      }`}>
        {label}
      </span>
    </button>
  );
}
