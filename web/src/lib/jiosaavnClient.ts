import CryptoJS from 'crypto-js';
import { Track } from '../types';

const SAAVN_SEARCH_URL = 'https://www.jiosaavn.com/api.php';
const DES_KEY = '38346591';

export function decryptMediaUrl(encryptedUrl: string, quality: '320' | '160' | '96' | 'high' | 'medium' | 'low' = '320'): string | null {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) } as any,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    let url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url || !url.startsWith('http')) return null;

    // Enforce https on CDN streams
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }

    if (quality === '96' || quality === 'low') {
      url = url.replace(/_(320|160|96)\.mp4/, '_96.mp4');
    } else if (quality === '160' || quality === 'medium') {
      url = url.replace(/_(320|160|96)\.mp4/, '_160.mp4');
    } else {
      url = url.replace(/_(320|160|96)\.mp4/, '_320.mp4');
    }
    return url;
  } catch (e) {
    console.error('Failed to decrypt media url', e);
    return null;
  }
}

export function cleanHtmlText(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export function cleanCoverUrl(url: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500&h=500';
  let clean = url.replace(/http:\/\//, 'https://');
  clean = clean.replace(/50x50|150x150/, '500x500');
  return clean;
}

export function extractArtist(item: any): string {
  if (item.subtitle && typeof item.subtitle === 'string') {
    return cleanHtmlText(item.subtitle);
  }
  const primary = item.more_info?.artistMap?.primary_artists;
  if (Array.isArray(primary) && primary.length > 0) {
    return cleanHtmlText(primary.map((a: any) => a.name).join(', '));
  }
  if (item.more_info?.singers) {
    return cleanHtmlText(item.more_info.singers);
  }
  return 'Unknown Artist';
}

export async function searchJioSaavn(query: string, quality: '320' | '160' | '96' = '320'): Promise<Track[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const candidateQueries = [trimmed];
  // If query contains comma or featured markers, add cleaned candidate
  if (trimmed.includes(',') || trimmed.toLowerCase().includes('feat') || trimmed.toLowerCase().includes('ft.')) {
    candidateQueries.push(trimmed.split(',')[0].replace(/\b(feat|ft\.)\b.*$/i, '').trim());
  }

  for (const q of candidateQueries) {
    const url = `${SAAVN_SEARCH_URL}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&p=1&n=20&q=${encodeURIComponent(q)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const results = data.results || [];
      if (!Array.isArray(results) || results.length === 0) continue;

      const tracks: Track[] = [];

      for (const item of results) {
        const encrypted = item.more_info?.encrypted_media_url;
        const decryptedStream = encrypted ? decryptMediaUrl(encrypted, quality) : null;

        tracks.push({
          id: item.id || `saavn-${Math.random().toString(36).substring(2, 8)}`,
          title: cleanHtmlText(item.title || item.song),
          artist: extractArtist(item),
          album: cleanHtmlText(item.more_info?.album || item.album || 'Single'),
          duration: parseInt(item.more_info?.duration || item.duration || '180', 10),
          coverUrl: cleanCoverUrl(item.image),
          streamUrl: decryptedStream || undefined,
          audioUrl: decryptedStream || undefined,
          source: 'jiosaavn',
        });
      }

      if (tracks.length > 0) {
        return tracks;
      }
    } catch (err) {
      console.warn('JioSaavn search candidate error:', q, err);
    }
  }

  return [];
}

/**
 * Direct song fetcher: resolves title and artist to a playable 320k track
 */
export async function fetchJioSaavnSong(title: string, artist?: string, quality: '320' | '160' | '96' = '320'): Promise<Track | null> {
  const cleanTitle = title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
  const queries = [
    cleanTitle,
    artist ? `${cleanTitle} ${artist.split(',')[0].trim()}` : cleanTitle,
    title
  ];

  for (const q of queries) {
    try {
      const results = await searchJioSaavn(q, quality);
      if (results.length > 0 && results[0].streamUrl) {
        return results[0];
      }
    } catch {}
  }
  return null;
}
