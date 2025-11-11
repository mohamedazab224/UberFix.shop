interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

const CACHE_PREFIX = 'uberfix_cache_';

export class OfflineStorage {
  static set<T>(key: string, data: T, expiresInMs: number = 3600000): void {
    try {
      const cacheData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: expiresInMs,
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to offline storage:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const cached: CachedData<T> = JSON.parse(item);
      const now = Date.now();

      if (now - cached.timestamp > cached.expiresIn) {
        this.remove(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Error reading from offline storage:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Error removing from offline storage:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing offline storage:', error);
    }
  }

  static has(key: string): boolean {
    return this.get(key) !== null;
  }
}

export function useOfflineStorage() {
  return {
    isOnline: navigator.onLine,
    storage: OfflineStorage,
  };
}
