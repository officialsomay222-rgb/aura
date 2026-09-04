# PulseMusic 🎵
### Full-Fledged Hybrid Android Music Application (Kotlin APK + Compiled Web Core)

PulseMusic is a full-featured music streaming and player app built with a **Hybrid Architecture**:
- **Native Android APK Wrapper (`android/`)**: Written in Kotlin, hosting a high-performance, hardware-accelerated Android `WebView`. It loads the pre-compiled application bundle locally from the APK assets (`assets/web/index.html`), ensuring **100% offline functionality** without needing any remote web server for the UI.
- **Compiled Web Core (`web/`)**: Built with React 18, TypeScript, Tailwind CSS, Lucide Icons, and the Web Audio API. It features a sleek glassmorphic dark theme, spinning vinyl turntable, synchronized lyrics, audio visualizer, playlists, equalizer presets, and local audio importer.
- **Kotlin ↔ JavaScript Native Bridge (`AndroidBridge`)**: Connects the web UI to native Android capabilities for device toasts, vibration/haptics, app version reporting, and external URL intent handling.

---

## 📱 Architecture Diagram

```
PulseMusic/
├── web/                             # Web Core & Frontend Source Code
│   ├── src/
│   │   ├── types/music.ts          # Track, Playlist, and AudioState models
│   │   ├── data/mockTracks.ts      # Curated streaming tracks with timed lyrics
│   │   ├── services/androidBridge.ts# Web-to-Kotlin JS interface bridge
│   │   ├── context/AudioContext.tsx# HTML5 / Web Audio player engine
│   │   ├── context/LibraryContext.tsx# Liked songs, custom playlists, local files
│   │   ├── components/
│   │   │   ├── player/             # FullScreenPlayer, Vinyl turntable, Visualizer, Lyrics
│   │   │   ├── views/              # HomeView, SearchView, LibraryView, FavoritesView
│   │   │   └── navigation/         # BottomNavBar
│   │   ├── App.tsx                 # Responsive app container & mobile frame simulator
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts              # Bundles with relative base './' for WebView
│
├── android/                         # Native Kotlin Android Project
│   ├── app/src/main/
│   │   ├── java/com/pulsemusic/app/
│   │   │   ├── MainActivity.kt     # Configures WebView & WebViewAssetLoader
│   │   │   └── WebAppInterface.kt  # @JavascriptInterface native bridge
│   │   ├── assets/web/             # COMPILED web bundle embedded into APK
│   │   └── AndroidManifest.xml     # Network & vibration permissions
│   ├── build.gradle.kts
│   └── settings.gradle.kts
│
├── scripts/
│   └── sync-assets.js              # Syncs web/dist directly into Android APK assets
└── package.json                    # Root orchestrator scripts
```

---

## 🚀 Quick Start Commands

From the root directory:

### 1. Run Web Preview (PC Browser)
```bash
npm run dev
```
Starts the local development server at `http://localhost:3000` with hot-reload and an interactive mobile phone bezel simulator.

### 2. Compile Web Core & Sync to Android APK Assets
```bash
npm run build:all
```
This runs TypeScript checking, compiles the minified web production bundle into `web/dist/`, and automatically syncs it into `android/app/src/main/assets/web/`.

### 3. Build the Android APK
```bash
cd android
./gradlew assembleDebug
```
(On Windows: `gradlew.bat assembleDebug`)
The compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## ✨ Key Features

1. **Native Offline Loading**: The Android APK loads all HTML/JS/CSS directly from inside the APK (`file:///android_asset/` via `WebViewAssetLoader`). No external web hosting is required to run the app shell.
2. **Vinyl Turntable Player**: Interactive vinyl record that rotates in real-time when playing, complete with tonearm needle animation.
3. **Synchronized Lyrics**: Timed karaoke-style lyrics that highlight and auto-scroll with track playback. Tap any line to seek immediately.
4. **Real-time Visualizer**: Dynamic animated frequency analyzer bars reacting to the music.
5. **Audio Equalizer**: Bass Boost, Vocal, Electronic, Acoustic, and Flat presets.
6. **Sleep Timer**: Auto-pause playback after 15, 30, 45, or 60 minutes.
7. **Local Audio Importer**: Users can import their own `.mp3`, `.wav`, or `.m4a` files from their device/computer directly into their personal library.
8. **Playlists & Favorites**: Create, rename, delete custom playlists, and toggle "Liked Songs" with heart animations.
9. **Media Session API**: Control playback from phone lock screens, notification trays, and physical media keys.
10. **Dual Mode View**: Realistic mobile phone frame on desktop browsers, and 100% full-screen responsive view on phones and inside the APK.
