import { Track, Playlist } from '../types/music';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight City Lights',
    artist: 'Neon Horizon',
    album: 'Cyberdreams 2088',
    duration: 185,
    genre: 'Synthwave',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    lyrics: [
      { time: 0, text: '♪ (Smooth synth intro begins) ♪' },
      { time: 12, text: 'Neon lights reflecting in the midnight rain' },
      { time: 24, text: 'Driving down the boulevard, washing out the pain' },
      { time: 36, text: 'Synthesizers pulsing through the open air' },
      { time: 48, text: 'Catching echoes of a dream we used to share' },
      { time: 60, text: '♪ (Bass drop & electronic rhythm) ♪' },
      { time: 75, text: 'Speeding through the skyline, chasing down the stars' },
      { time: 90, text: 'Nothing in between us but the speed of electric cars' },
      { time: 105, text: 'Midnight city, hold me till the dawn' },
      { time: 120, text: 'Before the magic fades and the night is gone' },
      { time: 140, text: '♪ (Solo synthesizer melody) ♪' },
      { time: 165, text: 'Fade into the morning light...' },
    ]
  },
  {
    id: 'track-2',
    title: 'Coffee & Rainy Windows',
    artist: 'Lofi Boy',
    album: 'Sunday Afternoon Stroll',
    duration: 210,
    genre: 'Lo-Fi',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    lyrics: [
      { time: 0, text: '♪ (Vinyl crackle & warm piano chords) ♪' },
      { time: 15, text: 'Drops of rain tapping on the glass' },
      { time: 30, text: 'Watching quiet moments slowly pass' },
      { time: 45, text: 'Warm mug in my hands, thoughts drifting away' },
      { time: 60, text: 'Nothing else matters on this gentle day' },
      { time: 80, text: '♪ (Lo-fi boom bap drum beat kicks in) ♪' },
      { time: 100, text: 'Pages turning, quiet breathing' },
      { time: 125, text: 'Peace of mind is all I am needing' },
      { time: 150, text: 'Lost inside the mellow groove' },
      { time: 175, text: 'When the world has stopped its move...' }
    ]
  },
  {
    id: 'track-3',
    title: 'Solar Echoes',
    artist: 'Aura Bloom',
    album: 'Deep Atmosphere',
    duration: 245,
    genre: 'Ambient',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lyrics: [
      { time: 0, text: '♪ (Ethereal spatial pad swells) ♪' },
      { time: 20, text: 'Floating beyond the stratosphere' },
      { time: 40, text: 'Every sound is crystal clear' },
      { time: 65, text: 'Drifting with celestial grace' },
      { time: 95, text: 'Infinite beauty of timeless space' },
      { time: 130, text: '♪ (Deep sub-harmonic resonance) ♪' },
      { time: 170, text: 'Whispers from a distant star' },
      { time: 210, text: 'Carried to where you are...' }
    ]
  },
  {
    id: 'track-4',
    title: 'Electric Euphoria',
    artist: 'Vortex Protocol',
    album: 'Club Velocity',
    duration: 195,
    genre: 'Electronic',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    lyrics: [
      { time: 0, text: '♪ (Fast 128 BPM energetic build) ♪' },
      { time: 16, text: 'Feel the voltage in the air' },
      { time: 28, text: 'Hands high up, no worries or care' },
      { time: 42, text: '3, 2, 1 — Release the sound!' },
      { time: 44, text: '♪ (High energy dance drop!) ♪' },
      { time: 70, text: 'The crowd vibrates, the bass hits deep' },
      { time: 95, text: 'Tonight is a promise we aim to keep' },
      { time: 120, text: 'Electric energy, keep moving your feet' },
      { time: 150, text: 'Locked in tempo to the digital beat' }
    ]
  },
  {
    id: 'track-5',
    title: 'Golden Sunset Acoustic',
    artist: 'The Timber Pines',
    album: 'Mountain Air',
    duration: 160,
    genre: 'Acoustic',
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    lyrics: [
      { time: 0, text: '♪ (Fingerpicked acoustic guitar) ♪' },
      { time: 12, text: 'Sun dipping down below the golden hill' },
      { time: 25, text: 'Evening breeze is soft and still' },
      { time: 40, text: 'Strumming chords by the campfire glow' },
      { time: 55, text: 'Watching shadows come and go' },
      { time: 75, text: 'Simple times, a melody so sweet' },
      { time: 100, text: 'Under starry skies our memories meet' },
      { time: 130, text: '♪ (Harmonica solo fadeout) ♪' }
    ]
  },
  {
    id: 'track-6',
    title: 'Cyberpunk Overdrive',
    artist: 'Kuroshio Grid',
    album: 'Neo-Tokyo 2099',
    duration: 215,
    genre: 'Synthwave',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    lyrics: [
      { time: 0, text: '♪ (Dark industrial cyber bass) ♪' },
      { time: 18, text: 'Matrix uplink established' },
      { time: 32, text: 'Running through the grid tonight' },
      { time: 50, text: 'Chasing down the holographic light' },
      { time: 75, text: 'No system can contain this code' },
      { time: 100, text: 'Overclocked into overload!' }
    ]
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-chill',
    title: 'Lofi & Study Chillout',
    description: 'Perfect beats to relax, study, and code to late into the evening.',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-2', 'track-3', 'track-5'],
    createdAt: Date.now() - 1000000
  },
  {
    id: 'playlist-synth',
    title: 'Cyberpunk & Night Drive',
    description: 'Neon synthwave and retro electro melodies for open highway drives.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-1', 'track-4', 'track-6'],
    createdAt: Date.now() - 500000
  },
  {
    id: 'playlist-workout',
    title: 'Electronic Pulse High Energy',
    description: 'High tempo bangers to keep your adrenaline surging.',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    trackIds: ['track-4', 'track-6', 'track-1'],
    createdAt: Date.now() - 200000
  }
];

export const GENRES = [
  'All',
  'Synthwave',
  'Lo-Fi',
  'Ambient',
  'Electronic',
  'Acoustic'
];
