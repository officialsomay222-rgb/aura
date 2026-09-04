import React, { useState, useRef } from 'react';
import { UploadCloud, Music, X, CheckCircle } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Track } from '../../types/music';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { importLocalTrack } = useLibrary();
  const [dragActive, setDragActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
        continue;
      }

      const audioBlobUrl = URL.createObjectURL(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');

      // Create audio to inspect duration
      const tempAudio = new Audio(audioBlobUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        const newTrack: Track = {
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: cleanTitle,
          artist: 'Local Artist',
          album: 'Device Music',
          duration: Math.round(tempAudio.duration) || 180,
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          audioUrl: audioBlobUrl,
          genre: 'Local Audio',
          isLocal: true,
          addedAt: Date.now(),
        };

        importLocalTrack(newTrack);
        setSuccessMessage(`Added "${cleanTitle}" to your library!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
              <UploadCloud size={18} />
            </div>
            <h3 className="text-base font-bold text-white">Import Local Audio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-dark-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Import your own <span className="text-brand-primary font-medium">.mp3</span>, <span className="text-brand-primary font-medium">.wav</span>, or <span className="text-brand-primary font-medium">.m4a</span> files directly into PulseMusic for offline listening.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive
              ? 'border-brand-primary bg-brand-primary/10 scale-102'
              : 'border-dark-700 hover:border-slate-500 bg-dark-850/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center text-brand-accent mb-2">
            <Music size={24} />
          </div>
          <p className="text-xs font-semibold text-white text-center">
            Tap to choose files from device
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Supports MP3, WAV, AAC, FLAC
          </p>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-green/20 border border-brand-green/40 text-brand-green text-xs font-medium animate-in fade-in">
            <CheckCircle size={16} />
            <span className="truncate">{successMessage}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-white transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
