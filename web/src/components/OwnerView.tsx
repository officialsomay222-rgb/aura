import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { androidBridge } from '../services/androidBridge';

const OWNER_SITE_URL = 'https://owner-official.vercel.app';

interface OwnerViewProps {
  triggerShockwave: (origin?: { x: number; y: number }) => void;
}

export const OwnerView: React.FC<OwnerViewProps> = ({ triggerShockwave }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    triggerShockwave({
      x: window.innerWidth / 2,
      y: window.innerHeight - 50,
    });
  }, [triggerShockwave]);

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-dark-950 text-white">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-dark-900/90 border-b border-dark-750 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-md">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              Owner Official
              <ShieldCheck size={14} className="text-brand-green fill-brand-green" />
            </h3>
            <p className="text-[10px] text-slate-400">owner-official.vercel.app</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLoading(true)}
            className="p-2 rounded-full bg-dark-800 hover:bg-dark-700 text-slate-300 transition-colors"
            title="Reload site"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => androidBridge.openExternal(OWNER_SITE_URL)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-xs font-semibold hover:bg-brand-primary hover:text-white transition-all"
          >
            <ExternalLink size={13} />
            <span>Open Browser</span>
          </button>
        </div>
      </div>

      {/* Frame / Embedded site */}
      <div className="relative w-full flex-1 min-h-0 bg-black">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-dark-950 text-white space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping" />
            </div>
            <p className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
              Connecting to Owner Official
            </p>
            <p className="text-[11px] text-slate-500 font-mono">Loading dynamic interface...</p>
          </div>
        )}

        <iframe
          src={OWNER_SITE_URL}
          title="Owner Official"
          className="w-full h-full border-0 bg-black block"
          onLoad={() => setIsLoading(false)}
          allow="camera; microphone; geolocation; encrypted-media; autoplay; clipboard-write; fullscreen"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
