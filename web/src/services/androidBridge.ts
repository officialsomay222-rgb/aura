// Interface matching the Kotlin WebAppInterface.kt
interface NativeAndroidBridge {
  showToast(message: string): void;
  vibrate(durationMs: number): void;
  getAppVersion(): string;
  openExternalUrl(url: string): void;
  notifyTrackChanged?(title: string, artist: string, isPlaying: boolean): void;
}

declare global {
  interface Window {
    AndroidBridge?: NativeAndroidBridge;
  }
}

class AndroidBridgeService {
  public isNative(): boolean {
    return typeof window !== 'undefined' && typeof window.AndroidBridge !== 'undefined';
  }

  public showToast(message: string): void {
    if (this.isNative() && window.AndroidBridge?.showToast) {
      window.AndroidBridge.showToast(message);
    } else {
      console.log(`[AndroidBridge Fallback Toast]: ${message}`);
      this.showWebToast(message);
    }
  }

  public vibrate(durationMs: number = 40): void {
    if (this.isNative() && window.AndroidBridge?.vibrate) {
      window.AndroidBridge.vibrate(durationMs);
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(durationMs);
      } catch {
        // Ignore fallback errors
      }
    }
  }

  public getAppVersion(): string {
    if (this.isNative() && window.AndroidBridge?.getAppVersion) {
      return window.AndroidBridge.getAppVersion();
    }
    return '1.0.0-web';
  }

  public openExternal(url: string): void {
    if (this.isNative() && window.AndroidBridge?.openExternalUrl) {
      window.AndroidBridge.openExternalUrl(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  public notifyTrackChanged(title: string, artist: string, isPlaying: boolean): void {
    if (this.isNative() && window.AndroidBridge?.notifyTrackChanged) {
      window.AndroidBridge.notifyTrackChanged(title, artist, isPlaying);
    }
  }

  private showWebToast(message: string): void {
    const existing = document.getElementById('pulse-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pulse-toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '90px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(22, 26, 41, 0.95)';
    toast.style.color = '#f8fafc';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '9999px';
    toast.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 10px rgba(139, 92, 246, 0.3)';
    toast.style.border = '1px solid rgba(139, 92, 246, 0.3)';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '99999';
    toast.style.pointerEvents = 'none';
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(-6px)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(6px)';
      setTimeout(() => toast.remove(), 350);
    }, 2400);
  }
}

export const androidBridge = new AndroidBridgeService();
