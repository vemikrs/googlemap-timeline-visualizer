/**
 * マップキャプチャユーティリティ
 * 録画機能と同じ手法で直接Canvas APIを使用してマップをキャプチャ
 * （html2canvasはCORS制限でタイルを描画できないため使用しない）
 */

import type { TimelineStats } from '../types';
import { formatDistance, formatLargeNumber } from './statsCalculator';

export interface MapCaptureOptions {
  mapContainer: HTMLElement;
  stats: TimelineStats;
  yearRange: { start: number; end: number };
  isDarkTheme?: boolean;
}

/**
 * マップコンテナをキャプチャしてシェア画像を生成
 * 録画機能(useVideoRecorder.ts)と同じアプローチで直接DOMからキャプチャ
 */
export async function captureMapForShare(options: MapCaptureOptions): Promise<Blob> {
  const {
    mapContainer,
    stats,
    yearRange,
    isDarkTheme = false,
  } = options;

  // マップ領域のキャプチャ（録画機能と同じ手法）
  const mapCanvas = await captureMapCanvas(mapContainer, isDarkTheme);

  // 最終的な画像サイズ（OGPサイズ）
  const width = 1200;
  const height = 630;

  // 最終キャンバスを作成
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // テーマに応じた色
  const colors = isDarkTheme
    ? {
        background: '#1a1a2e',
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        cardBg: 'rgba(0, 0, 0, 0.7)',
        overlayGradient: ['rgba(26, 26, 46, 0.3)', 'rgba(26, 26, 46, 0.8)'],
      }
    : {
        background: '#f0f9ff',
        textPrimary: '#1e293b',
        textSecondary: '#64748b',
        cardBg: 'rgba(255, 255, 255, 0.9)',
        overlayGradient: ['rgba(240, 249, 255, 0.2)', 'rgba(240, 249, 255, 0.85)'],
      };

  // 1. 背景
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  // 2. マップ画像を描画（上部に配置）
  const mapAreaHeight = 420;
  const mapAspect = mapCanvas.width / mapCanvas.height;
  const targetAspect = width / mapAreaHeight;

  let srcX = 0, srcY = 0, srcW = mapCanvas.width, srcH = mapCanvas.height;

  if (mapAspect > targetAspect) {
    // マップが横長 → 左右をクロップ
    srcW = mapCanvas.height * targetAspect;
    srcX = (mapCanvas.width - srcW) / 2;
  } else {
    // マップが縦長 → 上下をクロップ
    srcH = mapCanvas.width / targetAspect;
    srcY = (mapCanvas.height - srcH) / 2;
  }

  ctx.drawImage(mapCanvas, srcX, srcY, srcW, srcH, 0, 0, width, mapAreaHeight);

  // 3. グラデーションオーバーレイ（下部にかけて）
  const gradient = ctx.createLinearGradient(0, mapAreaHeight - 150, 0, mapAreaHeight);
  gradient.addColorStop(0, colors.overlayGradient[0]);
  gradient.addColorStop(1, colors.overlayGradient[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, mapAreaHeight - 150, width, 150);

  // 4. 下部の統計エリア背景
  ctx.fillStyle = colors.cardBg;
  ctx.fillRect(0, mapAreaHeight, width, height - mapAreaHeight);

  // 5. ヘッダー（左上に半透明背景付き）
  const yearText = yearRange.start === yearRange.end
    ? `${yearRange.start}`
    : `${yearRange.start} - ${yearRange.end}`;
  
  ctx.fillStyle = colors.cardBg;
  roundRect(ctx, 20, 20, 320, 50, 12);
  ctx.fill();
  
  ctx.fillStyle = colors.textPrimary;
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`My Timeline ${yearText}`, 35, 54);

  // 6. 統計カード
  const cardY = mapAreaHeight + 25;
  const cardHeight = 130;
  const cardWidth = 350;
  const cardGap = 25;
  const startX = (width - (cardWidth * 3 + cardGap * 2)) / 2;

  const statsData = [
    { icon: '📍', value: formatLargeNumber(stats.totalPoints), label: 'ポイント' },
    { icon: '🚗', value: formatDistance(stats.totalDistance), label: '移動距離' },
    { icon: '🌍', value: stats.earthCircumferences.toFixed(2), label: '地球周' },
  ];

  for (let i = 0; i < statsData.length; i++) {
    const stat = statsData[i];
    const x = startX + i * (cardWidth + cardGap);
    
    // カード背景（より目立つ）
    ctx.fillStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    roundRect(ctx, x, cardY, cardWidth, cardHeight, 16);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // アイコン
    ctx.font = '32px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(stat.icon, x + cardWidth / 2, cardY + 40);
    
    // 値
    ctx.font = 'bold 36px system-ui';
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText(stat.value, x + cardWidth / 2, cardY + 85);
    
    // ラベル
    ctx.font = '14px system-ui';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(stat.label, x + cardWidth / 2, cardY + 110);
  }

  // 8. フッター
  ctx.font = 'bold 16px system-ui';
  ctx.fillStyle = colors.textSecondary;
  ctx.textAlign = 'right';
  ctx.fillText('Timeline Visualizer by VEMI.jp', width - 30, height - 15);

  ctx.font = '13px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('gmap-tlvr.vemi.jp', 30, height - 15);

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
 * マップコンテナを直接Canvasにキャプチャ
 * useVideoRecorder.tsのcaptureFrame()と同じロジック
 */
async function captureMapCanvas(
  target: HTMLElement,
  isDarkTheme: boolean
): Promise<HTMLCanvasElement> {
  // マップ自体の要素を直接取得（モーダルに隠れないように）
  const mapElement = target.querySelector('.leaflet-container') as HTMLElement || target;
  const rect = mapElement.getBoundingClientRect();
  const resolution = 2; // 高解像度キャプチャ

  // Canvas作成
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(rect.width * resolution / 2) * 2;
  canvas.height = Math.floor(rect.height * resolution / 2) * 2;
  const ctx = canvas.getContext('2d')!;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // 背景色
  ctx.fillStyle = isDarkTheme ? '#1a1a2e' : '#e8f4f8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. タイル画像を描画（mapElement内から検索）
  const tilePane = mapElement.querySelector('.leaflet-tile-pane');
  const tileImages = tilePane ? tilePane.querySelectorAll('img') : [];
  let tileDrawn = false;

  for (const img of Array.from(tileImages)) {
    const imgEl = img as HTMLImageElement;
    if (imgEl.complete && imgEl.naturalWidth > 0 && imgEl.style.display !== 'none') {
      try {
        const imgRect = imgEl.getBoundingClientRect();
        const x = (imgRect.left - rect.left) * scaleX;
        const y = (imgRect.top - rect.top) * scaleY;
        const w = imgRect.width * scaleX;
        const h = imgRect.height * scaleY;
        ctx.drawImage(imgEl, x, y, w, h);
        tileDrawn = true;
      } catch {
        // CORSエラーはスキップ
      }
    }
  }

  // タイルなしの場合のフォールバック
  if (!tileDrawn) {
    ctx.strokeStyle = isDarkTheme ? '#2a2a4e' : '#d0e8f0';
    ctx.lineWidth = 1;
    const gridSize = 50 * scaleX;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  // 2. Leaflet canvas（ポリラインなど）を描画
  const overlayPane = mapElement.querySelector('.leaflet-overlay-pane');
  const leafletCanvases = overlayPane ? overlayPane.querySelectorAll('canvas') : [];

  for (const leafletCanvas of Array.from(leafletCanvases)) {
    const canvasEl = leafletCanvas as HTMLCanvasElement;
    try {
      if (canvasEl.width > 0 && canvasEl.height > 0) {
        const canvasRect = canvasEl.getBoundingClientRect();
        const x = (canvasRect.left - rect.left) * scaleX;
        const y = (canvasRect.top - rect.top) * scaleY;
        const w = canvasRect.width * scaleX;
        const h = canvasRect.height * scaleY;
        ctx.drawImage(canvasEl, x, y, w, h);
      }
    } catch {
      // エラーはスキップ
    }
  }

  // 3. divIconマーカー（現在地マーカー）を手動で描画
  const markerPane = mapElement.querySelector('.leaflet-marker-pane');
  const divIcons = markerPane ? markerPane.querySelectorAll('.custom-div-icon') : [];
  for (const divIcon of Array.from(divIcons)) {
    const divEl = divIcon as HTMLElement;
    const divRect = divEl.getBoundingClientRect();
    const cx = (divRect.left - rect.left + divRect.width / 2) * scaleX;
    const cy = (divRect.top - rect.top + divRect.height / 2) * scaleY;
    const radius = (divRect.width / 2) * scaleX;

    // 外側の光彩効果
    ctx.save();
    ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
    ctx.shadowBlur = 20 * scaleX;

    // 白い枠線
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2 * scaleX, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // 青い円
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2 * scaleX, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.restore();
  }

  // 4. imgマーカー（その他のマーカー）を描画
  if (markerPane) {
    const markers = markerPane.querySelectorAll('img');
    for (const marker of Array.from(markers)) {
      const markerEl = marker as HTMLImageElement;
      if (markerEl.complete && markerEl.naturalWidth > 0) {
        try {
          const markerRect = markerEl.getBoundingClientRect();
          const x = (markerRect.left - rect.left) * scaleX;
          const y = (markerRect.top - rect.top) * scaleY;
          const w = markerRect.width * scaleX;
          const h = markerRect.height * scaleY;
          ctx.drawImage(markerEl, x, y, w, h);
        } catch {
          // CORSエラーはスキップ
        }
      }
    }
  }

  return canvas;
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
