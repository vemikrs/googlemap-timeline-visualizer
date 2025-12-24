/**
 * シェア画像生成ユーティリティ
 * クライアントサイドでOGP風の画像を生成
 */

import type { Point, MapTheme, TimelineStats, PrivacyLevelId } from '../types';
import { formatDistance, formatLargeNumber } from './statsCalculator';
import { getPrivacyLevelById } from './privacyObfuscator';

export interface ShareImageOptions {
  points: Point[];
  stats: TimelineStats;
  yearRange: { start: number; end: number };
  mapTheme: MapTheme;
  width?: number;
  height?: number;
  privacyLevel?: PrivacyLevelId;
}

/**
 * ポイントを画像座標に変換
 */
function projectPoints(
  points: Point[],
  width: number,
  height: number,
  padding: number
): { x: number; y: number }[] {
  if (points.length === 0) return [];

  // バウンディングボックス計算
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }

  // パディングを考慮した描画領域
  const drawWidth = width - padding * 2;
  const drawHeight = height - padding * 2;

  // アスペクト比を維持しながらスケール計算
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  const scale = Math.min(drawWidth / lngRange, drawHeight / latRange);

  // 中央揃え用オフセット
  const offsetX = (drawWidth - lngRange * scale) / 2 + padding;
  const offsetY = (drawHeight - latRange * scale) / 2 + padding;

  return points.map(p => ({
    x: (p.lng - minLng) * scale + offsetX,
    y: drawHeight - (p.lat - minLat) * scale + offsetY, // Y軸反転
  }));
}

/**
 * テーマに応じた色を取得
 */
function getThemeColors(theme: MapTheme): {
  background: string;
  gradientStart: string;
  gradientEnd: string;
  lineColor: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
} {
  switch (theme) {
    case 'dark':
      return {
        background: '#1a1a2e',
        gradientStart: '#16213e',
        gradientEnd: '#0f3460',
        lineColor: '#3b82f6',
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        cardBg: 'rgba(255, 255, 255, 0.1)',
      };
    case 'satellite':
      return {
        background: '#1e3a5f',
        gradientStart: '#0d1b2a',
        gradientEnd: '#1b263b',
        lineColor: '#60a5fa',
        textPrimary: '#ffffff',
        textSecondary: '#a5b4fc',
        cardBg: 'rgba(255, 255, 255, 0.15)',
      };
    default: // light
      return {
        background: '#f0f9ff',
        gradientStart: '#dbeafe',
        gradientEnd: '#e0e7ff',
        lineColor: '#3b82f6',
        textPrimary: '#1e293b',
        textSecondary: '#64748b',
        cardBg: 'rgba(255, 255, 255, 0.9)',
      };
  }
}

/**
 * シェア画像を生成
 */
export async function generateShareImage(options: ShareImageOptions): Promise<Blob> {
  const {
    points,
    stats,
    yearRange,
    mapTheme,
    width = 1200,
    height = 630,
    privacyLevel = 'none',
  } = options;

  const privacyData = getPrivacyLevelById(privacyLevel);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const colors = getThemeColors(mapTheme);

  // 1. 背景グラデーション
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, colors.gradientStart);
  bgGradient.addColorStop(1, colors.gradientEnd);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. 装飾的なグリッド
  ctx.strokeStyle = mapTheme === 'light' 
    ? 'rgba(59, 130, 246, 0.1)' 
    : 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. マップエリア（ルート描画）
  const mapAreaY = 80;
  const mapAreaHeight = 340;
  const padding = 80;

  // ルートを描画
  if (points.length > 0) {
    const projected = projectPoints(points, width, mapAreaHeight, padding);
    
    // グロー効果
    ctx.shadowColor = colors.lineColor;
    ctx.shadowBlur = 20;
    
    // メインライン
    ctx.strokeStyle = colors.lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    const sampledPoints = projected.filter((_, i) => i % Math.max(1, Math.floor(projected.length / 500)) === 0);
    
    for (let i = 0; i < sampledPoints.length; i++) {
      const p = sampledPoints[i];
      const y = p.y + mapAreaY;
      if (i === 0) {
        ctx.moveTo(p.x, y);
      } else {
        ctx.lineTo(p.x, y);
      }
    }
    ctx.stroke();
    
    // シャドウリセット
    ctx.shadowBlur = 0;

    // 始点・終点マーカー
    if (sampledPoints.length > 0) {
      const start = sampledPoints[0];
      const end = sampledPoints[sampledPoints.length - 1];
      
      // 始点（緑）
      ctx.beginPath();
      ctx.arc(start.x, start.y + mapAreaY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 終点（青）
      ctx.beginPath();
      ctx.arc(end.x, end.y + mapAreaY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  // 4. ヘッダー
  ctx.fillStyle = colors.textPrimary;
  ctx.font = 'bold 32px system-ui, sans-serif';
  ctx.textAlign = 'left';
  
  const yearText = yearRange.start === yearRange.end
    ? `${yearRange.start}`
    : `${yearRange.start} - ${yearRange.end}`;
  
  ctx.fillText(`My Timeline ${yearText}`, 40, 55);

  // 5. 統計カード
  const cardY = mapAreaY + mapAreaHeight + 30;
  const cardHeight = 140;
  const cardWidth = 340;
  const cardGap = 30;
  const startX = (width - (cardWidth * 3 + cardGap * 2)) / 2;

  const statsData = [
    { icon: '📍', value: formatLargeNumber(stats.totalPoints), label: 'ポイント' },
    { icon: '🚗', value: formatDistance(stats.totalDistance), label: '移動距離' },
    { icon: '🌍', value: stats.earthCircumferences.toFixed(2), label: '地球周' },
  ];

  for (let i = 0; i < statsData.length; i++) {
    const stat = statsData[i];
    const x = startX + i * (cardWidth + cardGap);
    
    // カード背景
    ctx.fillStyle = colors.cardBg;
    ctx.beginPath();
    roundRect(ctx, x, cardY, cardWidth, cardHeight, 16);
    ctx.fill();
    
    // アイコン
    ctx.font = '36px system-ui';
    ctx.fillStyle = colors.textPrimary;
    ctx.textAlign = 'center';
    ctx.fillText(stat.icon, x + cardWidth / 2, cardY + 45);
    
    // 値
    ctx.font = 'bold 32px system-ui';
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText(stat.value, x + cardWidth / 2, cardY + 90);
    
    // ラベル
    ctx.font = '16px system-ui';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(stat.label, x + cardWidth / 2, cardY + 120);
  }

  // 6. プライバシーバッジ（適用時のみ）
  if (privacyLevel !== 'none' && privacyData) {
    const badgeText = `🔒 ${privacyData.label}（${privacyData.description}）`;
    ctx.font = '14px system-ui';
    const badgeWidth = ctx.measureText(badgeText).width + 24;
    const badgeHeight = 28;
    const badgeX = width - badgeWidth - 40;
    const badgeY = 20;
    
    // バッジ背景
    ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.beginPath();
    roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 14);
    ctx.fill();
    
    // バッジテキスト
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + 19);
  }

  // 7. フッターブランディング
  ctx.font = 'bold 18px system-ui';
  ctx.fillStyle = colors.textSecondary;
  ctx.textAlign = 'right';
  ctx.fillText('Timeline Visualizer by VEMI.jp', width - 40, height - 25);

  // 8. URL
  ctx.font = '14px system-ui';
  ctx.fillStyle = colors.textSecondary;
  ctx.textAlign = 'left';
  ctx.fillText('gmap-tlvr.vemi.jp', 40, height - 25);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      },
      'image/jpeg',
      0.92
    );
  });
}

/**
 * 角丸矩形を描画
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * シェア画像をダウンロード
 */
export function downloadShareImage(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `timeline-share-${new Date().toISOString().slice(0, 10)}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
