import React, { useState } from 'react';
import { User, Bell, Shield, Download, LogOut, ChevronRight, Crown, Music2, Moon, Sun, CloudLightning, Sliders } from 'lucide-react';

import { useMusic } from '../context/MusicContext';

export function ProfileView() {
  const { theme, toggleTheme, setTheme, audioQuality, setAudioQuality } = useMusic();
    const [downloadSetting, setDownloadSetting] = useState('Wi-Fi Only');
  const [dataSaver, setDataSaver] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [profileAvatar] = useState<string>(() => {
    return localStorage.getItem('profile_avatar_img') || 'https://i.ibb.co/689Npxv/avatar-default.png';
  });

  const isWhite = theme === 'light' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  const isDynamic = theme === 'dynamic';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  const toggleAudioQuality = () => {
    const qualities: import('../context/MusicContext').AudioQuality[] = ['automatic', 'high', 'medium', 'low'];
    const currentIndex = qualities.indexOf(audioQuality);
    setAudioQuality(qualities[(currentIndex + 1) % qualities.length]);
  };
  
  const displayAudioQuality = () => {
    switch (audioQuality) {
      case 'high': return 'High (~160 kbps)';
      case 'medium': return 'Medium (~128 kbps)';
      case 'low': return 'Low (Data Saver)';
      case 'automatic':
      default: return 'Automatic';
    }
  };

  const toggleDownloadSetting = () => {
    const options = ['Wi-Fi Only', 'Wi-Fi & Cellular', 'Never'];
    const currentIndex = options.indexOf(downloadSetting);
    setDownloadSetting(options[(currentIndex + 1) % options.length]);
  };

  return (
    <div className={`flex-1 flex flex-col h-full pb-[180px] overflow-y-auto custom-scrollbar relative transition-colors duration-300 ${
      isDynamic 
        ? 'bg-black/40 backdrop-blur-3xl text-white' 
        : isWhite 
          ? 'bg-white text-zinc-900' 
          : 'bg-[#121212] text-white'
    }`}>
      {/* Header Profile Section */}
      <div className={`relative px-6 pt-16 pb-8 flex flex-col items-center text-center border-b transition-colors ${
        isDynamic
          ? 'border-white/10 bg-black/30 backdrop-blur-md'
          : isWhite 
            ? 'border-zinc-200 bg-zinc-50' 
            : 'border-white/10 bg-[#181818]'
      }`}>
        <div 
          
          
          
          className="relative z-10"
        >
          <div 
            className={`w-20 h-20 rounded-full p-1 shadow-lg mb-3 mx-auto cursor-pointer active:scale-95 transition-transform ${
              isWhite ? 'bg-zinc-900 text-white' : 'bg-white text-black'
            }`} 
            onClick={() => setActiveModal('profile')}
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border border-black">
              <img 
                src={profileAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/689Npxv/avatar-default.png';
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      localStorage.setItem('profile_avatar_img', dataUrl);
                      window.dispatchEvent(new Event('storage'));
                      // We also update local state just to be safe
                      window.location.reload(); // Quick refresh to apply to all views
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Change Avatar"
              />
            </div>
          </div>
          <h1 className={`text-3xl font-black tracking-widest ${isWhite ? 'text-black' : 'text-white'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Home Vibe</h1>
          <p className={`font-medium text-xs mt-0.5 flex items-center justify-center gap-1 ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" /> VIP Master & Creator
          </p>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Subscription Card */}
        <div 
           
          className={`border rounded-3xl p-4 flex items-center justify-between mx-1 shadow-md transition-colors ${
            isWhite 
              ? 'bg-zinc-900 text-white border-zinc-800' 
              : 'bg-zinc-900 border-white/10 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400 fill-current" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">VIP Master Plan</h3>
              <p className="text-zinc-300 text-xs">Active & Verified</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('subscription')}
            className="px-3.5 py-1.5 bg-white text-black text-xs font-bold rounded-full transition-all active:scale-95 shadow-sm"
          >
            Manage
          </button>
        </div>

        {/* Customization */}
        <div 
           
          className={`rounded-3xl border overflow-hidden mx-1 transition-colors ${
            isWhite ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/5'
          }`}
        >
          <h3 className={`text-[10px] font-black uppercase tracking-widest px-5 pt-4 pb-1 ${
            isWhite ? 'text-zinc-500' : 'text-zinc-400'
          }`}>Customization & Theme</h3>
          <div className="flex flex-col">
            <SettingsRow 
              isWhite={isWhite}
              icon={
                theme === 'light' ? <Sun className="text-amber-500" /> : 
                theme === 'dynamic' ? <CloudLightning className="text-emerald-500" /> : 
                <Moon className="text-amber-400" />
              } 
              label="App Theme" 
              value={
                theme === 'light' ? "☀️ Light (Clean)" :
                theme === 'dark' ? "🌙 Dark (Onyx)" :
                theme === 'dynamic' ? "🎨 Dynamic (Aura)" :
                "⚙️ System Match"
              } 
              onClick={toggleTheme} 
            />
            <SettingsRow 
              isWhite={isWhite}
              icon={<Sliders />} 
              label="Studio Equalizer" 
              onClick={() => setActiveModal('equalizer')} 
            />
          </div>
        </div>

        {/* Playback & Data */}
        <div 
           
          className={`rounded-3xl border overflow-hidden mx-1 transition-colors ${
            isWhite ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/5'
          }`}
        >
          <h3 className={`text-[10px] font-black uppercase tracking-widest px-5 pt-4 pb-1 ${
            isWhite ? 'text-zinc-500' : 'text-zinc-400'
          }`}>Playback & Storage</h3>
          <div className="flex flex-col">
            <SettingsRow isWhite={isWhite} icon={<Music2 />} label="Audio Quality" value={displayAudioQuality()} onClick={toggleAudioQuality} />
            <SettingsRow isWhite={isWhite} icon={<Download />} label="Downloads" value={downloadSetting} onClick={toggleDownloadSetting} />
            
            <button 
              onClick={() => setDataSaver(!dataSaver)} 
              className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors group ${
                isWhite ? 'hover:bg-zinc-100' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`transition-colors [&>svg]:w-4 [&>svg]:h-4 ${
                  isWhite ? 'text-zinc-500 group-hover:text-black' : 'text-zinc-400 group-hover:text-white'
                }`}>
                  <CloudLightning />
                </div>
                <div className="text-left flex flex-col">
                  <span className={`text-xs font-semibold ${isWhite ? 'text-black' : 'text-zinc-200'}`}>Data Saver</span>
                  <span className={`text-[10px] ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>Compress audio streams</span>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                dataSaver 
                  ? (isWhite ? 'bg-black' : 'bg-white') 
                  : (isWhite ? 'bg-zinc-300' : 'bg-zinc-700')
              }`}>
                <div 
                  
                  className={`w-5 h-5 rounded-full shadow-md ${
                    dataSaver 
                      ? (isWhite ? 'bg-white' : 'bg-black') 
                      : 'bg-white'
                  }`}
                  
                  
                />
              </div>
            </button>
          </div>
        </div>

        {/* Account Settings */}
        <div 
           
          className={`rounded-3xl border overflow-hidden mx-1 transition-colors ${
            isWhite ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/60 border-white/5'
          }`}
        >
          <h3 className={`text-[10px] font-black uppercase tracking-widest px-5 pt-4 pb-1 ${
            isWhite ? 'text-zinc-500' : 'text-zinc-400'
          }`}>Account Settings</h3>
          <div className="flex flex-col">
            <SettingsRow isWhite={isWhite} icon={<User />} label="Personal Profile" onClick={() => setActiveModal('profile')} />
            <SettingsRow isWhite={isWhite} icon={<Shield />} label="Security & Privacy" onClick={() => setActiveModal('security')} />
            <SettingsRow isWhite={isWhite} icon={<Bell />} label="Notifications" onClick={() => setActiveModal('notifications')} />
          </div>
        </div>
        
        <div  className="px-5 pb-6 pt-1">
          <button className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-sm border ${
            isWhite 
              ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
          }`}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <div className={`text-center mt-5 text-[9px] font-mono tracking-widest uppercase ${
            isWhite ? 'text-zinc-500' : 'text-zinc-500'
          }`}>
            Home Vibe v2.2.0 • Vercel Ready
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      
        {activeModal && (
          <div 
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setActiveModal(null)}
          >
            <div 
              onClick={e => e.stopPropagation()}
              className={`w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 border shadow-2xl pb-safe transition-colors ${
                isWhite ? 'bg-white text-zinc-900 border-zinc-300' : 'bg-zinc-900 text-white border-white/10'
              }`}
            >
              <div className={`w-10 h-1 rounded-full mx-auto mb-5 sm:hidden ${isWhite ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              <h2 className="text-xl font-black mb-3 capitalize">{activeModal}</h2>
              
              {activeModal === 'equalizer' ? (
                <div className="mb-6 mt-4">
                  <div className="flex justify-between items-end h-28 gap-2 mb-4">
                    {[60, 230, 910, 3600, 14000].map((freq) => (
                      <div key={freq} className="flex-1 flex flex-col items-center gap-2">
                        <div className={`w-full rounded-full flex-1 relative flex items-end p-1 ${isWhite ? 'bg-zinc-100' : 'bg-zinc-800'}`}>
                          <div 
                            className={`w-full rounded-full ${isWhite ? 'bg-black' : 'bg-white'}`}
                            
                            
                            
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>{freq >= 1000 ? `${freq/1000}k` : freq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeModal === 'profile' ? (
                <div className="mb-6 space-y-3 mt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>Display Name</label>
                    <input 
                      type="text" 
                      defaultValue="Owner's Vibe" 
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${
                        isWhite ? 'bg-zinc-50 border-zinc-300 text-black' : 'bg-zinc-950 border-white/10 text-white'
                      }`} 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>Email</label>
                    <input 
                      type="email" 
                      defaultValue="officialsomay222@gmail.com" 
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${
                        isWhite ? 'bg-zinc-50 border-zinc-300 text-black' : 'bg-zinc-950 border-white/10 text-white'
                      }`} 
                    />
                  </div>
                </div>
              ) : activeModal === 'subscription' ? (
                <div className="mb-6 mt-3">
                  <div className={`rounded-2xl p-5 text-center shadow-md mb-4 ${
                    isWhite ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-white'
                  }`}>
                    <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2 fill-current" />
                    <h3 className="text-xl font-black">VIP Lifetime Access</h3>
                    <p className="text-zinc-300 text-xs mt-1">Full access to lossless streaming & creator controls.</p>
                  </div>
                </div>
              ) : (
                <p className={`mb-6 text-xs mt-2 ${isWhite ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Customization options for your {activeModal} preferences are saved to your local storage.
                </p>
              )}
              
              <button 
                onClick={() => setActiveModal(null)}
                className={`w-full py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md ${
                  isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      
    </div>
  );
}

function SettingsRow({ 
  icon, 
  label, 
  value, 
  isWhite,
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value?: string, 
  isWhite: boolean,
  onClick?: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors group ${
        isWhite ? 'hover:bg-zinc-100' : 'hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`transition-colors [&>svg]:w-4 [&>svg]:h-4 ${
          isWhite ? 'text-zinc-500 group-hover:text-black' : 'text-zinc-400 group-hover:text-white'
        }`}>
          {icon}
        </div>
        <span className={`text-xs font-semibold text-left ${isWhite ? 'text-black' : 'text-zinc-200'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {value && <span className={`text-xs font-medium ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>{value}</span>}
        <ChevronRight className={`w-4 h-4 ${isWhite ? 'text-zinc-400' : 'text-zinc-600'}`} />
      </div>
    </button>
  );
}
