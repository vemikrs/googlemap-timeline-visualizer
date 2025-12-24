export interface Point {
  lat: number;
  lng: number;
  ts: number;
  year: number;
}

export interface ParsedCoords {
  lat: number;
  lng: number;
}

export type MapTheme = 'light' | 'dark' | 'satellite';

// アスペクト比（動画エクスポート用）
export type AspectRatio = '16:9' | '9:16' | '1:1';

// 動画品質
export type VideoQuality = 'low' | 'medium' | 'high';

// 動画エクスポート設定（拡張版）
export interface VideoExportOptions {
  fps: number;
  maxDuration: number;
  resolution: number;
  format: 'mp4' | 'gif' | 'webm';
  aspectRatio: AspectRatio;
  quality: VideoQuality;
  watermark: boolean;
  includeStats: boolean;
}

// タイムライン統計
export interface TimelineStats {
  totalPoints: number;
  totalDistance: number;      // km
  yearlyBreakdown: {
    year: number;
    points: number;
    distance: number;
  }[];
  longestTrip: {
    distance: number;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    date: number;
  } | null;
  earthCircumferences: number;  // 地球何周分
  moonDistancePercent: number;  // 月までの距離の何%
  averagePointsPerDay: number;
  dateRange: {
    start: number;
    end: number;
  };
}

// シェアデータ
export interface ShareData {
  points: Point[];
  yearRange: { start: number; end: number };
  stats: TimelineStats;
  videoBlob?: Blob;
  mapTheme: MapTheme;
}

// ディープリンク用の共有可能な状態
export interface ShareableState {
  yearStart?: number;
  yearEnd?: number;
  theme?: MapTheme;
  view?: 'wide' | 'focus';
  speed?: number;
  demo?: boolean;
}

// 地域プリセット
export interface RegionPreset {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
}

export const REGION_PRESETS: readonly RegionPreset[] = [
  { id: 'auto', label: '自動（データ範囲）', center: [0, 0], zoom: 0 },
  { id: 'japan', label: '日本', center: [36.2048, 138.2529], zoom: 5 },
  { id: 'asia', label: 'アジア', center: [35, 105], zoom: 3 },
  { id: 'europe', label: 'ヨーロッパ', center: [50, 10], zoom: 4 },
  { id: 'north-america', label: '北米', center: [40, -100], zoom: 4 },
  { id: 'world', label: '世界', center: [20, 0], zoom: 2 },
] as const;

export type RegionPresetId = (typeof REGION_PRESETS)[number]['id'];

// プライバシー関連の型を再エクスポート
export type {
  PrivacyLevel,
  PrivacyLevelId,
} from './utils/privacyObfuscator';

export {
  PRIVACY_LEVELS,
  getPrivacyLevelById,
  getPrivacyLevelByIndex,
  obfuscatePoints,
  obfuscatePointsByLevel,
} from './utils/privacyObfuscator';
