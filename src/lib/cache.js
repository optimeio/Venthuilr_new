/**
 * Royal Venthulir — High-Performance In-Memory Cache with Automatic TTL & Invalidation
 * Provides sub-millisecond responses for read-heavy public catalog, categories, and metrics.
 */

class MemoryCache {
  constructor() {
    this.store = new Map();
    this.defaultTTL = 60; // 60 seconds default
  }

  /**
   * Get an item from cache if not expired
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set an item with TTL in seconds
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds
   */
  set(key, value, ttlSeconds = this.defaultTTL) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });

    // Prevent unbounded memory growth by evicting oldest entries if > 2000 items
    if (this.store.size > 2000) {
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }
  }

  /**
   * Delete specific key or all keys matching a prefix
   * @param {string} prefix
   */
  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.store.clear();
  }
}

// Global cached instance across Next.js dev server hot-reloads
let globalCache = global.__venthulir_cache;
if (!globalCache) {
  globalCache = global.__venthulir_cache = new MemoryCache();
}

export const cache = globalCache;

export function invalidateProductCache() {
  cache.invalidatePrefix('products:');
  cache.invalidatePrefix('stats:');
}

export function invalidateStatsCache() {
  cache.invalidatePrefix('stats:');
}

export function invalidateCategoryCache() {
  cache.invalidatePrefix('categories:');
}
