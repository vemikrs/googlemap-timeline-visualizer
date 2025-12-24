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
