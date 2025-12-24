import type { MapTheme } from '../types';

/**
 * Get tile layer URL based on theme
 * Uses reliable tile servers with good availability
 */
export const getTileLayerUrl = (theme: MapTheme): string => {
  switch (theme) {
    case 'dark':
      // CartoDB Dark Matter - minimal labels, dark theme
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    case 'satellite':
      // ArcGIS satellite imagery (minimal labels)
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    case 'light':
    default:
      // CartoDB Positron - clean, minimal, light gray design
      return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  }
};

/**
 * Leaflet library configuration
 * 自前ホスティング版を優先、フォールバックとしてCDNを使用
 */
const LEAFLET_LOCAL_JS = '/lib/leaflet/leaflet.js';
const LEAFLET_LOCAL_CSS = '/lib/leaflet/leaflet.css';
const LEAFLET_CDN_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CDN_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

/**
 * Load Leaflet library dynamically
 * 自前ホスティング版を優先し、失敗時はCDNにフォールバック
 */
export const loadLeaflet = async (): Promise<void> => {
  if (window.L) return;

  // Load CSS (自前ホスティング版)
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = LEAFLET_LOCAL_CSS;
  document.head.appendChild(link);

  // Load JS with fallback
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  };

  try {
    // 自前ホスティング版を試行
    await loadScript(LEAFLET_LOCAL_JS);
  } catch {
    // フォールバック: CDN版を試行
    console.warn('Local Leaflet failed, falling back to CDN');
    // CSS も CDN 版に切り替え
    link.href = LEAFLET_CDN_CSS;
    await loadScript(LEAFLET_CDN_JS);
  }
};

/**
 * データセーバーモードかどうかを判定
 */
export const isDataSaverEnabled = (): boolean => {
  const connection = (navigator as any).connection;
  return connection?.saveData === true;
};

/**
 * 緯度経度とズームレベルからタイル座標を計算
 */
export const latLngToTile = (lat: number, lng: number, zoom: number): { x: number; y: number } => {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n);
  return { x, y };
};

/**
 * 指定位置周辺のタイルをプリロード
 */
export const preloadTilesAround = (
  lat: number, 
  lng: number, 
  zoom: number, 
  theme: MapTheme,
  radius: number = 2
): void => {
  const baseUrl = getTileLayerUrl(theme);
  const { x: centerX, y: centerY } = latLngToTile(lat, lng, zoom);
  const maxTile = Math.pow(2, zoom) - 1;
  
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const x = Math.max(0, Math.min(maxTile, centerX + dx));
      const y = Math.max(0, Math.min(maxTile, centerY + dy));
      
      const subdomains = ['a', 'b', 'c'];
      const s = subdomains[(x + y) % 3];
      const url = baseUrl
        .replace('{s}', s)
        .replace('{z}', zoom.toString())
        .replace('{x}', x.toString())
        .replace('{y}', y.toString())
        .replace('{r}', '');
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
    }
  }
};

/**
 * 複数ポイントのタイルを一括プリロード
 */
export const preloadTilesForPoints = (
  points: Array<{ lat: number; lng: number }>,
  zoom: number,
  theme: MapTheme
): void => {
  // データセーバーモードではプリロードをスキップ
  if (isDataSaverEnabled()) return;
  
  const loadedTiles = new Set<string>();
  
  points.forEach(point => {
    const { x, y } = latLngToTile(point.lat, point.lng, zoom);
    const key = `${zoom}/${x}/${y}`;
    
    if (!loadedTiles.has(key)) {
      loadedTiles.add(key);
      preloadTilesAround(point.lat, point.lng, zoom, theme, 1);
    }
  });
};

/**
 * 2点間の距離を計算（Haversine formula）
 * @returns 距離（キロメートル）
 */
export const calculateDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371; // 地球の半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * ズームレベルに応じたパンのしきい値を取得（km）
 * これを超える移動は即座に実行
 */
export const getPanThreshold = (zoom: number): number => {
  const thresholds: Record<number, number> = {
    8: 50,    // 地方レベル
    11: 10,   // 県レベル
    13: 2,    // 市区町村レベル
    15: 0.5,  // 町レベル
  };
  
  const zoomLevels = Object.keys(thresholds).map(Number).sort((a, b) => a - b);
  for (const z of zoomLevels) {
    if (zoom <= z) return thresholds[z];
  }
  return 0.1;
};
