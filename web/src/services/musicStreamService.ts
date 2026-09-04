import { Track } from '../types';
import { searchJioSaavn, decryptMediaUrl } from '../lib/jiosaavnClient';
import { ytifyResolver } from '../lib/ytifyResolver';
import { getOfflineTrack } from '../lib/offlineStorage';

export interface StreamResolutionResult {
  streamUrl: string;
  provider: 'jiosaavn' | 'ytify' | 'offline' | 'direct';
}

class MusicStreamService {
  /**
   * Resolves the best playable audio stream for a track:
   * 1. Offline cached audio (Instant)
   * 2. JioSaavn direct 320/160/96kbps stream (Prioritized for speed & fidelity)
   * 3. Ytify Invidious stream (For YouTube tracks or songs not on JioSaavn)
   * 4. Direct/Sample fallback
   */
  async resolveAudioStream(
    track: Track,
    rawQuality: string = '320'
  ): Promise<StreamResolutionResult | null> {
    const quality: '320' | '160' | '96' = 
      (rawQuality === 'high' || rawQuality === 'automatic' || rawQuality === '320') ? '320' :
      (rawQuality === 'medium' || rawQuality === '160') ? '160' : '96';
    // 1. Check Offline Storage (IndexedDB)
    try {
      const offlineItem = await getOfflineTrack(track.id);
      if (offlineItem && offlineItem.blob) {
        const objectUrl = URL.createObjectURL(offlineItem.blob);
        return {
          streamUrl: objectUrl,
          provider: 'offline',
        };
      }
    } catch {}

    // 2. Direct Stream URL if already resolved and valid
    if (track.streamUrl && track.streamUrl.startsWith('http')) {
      return {
        streamUrl: track.streamUrl,
        provider: track.source === 'yt' ? 'ytify' : 'jiosaavn',
      };
    }

    // 3. If track has YouTube ID (11 chars) or source === 'yt'
    if (track.source === 'yt' || track.id.length === 11) {
      // First try JioSaavn match for higher quality/speed if title is clean
      if (track.title) {
        try {
          const saavnResults = await searchJioSaavn(`${track.title} ${track.artist || ''}`.trim(), quality);
          const saavnStream = saavnResults.length > 0 ? (saavnResults[0].streamUrl || saavnResults[0].audioUrl) : null;
          if (saavnStream) {
            return {
              streamUrl: saavnStream,
              provider: 'jiosaavn',
            };
          }
        } catch {}
      }

      // If JioSaavn didn't match, resolve with Ytify stream resolver
      try {
        const ytStream = await ytifyResolver.resolveYtStream(track.id, quality);
        if (ytStream) {
          return {
            streamUrl: ytStream,
            provider: 'ytify',
          };
        }
      } catch {}
    }

    // 4. Default: Query JioSaavn first for title and artist
    if (track.title) {
      try {
        const saavnResults = await searchJioSaavn(`${track.title} ${track.artist || ''}`.trim(), quality);
        const saavnStream = saavnResults.length > 0 ? (saavnResults[0].streamUrl || saavnResults[0].audioUrl) : null;
        if (saavnStream) {
          return {
            streamUrl: saavnStream,
            provider: 'jiosaavn',
          };
        }
      } catch {}

      // If JioSaavn didn't have it, search Ytify for the song
      try {
        const ytResults = await ytifyResolver.searchYtify(`${track.title} ${track.artist || ''}`);
        if (ytResults.length > 0) {
          const ytStream = await ytifyResolver.resolveYtStream(ytResults[0].id, quality);
          if (ytStream) {
            return {
              streamUrl: ytStream,
              provider: 'ytify',
            };
          }
        }
      } catch {}
    }

    return null;
  }
}

export const musicStreamService = new MusicStreamService();
