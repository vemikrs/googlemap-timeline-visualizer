/**
 * FFmpeg WASM のキャッシュ状態管理
 */

const CACHE_KEY = 'ffmpeg_loaded_version';
const CURRENT_VERSION = '0.12.6';

export type CacheStatus = 'not-loaded' | 'cached' | 'outdated';

/**
 * FFmpegのキャッシュ状態をチェック
 */
export function checkCacheStatus(): CacheStatus {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return 'not-loaded';
    if (cached !== CURRENT_VERSION) return 'outdated';
    return 'cached';
  } catch {
    return 'not-loaded';
  }
}

/**
 * FFmpegがロード済みとしてマーク
 */
export function markAsLoaded(): void {
  try {
    localStorage.setItem(CACHE_KEY, CURRENT_VERSION);
  } catch {
    // localStorage が使えない環境では無視
  }
}

/**
 * キャッシュをクリア
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // 無視
  }
}

/**
 * 推定ダウンロードサイズ (MB)
 */
export const ESTIMATED_DOWNLOAD_SIZE_MB = 32;

/**
 * FFmpeg Core のCDN URL
 * ESM版を使用（ブラウザのES Modules対応）
 */
export const FFMPEG_CORE_VERSION = '0.12.6';
export const FFMPEG_CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;
