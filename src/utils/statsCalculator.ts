/**
 * タイムライン統計計算ユーティリティ
 */

import type { Point, TimelineStats } from '../types';

// 地球の円周（km）
const EARTH_CIRCUMFERENCE = 40075;

// 地球から月までの平均距離（km）
const EARTH_MOON_DISTANCE = 384400;

/**
 * 2点間の距離を計算（Haversine公式）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * ポイント配列から統計を計算
 */
export function calculateStats(points: Point[]): TimelineStats {
  if (points.length === 0) {
    return {
      totalPoints: 0,
      totalDistance: 0,
      yearlyBreakdown: [],
      longestTrip: null,
      earthCircumferences: 0,
      moonDistancePercent: 0,
      averagePointsPerDay: 0,
      dateRange: { start: 0, end: 0 },
    };
  }

  // 基本統計
  const totalPoints = points.length;
  let totalDistance = 0;
  let longestTrip: TimelineStats['longestTrip'] = null;
  let maxTripDistance = 0;

  // 年別のデータを集計
  const yearlyData = new Map<number, { points: number; distance: number }>();

  // 日付範囲
  let minTs = Infinity;
  let maxTs = -Infinity;

  // 距離計算とロングトリップ検出
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    // 距離計算
    const dist = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    
    // 異常値フィルタ（1ステップで1000km以上は飛行機移動などとして除外可能、ここでは含める）
    totalDistance += dist;

    // 最長トリップ更新
    if (dist > maxTripDistance) {
      maxTripDistance = dist;
      longestTrip = {
        distance: dist,
        fromLat: prev.lat,
        fromLng: prev.lng,
        toLat: curr.lat,
        toLng: curr.lng,
        date: curr.ts,
      };
    }

    // 年別集計
    const yearData = yearlyData.get(curr.year) || { points: 0, distance: 0 };
    yearData.points += 1;
    yearData.distance += dist;
    yearlyData.set(curr.year, yearData);

    // 日付範囲更新
    if (curr.ts < minTs) minTs = curr.ts;
    if (curr.ts > maxTs) maxTs = curr.ts;
  }

  // 最初のポイントの処理
  const firstPoint = points[0];
  const firstYearData = yearlyData.get(firstPoint.year) || { points: 0, distance: 0 };
  firstYearData.points += 1;
  yearlyData.set(firstPoint.year, firstYearData);
  if (firstPoint.ts < minTs) minTs = firstPoint.ts;
  if (firstPoint.ts > maxTs) maxTs = firstPoint.ts;

  // 年別データをソート
  const yearlyBreakdown = Array.from(yearlyData.entries())
    .map(([year, data]) => ({
      year,
      points: data.points,
      distance: Math.round(data.distance),
    }))
    .sort((a, b) => b.year - a.year);

  // 日数計算
  const daysDiff = Math.max(1, Math.ceil((maxTs - minTs) / (1000 * 60 * 60 * 24)));
  const averagePointsPerDay = totalPoints / daysDiff;

  // 地球周回数と月距離パーセント
  const earthCircumferences = totalDistance / EARTH_CIRCUMFERENCE;
  const moonDistancePercent = (totalDistance / EARTH_MOON_DISTANCE) * 100;

  return {
    totalPoints,
    totalDistance: Math.round(totalDistance),
    yearlyBreakdown,
    longestTrip: longestTrip ? {
      ...longestTrip,
      distance: Math.round(longestTrip.distance),
    } : null,
    earthCircumferences: Math.round(earthCircumferences * 100) / 100,
    moonDistancePercent: Math.round(moonDistancePercent * 100) / 100,
    averagePointsPerDay: Math.round(averagePointsPerDay * 10) / 10,
    dateRange: {
      start: minTs,
      end: maxTs,
    },
  };
}

/**
 * 距離をフォーマット
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)}km`;
  }
  if (km < 1000) {
    return `${Math.round(km)}km`;
  }
  return `${(km / 1000).toFixed(1)}千km`;
}

/**
 * 大きな数をフォーマット
 */
export function formatLargeNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  if (num < 10000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  if (num < 1000000) {
    return `${Math.round(num / 1000)}K`;
  }
  return `${(num / 1000000).toFixed(1)}M`;
}

/**
 * シェア用テキスト生成
 */
export function generateShareText(stats: TimelineStats, yearRange?: { start: number; end: number }): string {
  const yearText = yearRange
    ? yearRange.start === yearRange.end
      ? `${yearRange.start}年`
      : `${yearRange.start}-${yearRange.end}年`
    : '';

  const lines = [
    yearText ? `${yearText}の移動履歴をタイムライン再生 ▶` : '移動履歴をタイムライン再生 ▶',
    `📍 ${formatLargeNumber(stats.totalPoints)}ポイント`,
    `🚗 ${formatDistance(stats.totalDistance)}移動`,
  ];

  if (stats.earthCircumferences >= 0.1) {
    lines.push(`🌍 地球${stats.earthCircumferences.toFixed(1)}周分`);
  }

  lines.push('');
  lines.push('#TimelineVisualizer #GoogleMap');

  return lines.join('\n');
}
