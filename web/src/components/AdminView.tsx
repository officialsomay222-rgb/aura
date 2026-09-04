import React, { useState, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { Lock, Image as ImageIcon, Save, LogOut } from 'lucide-react';


export function AdminView() {
  const { theme, showToast } = useMusic();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [ownerAvatar, setOwnerAvatar] = useState(() => {
    return localStorage.getItem('owner_avatar_img') || 'https://i.ibb.co/nq3h7TQs/Picsart-26-06-28-14-10-58-930.png';
  });

  const isWhite = theme === 'light' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAuthenticated(true);
      showToast('Admin access granted');
    } else {
      showToast('Incorrect password');
    }
  };

  const handleSave = () => {
    localStorage.setItem('owner_avatar_img', ownerAvatar);
    window.dispatchEvent(new Event('storage'));
    showToast('Settings saved successfully');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setOwnerAvatar(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 ${isWhite ? 'bg-zinc-50' : 'bg-black'}`}>
        <div 
          
          
          className={`w-full max-w-sm p-8 rounded-3xl ${isWhite ? 'bg-white shadow-xl' : 'bg-zinc-900 border border-zinc-800'}`}
        >
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${isWhite ? 'bg-black text-white' : 'bg-white text-black'}`}>
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className={`text-2xl font-black text-center mb-8 ${isWhite ? 'text-black' : 'text-white'}`}>
            Admin Panel
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-4 rounded-2xl outline-none font-medium transition-all ${
                  isWhite 
                    ? 'bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-black text-black placeholder:text-zinc-400' 
                    : 'bg-zinc-800 focus:bg-zinc-900 focus:ring-2 focus:ring-white text-white placeholder:text-zinc-500'
                }`}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-bold transition-transform active:scale-95 ${
                isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              Unlock Access
            </button>
          </form>
          <div className="mt-6 text-center">
            <button 
              onClick={() => window.location.href = '/'}
              className={`text-sm font-medium ${isWhite ? 'text-zinc-500 hover:text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Return to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col p-6 overflow-y-auto ${isWhite ? 'bg-zinc-50' : 'bg-black'}`}>
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-black ${isWhite ? 'text-black' : 'text-white'}`}>
            Admin Panel
          </h1>
          <button 
            onClick={handleLogout}
            className={`p-2 rounded-full ${isWhite ? 'bg-zinc-200 text-black hover:bg-zinc-300' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className={`p-6 rounded-3xl mb-6 ${isWhite ? 'bg-white shadow-xl' : 'bg-zinc-900 border border-zinc-800'}`}>
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className={isWhite ? 'text-black' : 'text-white'} />
            <h2 className={`text-xl font-bold ${isWhite ? 'text-black' : 'text-white'}`}>Owner Image</h2>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div className={`relative w-32 h-32 rounded-full p-1 border-2 ${isWhite ? 'border-zinc-200 bg-zinc-100' : 'border-zinc-700 bg-zinc-800'}`}>
              <img 
                src={ownerAvatar} 
                alt="Owner" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/nq3h7TQs/Picsart-26-06-28-14-10-58-930.png';
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isWhite ? 'bg-black text-white' : 'bg-white text-black'}`}>
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            
            <p className={`text-sm text-center font-medium ${isWhite ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Tap the image above to upload a new owner avatar. This will update the center button on the bottom nav and the top-left home icon.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl flex justify-center items-center gap-2 font-bold transition-transform active:scale-95 ${
            isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
          }`}
        >
          <Save className="w-5 h-5" />
          Save & Apply
        </button>
      </div>
    </div>
  );
}
