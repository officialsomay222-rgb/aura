import { Track } from '../types';

const YTIFY_INSTANCES = [
  'https://yt.omada.cafe',
  'https://invidious.schenkel.eti.br',
  'https://inv.nadeko.net',
  'https://invidious.drgns.space',
  'https://invidious.jing.rocks',
  'https://iv.melmac.space',
  'https://invidious.nerdvpn.de',
  'https://inv.tux.pizza'
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class YtifyStreamResolver {
  private instances = YTIFY_INSTANCES;
  private activeInstance = this.instances[0];
  private cache = new Map<string, { timestamp: number; streamUrl: string }>();

  /**
   * Resolve an audio stream for an 11-character YouTube video ID
   */
  async resolveYtStream(videoId: string, quality: '320' | '160' | '96' = '320'): Promise<string | null> {
    if (!videoId || videoId.length !== 11) return null;

    // Check memory cache (valid for 1 hour)
    const cached = this.cache.get(videoId);
    if (cached && Date.now() - cached.timestamp < 3600 * 1000) {
      return cached.streamUrl;
    }

    const ordered = [this.activeInstance, ...shuffle(this.instances.filter(i => i !== this.activeInstance))];

    for (const instance of ordered) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;

        const data = await res.json();
        if (!data || !Array.isArray(data.adaptiveFormats)) continue;

        // Filter for audio streams
        const audioStreams = data.adaptiveFormats
          .filter((f: any) => f.type && f.type.startsWith('audio') && f.url)
          .map((f: any) => ({
            url: f.url,
            type: f.type,
            bitrate: parseInt(f.bitrate, 10) || 128000,
          }))
          .sort((a: any, b: any) => b.bitrate - a.bitrate);

        if (audioStreams.length > 0) {
          this.activeInstance = instance;
          let selected = audioStreams[0];

          if (quality === '96' && audioStreams.length > 1) {
            selected = audioStreams[audioStreams.length - 1];
          } else if (quality === '160' && audioStreams.length > 2) {
            selected = audioStreams[Math.floor(audioStreams.length / 2)];
          }

          this.cache.set(videoId, {
            timestamp: Date.now(),
            streamUrl: selected.url,
          });

          return selected.url;
        }
      } catch {
        // Try next instance
      }
    }

    return null;
  }

  /**
   * Search YouTube/Ytify for tracks
   */
  async searchYtify(query: string): Promise<Track[]> {
    if (!query.trim()) return [];

    const ordered = [this.activeInstance, ...shuffle(this.instances.filter(i => i !== this.activeInstance))];

    for (const instance of ordered) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;

        const data = await res.json();
        if (!Array.isArray(data)) continue;

        this.activeInstance = instance;

        return data.slice(0, 15).map((item: any) => ({
          id: item.videoId || item.id,
          title: item.title,
          artist: item.author || 'YouTube Artist',
          album: 'YouTube Music',
          coverUrl: item.videoThumbnails?.[1]?.url || item.videoThumbnails?.[0]?.url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400',
          duration: item.lengthSeconds || 180,
          source: 'yt',
        }));
      } catch {
        // Try next instance
      }
    }

    return [];
  }
}

export const ytifyResolver = new YtifyStreamResolver();
