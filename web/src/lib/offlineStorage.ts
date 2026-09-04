import { get, set, del, keys } from 'idb-keyval';
import { Track } from '../types/music';

export interface OfflineTrackData {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number;
  blob: Blob;
  savedAt: number;
}

export const saveOfflineTrack = async (track: Track, audioBlob: Blob): Promise<void> => {
  const data: OfflineTrackData = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    coverUrl: track.coverUrl,
    duration: track.duration,
    blob: audioBlob,
    savedAt: Date.now()
  };
  await set(`offline_track_${track.id}`, data);
};

export const getOfflineTrack = async (id: string): Promise<OfflineTrackData | undefined> => {
  return await get(`offline_track_${id}`);
};

export const removeOfflineTrack = async (id: string): Promise<void> => {
  await del(`offline_track_${id}`);
};

export const getAllOfflineTracks = async (): Promise<OfflineTrackData[]> => {
  try {
    const allKeys = await keys();
    const trackKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('offline_track_'));
    const list: OfflineTrackData[] = [];
    for (const key of trackKeys) {
      const item = await get(key as string);
      if (item) list.push(item);
    }
    return list;
  } catch (e) {
    console.error('Failed to get offline tracks from idb', e);
    return [];
  }
};

export const isTrackOffline = async (id: string): Promise<boolean> => {
  try {
    const track = await get(`offline_track_${id}`);
    return !!track;
  } catch {
    return false;
  }
};
