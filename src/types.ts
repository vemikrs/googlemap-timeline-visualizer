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
