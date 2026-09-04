import React from 'react';
import { Home, Search, Library, Heart } from 'lucide-react';
import { ActiveTab } from '../../types/music';
import { androidBridge } from '../../services/androidBridge';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ] as const;

  const handleTabClick = (tabId: ActiveTab) => {
    androidBridge.vibrate(15);
    onChangeTab(tabId);
  };

  return (
    <nav className="bg-dark-900/95 backdrop-blur-xl border-t border-dark-800 px-6 py-2 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-brand-primary scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive && tab.id === 'favorites' ? 'fill-brand-secondary text-brand-secondary' : ''} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-primary" />
                )}
              </div>
              <span className="text-[10px] font-medium mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
