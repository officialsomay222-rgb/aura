import { get, set, del, keys } from 'idb-keyval';

export interface OfflineTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number;
  blob: Blob;
}

export const saveOfflineTrack = async (trackData: OfflineTrack) => {
  await set(`track_${trackData.id}`, trackData);
};

export const getOfflineTrack = async (id: string): Promise<OfflineTrack | undefined> => {
  return await get(`track_${id}`);
};

export const removeOfflineTrack = async (id: string) => {
  await del(`track_${id}`);
};

export const getAllOfflineTracks = async (): Promise<OfflineTrack[]> => {
  const allKeys = await keys();
  const trackKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('track_'));
  const tracks: OfflineTrack[] = [];
  for (const key of trackKeys) {
    const track = await get(key as string);
    if (track) tracks.push(track);
  }
  return tracks;
};

export const isTrackOffline = async (id: string): Promise<boolean> => {
  const track = await get(`track_${id}`);
  return !!track;
};
