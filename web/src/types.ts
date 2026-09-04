export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  streamUrl?: string;
  audioUrl?: string;
  genre?: string;
  source?: 'jiosaavn' | 'yt' | 'local';
  lyrics?: { time: number; text: string }[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  creator: string;
  isCustom?: boolean;
}

export interface UserActivity {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: 'listening' | 'liked' | 'created_playlist';
  target: string;
  timestamp: string;
}

export interface AnalyticsData {
  dailyListeners: number[];
  topGenres: { name: string; percentage: number }[];
  listeningHours: number;
}
