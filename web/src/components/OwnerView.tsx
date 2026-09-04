import React, { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';


const OWNER_SITE_URL = 'https://owner-official.vercel.app';

export function OwnerView() {
  const { theme, triggerShockwave } = useMusic();
  const [isLoading, setIsLoading] = useState(true);
  const isWhite = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);

  useEffect(() => {
    // Trigger the shockwave originating from the bottom navigation center
    triggerShockwave({
      x: typeof window !== 'undefined' ? window.innerWidth / 2 : 200,
      y: typeof window !== 'undefined' ? window.innerHeight - 45 : 700,
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-black">
      {/* Full-Screen Edge-to-Edge Embedded Site */}
      <div className="relative w-full h-full flex-1">
        {/* Sleek Minimal Loading State */}
        
          {isLoading && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-white"
            >
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-white/15 border-t-white animate-spin" />
                <div className="absolute w-2 h-2 rounded-full bg-white animate-ping" />
              </div>
              <p className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">
                Opening Owner Official
              </p>
              <p className="text-[11px] text-zinc-500 font-mono mt-1">owner-official.vercel.app</p>
            </div>
          )}
        

        {/* Clean Fullscreen Iframe */}
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
}
