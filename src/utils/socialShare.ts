/**
 * SNS別シェア処理ユーティリティ
 */

import type { TimelineStats } from '../types';
import { generateShareText } from './statsCalculator';

export type SocialPlatform = 'twitter' | 'facebook' | 'line' | 'instagram' | 'native' | 'copy';

const APP_URL = 'https://gmap-tlvr.vemi.jp';

/**
 * X (Twitter) へシェア
 */
export function shareToTwitter(text: string, url?: string): void {
  // 280文字制限を考慮
  const truncatedText = text.length > 200 
    ? text.slice(0, 197) + '...' 
    : text;
  
  const twitterUrl = new URL('https://twitter.com/intent/tweet');
  twitterUrl.searchParams.set('text', truncatedText);
  if (url) {
    twitterUrl.searchParams.set('url', url);
  }
  
  window.open(twitterUrl.toString(), '_blank', 'width=550,height=420,noopener,noreferrer');
}

/**
 * Facebook へシェア
 */
export function shareToFacebook(url: string): void {
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(fbUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
}

/**
 * LINE へシェア
 */
export function shareToLine(text: string, url?: string): void {
  const fullText = url ? `${text}\n${url}` : text;
  const lineUrl = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(fullText)}`;
  window.open(lineUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Instagram用に画像をダウンロード（直接投稿不可のため）
 */
export async function shareToInstagram(imageBlob: Blob): Promise<boolean> {
  // Web Share APIでファイル共有を試みる（iOSでは成功しやすい）
  if (navigator.share && navigator.canShare) {
    const file = new File([imageBlob], 'timeline-share.jpg', { type: 'image/jpeg' });
    const shareData = { files: [file] };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return false;
        }
      }
    }
  }
  
  // フォールバック：ダウンロード
  downloadImage(imageBlob, 'timeline-share.jpg');
  return true;
}

/**
 * ネイティブシェア（Web Share API）
 */
export async function shareNative(
  title: string,
  text: string,
  url?: string,
  files?: File[]
): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  const shareData: ShareData = {
    title,
    text,
  };

  if (url) {
    shareData.url = url;
  }

  if (files && files.length > 0 && navigator.canShare?.({ files })) {
    shareData.files = files;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return false;
    }
    throw error;
  }
}

/**
 * クリップボードにテキストをコピー
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // フォールバック: execCommand
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * クリップボードに画像をコピー
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const item = new ClipboardItem({
        'image/png': blob.type === 'image/png' ? blob : await convertToImage(blob, 'png'),
      });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * 画像をダウンロード
 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 画像フォーマット変換
 */
async function convertToImage(blob: Blob, format: 'png' | 'jpeg'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (newBlob) => {
          if (newBlob) {
            resolve(newBlob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        0.92
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Web Share APIが使用可能かチェック
 */
export function canUseNativeShare(): boolean {
  return typeof navigator.share === 'function';
}

/**
 * ファイル共有が可能かチェック
 */
export function canShareFiles(): boolean {
  if (!navigator.canShare) return false;
  try {
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * シェアURLを生成（ディープリンク対応）
 */
export function generateShareUrl(params?: {
  year?: string;
  theme?: string;
  demo?: boolean;
}): string {
  const url = new URL(APP_URL);
  
  if (params?.year) {
    url.searchParams.set('year', params.year);
  }
  if (params?.theme && params.theme !== 'light') {
    url.searchParams.set('theme', params.theme);
  }
  if (params?.demo) {
    url.searchParams.set('demo', 'true');
  }
  
  return url.toString();
}

/**
 * 統計情報からシェアデータを生成
 */
export function createShareContent(
  stats: TimelineStats,
  yearRange?: { start: number; end: number }
): {
  title: string;
  text: string;
  url: string;
  hashtags: string[];
} {
  const yearText = yearRange
    ? yearRange.start === yearRange.end
      ? `${yearRange.start}`
      : `${yearRange.start}-${yearRange.end}`
    : '';

  return {
    title: `Timeline Visualizer - ${yearText ? yearText + '年の' : ''}移動履歴`,
    text: generateShareText(stats, yearRange),
    url: generateShareUrl({
      year: yearText,
      demo: false,
    }),
    hashtags: ['TimelineVisualizer', 'GoogleMap', 'タイムライン可視化'],
  };
}

/**
 * プラットフォーム別アイコンと色
 */
export const SOCIAL_PLATFORMS = {
  twitter: {
    name: 'X (Twitter)',
    icon: '𝕏',
    color: '#000000',
    bgColor: '#f5f5f5',
  },
  facebook: {
    name: 'Facebook',
    icon: 'f',
    color: '#1877f2',
    bgColor: '#e7f3ff',
  },
  line: {
    name: 'LINE',
    icon: '💬',
    color: '#00b900',
    bgColor: '#e6ffe6',
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: '#e4405f',
    bgColor: '#fce4ec',
  },
  native: {
    name: 'その他',
    icon: '📤',
    color: '#6366f1',
    bgColor: '#eef2ff',
  },
  copy: {
    name: 'コピー',
    icon: '📋',
    color: '#64748b',
    bgColor: '#f1f5f9',
  },
} as const;
