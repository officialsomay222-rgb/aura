export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  genre: string;
  lyrics?: LyricLine[];
  isLocal?: boolean;
  addedAt?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  createdAt: number;
  isCustom?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type EqualizerPreset = 'flat' | 'bass' | 'vocal' | 'electronic' | 'acoustic';

export type ActiveTab = 'home' | 'search' | 'library' | 'favorites';
