import type { Point } from '../types';

/**
 * プライバシーレベルの定義
 * gridSize は度数単位（0 = オフ）
 */
export interface PrivacyLevel {
  id: string;
  label: string;
  description: string;
  gridSize: number;
}

/**
 * プライバシーレベルのプリセット
 * スライダー等のUIで使用することを想定
 */
export const PRIVACY_LEVELS: readonly PrivacyLevel[] = [
  {
    id: 'none',
    label: 'なし',
    description: 'そのまま（Raw データ）',
    gridSize: 0,
  },
  {
    id: 'low',
    label: '低',
    description: '約1km / 町丁レベル',
    gridSize: 0.01,
  },
  {
    id: 'medium',
    label: '中',
    description: '約5km / 市区町村レベル',
    gridSize: 0.05,
  },
  {
    id: 'high',
    label: '高',
    description: '約50km / 地方・県レベル',
    gridSize: 0.5,
  },
  {
    id: 'max',
    label: '最大',
    description: '約110km / 広域レベル',
    gridSize: 1.0,
  },
] as const;

/**
 * プライバシーレベルIDの型
 */
export type PrivacyLevelId = (typeof PRIVACY_LEVELS)[number]['id'];

/**
 * IDからプライバシーレベルを取得
 */
export const getPrivacyLevelById = (id: string): PrivacyLevel | undefined => {
  return PRIVACY_LEVELS.find((level) => level.id === id);
};

/**
 * インデックスからプライバシーレベルを取得（スライダー用）
 */
export const getPrivacyLevelByIndex = (index: number): PrivacyLevel => {
  return PRIVACY_LEVELS[Math.max(0, Math.min(index, PRIVACY_LEVELS.length - 1))];
};

/**
 * 単一の座標値をグリッドの中心にスナップする
 * 計算式: (Math.floor(val / size) * size) + (size / 2)
 * 
 * @param value - 元の座標値（緯度または経度）
 * @param gridSize - グリッドサイズ（度数）
 * @returns グリッド中心にスナップされた座標値
 */
const snapToGridCenter = (value: number, gridSize: number): number => {
  return Math.floor(value / gridSize) * gridSize + gridSize / 2;
};

/**
 * 位置情報をぼかす（グリッドスナップ方式）
 * 
 * - グリッドの中心に座標を配置することで、見た目の偏りを防ぐ
 * - タイムスタンプやその他のメタデータは維持
 * - 非破壊的に新しい配列を返す
 * 
 * @param points - 元の位置情報配列
 * @param gridSize - グリッドサイズ（度数）。0の場合は何もせずそのまま返す
 * @returns 新しい Point[] 配列
 * 
 * @example
 * // 約1kmレベルでぼかす
 * const obfuscated = obfuscatePoints(points, 0.01);
 * 
 * // プライバシーレベルを使用
 * const level = getPrivacyLevelById('medium');
 * const obfuscated = obfuscatePoints(points, level?.gridSize ?? 0);
 */
export const obfuscatePoints = (points: Point[], gridSize: number): Point[] => {
  // gridSize が 0 以下の場合は何もしない（元データのコピーを返す）
  if (gridSize <= 0) {
    return points.map((p) => ({ ...p }));
  }

  return points.map((point) => ({
    ...point,
    lat: snapToGridCenter(point.lat, gridSize),
    lng: snapToGridCenter(point.lng, gridSize),
  }));
};

/**
 * プライバシーレベルIDを使用して位置情報をぼかす（便利関数）
 * 
 * @param points - 元の位置情報配列
 * @param levelId - プライバシーレベルID
 * @returns 新しい Point[] 配列
 */
export const obfuscatePointsByLevel = (
  points: Point[],
  levelId: PrivacyLevelId
): Point[] => {
  const level = getPrivacyLevelById(levelId);
  return obfuscatePoints(points, level?.gridSize ?? 0);
};
