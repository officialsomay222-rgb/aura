/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { MainView } from './components/MainView';
import { Player } from './components/Player';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { OwnerView } from './components/OwnerView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { BottomNav } from './components/BottomNav';
import { ShockwaveOverlay } from './components/Shockwave';

function AppContent() {
  const { currentView, currentTrack, theme, dynamicColor } = useMusic();

  if (typeof window !== 'undefined' && window.location.pathname === '/admin') {
    return <AdminView />;
  }

  const getDynamicStyle = () => {
    if (theme === 'dynamic') {
      return { 
        backgroundColor: dynamicColor || '#1a1a1a', 
        transition: 'background-color 1s ease' 
      };
    }
    return {};
  };

  return (
    <div 
      className={`relative w-full h-[100dvh] font-sans overflow-hidden flex flex-col ${theme === 'light' ? 'bg-white text-zinc-900' : theme === 'dynamic' ? 'text-white' : 'bg-black text-white'}`}
      style={getDynamicStyle()}
    >
      {/* Dynamic Background Theming */}
      {currentTrack && theme === 'dynamic' && (
        <div 
          className="absolute inset-0 z-0 opacity-40 transition-all duration-1000 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url(${currentTrack.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px) saturate(200%)'
          }}
        />
      )}
      
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {currentView === 'home' && <MainView />}
        {currentView === 'search' && <SearchView />}
        {currentView === 'library' && <LibraryView />}
        {currentView === 'owner' && <OwnerView />}
        {currentView === 'profile' && <ProfileView />}
      </div>

      <div className="relative z-20">
        <BottomNav />
        {currentTrack && <Player />}
      </div>

      <ShockwaveOverlay />
    </div>
  );
}

export default function App() {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
}

