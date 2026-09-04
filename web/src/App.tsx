import React, { useState, useEffect } from 'react';
import { LibraryProvider } from './context/LibraryContext';
import { AudioProvider } from './context/AudioContext';
import { HomeView } from './components/views/HomeView';
import { SearchView } from './components/views/SearchView';
import { LibraryView } from './components/views/LibraryView';
import { FavoritesView } from './components/views/FavoritesView';
import { ProfileView } from './components/ProfileView';
import { OwnerView } from './components/OwnerView';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullScreenPlayer } from './components/player/FullScreenPlayer';
import { BottomNav, NavTab } from './components/navigation/BottomNav';
import { ImportModal } from './components/views/ImportModal';
import { ShockwaveOverlay } from './components/Shockwave';
import { androidBridge } from './services/androidBridge';
import { Smartphone, Monitor } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(false);
  const [shockwaveTrigger, setShockwaveTrigger] = useState<{ x: number; y: number } | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'dynamic'>(() => {
    return (localStorage.getItem('pulse_theme') as any) || 'dark';
  });
  const [audioQuality, setAudioQuality] = useState<'320' | '160' | '96'>(() => {
    return (localStorage.getItem('pulse_audio_quality') as any) || '320';
  });

  const isNative = androidBridge.isNative();

  useEffect(() => {
    if (!isNative && window.innerWidth > 768) {
      setIsMobileFrameMode(true);
    }
  }, [isNative]);

  const triggerShockwave = (origin?: { x: number; y: number }) => {
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight - 50;
    setShockwaveTrigger({ x, y });
  };

  const handleOwnerClickWithShockwave = (origin?: { x: number; y: number }) => {
    triggerShockwave(origin);
    setActiveTab('owner');
  };

  const handleToggleTheme = () => {
    const next = themeMode === 'dark' ? 'dynamic' : themeMode === 'dynamic' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('pulse_theme', next);
    androidBridge.showToast(`Theme: ${next.toUpperCase()}`);
  };

  const handleChangeQuality = (q: '320' | '160' | '96') => {
    setAudioQuality(q);
    localStorage.setItem('pulse_audio_quality', q);
    androidBridge.showToast(`Audio Quality: ${q} kbps`);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            onNavigateTab={setActiveTab}
            onOpenProfile={() => setActiveTab('profile')}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        );
      case 'search':
        return <SearchView />;
      case 'owner':
        return <OwnerView triggerShockwave={triggerShockwave} />;
      case 'library':
        return (
          <LibraryView
            onNavigateTab={(t: any) => setActiveTab(t)}
            onOpenImport={() => setIsImportModalOpen(true)}
          />
        );
      case 'profile':
        return (
          <ProfileView
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            audioQuality={audioQuality}
            onChangeQuality={handleChangeQuality}
          />
        );
      default:
        return (
          <HomeView
            onNavigateTab={setActiveTab}
            onOpenProfile={() => setActiveTab('profile')}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isMobileFrameMode ? 'bg-dark-950 p-3 md:p-6' : 'bg-dark-950'}`}>
      {/* Desktop Mode Toggle Header */}
      {!isNative && (
        <div className="fixed top-3 right-4 z-40 hidden md:flex items-center gap-2 bg-dark-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-dark-750 shadow-lg text-xs">
          <span className="text-slate-400 font-medium">Preview:</span>
          <button
            onClick={() => setIsMobileFrameMode(!isMobileFrameMode)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white font-semibold transition-all"
          >
            {isMobileFrameMode ? (
              <>
                <Monitor size={13} /> Fullscreen
              </>
            ) : (
              <>
                <Smartphone size={13} /> Phone Frame
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Container / Mobile Phone Shell */}
      <div
        className={`w-full flex flex-col bg-dark-950 overflow-hidden relative ${
          isMobileFrameMode
            ? 'max-w-[420px] h-[870px] max-h-[94vh] rounded-[48px] border-[10px] border-dark-800 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(139,92,246,0.2)] ring-1 ring-white/10'
            : 'h-screen max-w-lg mx-auto shadow-2xl'
        }`}
      >
        {/* Phone Notch (Frame Mode) */}
        {isMobileFrameMode && (
          <div className="h-6 w-full bg-dark-950 flex items-center justify-center relative flex-shrink-0 z-20">
            <div className="w-24 h-4 bg-dark-900 rounded-full flex items-center justify-center gap-2">
              <div className="w-8 h-1 bg-dark-700 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-dark-800" />
            </div>
          </div>
        )}

        {/* Active Screen Area */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          {renderActiveView()}
        </main>

        {/* Docked Mini Player */}
        <div className="flex-shrink-0 z-30 mb-20">
          <MiniPlayer />
        </div>

        {/* Floating Pill Bottom Nav */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOwnerClickWithShockwave={handleOwnerClickWithShockwave}
        />

        {/* Modals & Fullscreen Player */}
        <FullScreenPlayer />
        <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />

        {/* Kinetic Shockwave Canvas Overlay */}
        <ShockwaveOverlay trigger={shockwaveTrigger} isLight={themeMode === 'light'} />
      </div>
    </div>
  );
};

export function App() {
  return (
    <LibraryProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </LibraryProvider>
  );
}

export default App;
