/**
 * Service Worker for Tile Caching
 * タイルをキャッシュして2回目以降の再生を高速化
 */

const CACHE_NAME = 'tile-cache-v1';
const MAX_CACHE_ITEMS = 500;
const TILE_PATTERNS = [
  /basemaps\.cartocdn\.com/,
  /server\.arcgisonline\.com/
];

/**
 * タイルリクエストかどうかを判定
 */
const isTileRequest = (url) => {
  return TILE_PATTERNS.some(pattern => pattern.test(url));
};

/**
 * インストール時
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

/**
 * アクティベート時: 古いキャッシュを削除
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

/**
 * フェッチ時（キャッシュファースト戦略）
 */
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  if (!isTileRequest(url)) {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
            // キャッシュサイズを非同期で制限
            limitCacheSize(CACHE_NAME, MAX_CACHE_ITEMS);
          }
          return networkResponse;
        });
      });
    })
  );
});

/**
 * キャッシュサイズの制限
 */
const limitCacheSize = async (name, maxItems) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
};
