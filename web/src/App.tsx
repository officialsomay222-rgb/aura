import React, { useState, useEffect } from 'react';
import { LibraryProvider } from './context/LibraryContext';
import { AudioProvider } from './context/AudioContext';
import { HomeView } from './components/views/HomeView';
import { SearchView } from './components/views/SearchView';
import { LibraryView } from './components/views/LibraryView';
import { FavoritesView } from './components/views/FavoritesView';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullScreenPlayer } from './components/player/FullScreenPlayer';
import { BottomNav } from './components/navigation/BottomNav';
import { ImportModal } from './components/views/ImportModal';
import { ActiveTab } from './types/music';
import { androidBridge } from './services/androidBridge';
import { Smartphone, Monitor } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(false);
  const isNative = androidBridge.isNative();

  // If in desktop browser, default to mobile frame mode for authentic mobile preview
  useEffect(() => {
    if (!isNative && window.innerWidth > 768) {
      setIsMobileFrameMode(true);
    }
  }, [isNative]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onNavigateTab={setActiveTab} onOpenImport={() => setIsImportModalOpen(true)} />;
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView onNavigateTab={setActiveTab} onOpenImport={() => setIsImportModalOpen(true)} />;
      case 'favorites':
        return <FavoritesView />;
      default:
        return <HomeView onNavigateTab={setActiveTab} onOpenImport={() => setIsImportModalOpen(true)} />;
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isMobileFrameMode ? 'bg-dark-950 p-4 md:p-8' : 'bg-dark-950'}`}>
      {/* Desktop Mode Toggle Header (Only on wider screens outside native APK) */}
      {!isNative && (
        <div className="fixed top-3 right-4 z-40 hidden md:flex items-center gap-2 bg-dark-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-dark-750 shadow-lg text-xs">
          <span className="text-slate-400 font-medium">Preview Mode:</span>
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
            ? 'max-w-[412px] h-[850px] max-h-[92vh] rounded-[44px] border-[10px] border-dark-800 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_25px_rgba(139,92,246,0.15)] ring-1 ring-white/10'
            : 'h-screen max-w-lg mx-auto shadow-2xl'
        }`}
      >
        {/* Phone Speaker & Camera Notch Bar (in Frame Mode) */}
        {isMobileFrameMode && (
          <div className="h-6 w-full bg-dark-950 flex items-center justify-center relative flex-shrink-0">
            <div className="w-20 h-4 bg-dark-900 rounded-full flex items-center justify-center gap-2">
              <div className="w-8 h-1 bg-dark-700 rounded-full" />
              <div className="w-2 h-2 bg-dark-800 rounded-full" />
            </div>
          </div>
        )}

        {/* Scrollable Main View Area */}
        <main className="flex-1 overflow-y-auto relative">
          {renderActiveView()}
        </main>

        {/* Docked Mini Player & Bottom Nav */}
        <div className="flex-shrink-0 z-30">
          <MiniPlayer />
          <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>

        {/* Modals & Full Screen Sheets */}
        <FullScreenPlayer />
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />
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
