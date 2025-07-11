import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { env } from 'process';

interface CacheOptions {
  ttl?: number;
  debug?: boolean;
  enabled?: boolean;
  persist?: boolean;
}

interface CacheEntry {
  value: any;
  expires: number;
}

interface CacheData {
  data: Record<string, CacheEntry>;
  timestamp: number;
}

/**
 * ApiCache is a singleton class that provides a cache for API responses.
 * It is used to cache responses from external APIs to avoid redundant calls and improve performance.
 * It also persists the cache to disk so that it can be used across multiple runs of the application.
 * In development mode, the cache is stored in the .cache directory in the project root.
 * In production mode, the cache is stored in the app-cache directory in the tmp directory.
 */
export class ApiCache {
  private static instances: Map<string, ApiCache> = new Map();
  private cache: Map<string, CacheEntry>;
  private enabled: boolean;
  private persist: boolean;
  private cacheFile: string;
  private ttl: number;
  private readonly serviceName: string;

  private constructor(serviceName: string, options: CacheOptions = {}) {
    this.serviceName = serviceName;
    this.cache = new Map();
    this.enabled = options.enabled ?? true;
    this.persist = options.persist ?? true;
    this.ttl = options.ttl ?? 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    // Set up cache file path
    const cacheDir =
      process.env.NODE_ENV === 'development'
        ? path.join(process.cwd(), '.cache', 'api-cache')
        : path.join(os.tmpdir(), 'app-cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    this.cacheFile = path.join(cacheDir, `${this.serviceName}-cache.json`);

    // Load cache from disk if persistence is enabled
    if (this.persist) {
      this.loadFromDisk();
    }

    // Start cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000); // Clean up every minute
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key);
        cleanedCount++;
        if (env.NODE_ENV === 'development') {
          console.log(
            `[Cache] Cleaned up expired entry: ${key} (expired at ${new Date(entry.expires).toISOString()})`,
          );
        }
      }
    }
    if (cleanedCount > 0 && this.persist) {
      this.saveToDisk();
    }
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(
          fs.readFileSync(this.cacheFile, 'utf-8'),
        ) as CacheData;
        const now = Date.now();

        // Only load non-expired items
        Object.entries(data.data).forEach(([key, entry]) => {
          if (entry.expires > now) {
            this.cache.set(key, entry);
            if (env.NODE_ENV === 'development') {
              console.log(
                `[Cache] Loaded entry: ${key} (expires at ${new Date(entry.expires).toISOString()})`,
              );
            }
          } else if (env.NODE_ENV === 'development') {
            console.log(
              `[Cache] Skipped expired entry: ${key} (expired at ${new Date(entry.expires).toISOString()})`,
            );
          }
        });

        if (env.NODE_ENV === 'development') {
          console.log(`[Cache] Loaded ${this.cache.size} items from disk`);
        }
      }
    } catch (error) {
      console.warn(`[Cache] Failed to load cache from disk:`, error);
    }
  }

  private saveToDisk(): void {
    if (!this.persist) return;

    try {
      const data: CacheData = {
        data: Object.fromEntries(this.cache),
        timestamp: Date.now(),
      };

      fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));

      if (env.NODE_ENV === 'development') {
        console.log(`[Cache] Saved ${this.cache.size} items to disk`);
      }
    } catch (error) {
      console.warn(`[Cache] Failed to save cache to disk:`, error);
    }
  }

  static getInstance(serviceName: string, options?: CacheOptions): ApiCache {
    if (!this.instances.has(serviceName)) {
      this.instances.set(serviceName, new ApiCache(serviceName, options));
    }
    const instance = this.instances.get(serviceName)!;
    if (env.NODE_ENV === 'development') {
      console.log('[Cache] Instance loaded:', instance.serviceName);
    }
    return instance;
  }

  get(key: string): any {
    if (!this.enabled) {
      if (env.NODE_ENV === 'development') {
        console.log(`[Cache] Disabled: ${key}`);
      }
      return undefined;
    }

    const fullKey = `${this.serviceName}:${key}`;
    const entry = this.cache.get(fullKey);
    if (!entry) {
      if (env.NODE_ENV === 'development') {
        console.log(`[Cache] Could not find: ${key}`);
      }
      return undefined;
    }

    if (entry.expires < Date.now()) {
      this.cache.delete(fullKey);
      if (env.NODE_ENV === 'development') {
        console.log(
          `[Cache] Entry expired: ${key} (expired at ${new Date(entry.expires).toISOString()})`,
        );
      }
      return undefined;
    }

    if (env.NODE_ENV === 'development') {
      console.log(
        `[Cache] Found: ${key} (expires at ${new Date(entry.expires).toISOString()})`,
      );
    }

    return entry.value;
  }

  set(key: string, value: any): void {
    if (!this.enabled) {
      if (env.NODE_ENV === 'development') {
        console.log(`[Cache] Disabled: ${key}`);
      }
      return;
    }

    const fullKey = `${this.serviceName}:${key}`;
    const expires = Date.now() + this.ttl;
    const entry: CacheEntry = {
      value,
      expires,
    };

    this.cache.set(fullKey, entry);
    if (this.persist) {
      this.saveToDisk();
    }
    if (env.NODE_ENV === 'development') {
      console.log(
        `[Cache] Set: ${key} (expires at ${new Date(expires).toISOString()})`,
      );
    }
  }

  clear(): void {
    this.cache.clear();
    if (this.persist) {
      try {
        fs.unlinkSync(this.cacheFile);
      } catch (error) {
        console.warn(`[Cache] Failed to delete cache file:`, error);
      }
    }
    if (env.NODE_ENV === 'development') {
      console.log(`[Cache] Cleared all entries`);
    }
  }

  getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // Not tracking hits/misses in this simplified version
      misses: 0,
    };
  }

  /**
   * Enable or disable the cache
   * @param enabled - Whether to enable or disable the cache
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (env.NODE_ENV === 'development') {
      console.log(`[Cache] ${enabled ? 'Enabled' : 'Disabled'}`);
    }
  }

  /**
   * Check if the cache is enabled
   * @returns Whether the cache is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable or disable cache persistence
   * @param persist - Whether to persist the cache to disk
   */
  setPersistence(persist: boolean): void {
    this.persist = persist;
    if (persist) {
      this.saveToDisk();
    }
    if (env.NODE_ENV === 'development') {
      console.log(`[Cache] Persistence ${persist ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Check if cache persistence is enabled
   * @returns Whether cache persistence is currently enabled
   */
  isPersistent(): boolean {
    return this.persist;
  }

  /**
   * Hash a key - used for long cache keys that would be inefficient to store directly
   * @param key - The key to hash
   * @returns The hashed key
   */
  static hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
