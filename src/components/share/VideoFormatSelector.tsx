/**
 * 動画フォーマット選択コンポーネント
 */

import React from 'react';
import type { AspectRatio, VideoQuality } from '../../types';

interface VideoFormatSelectorProps {
  aspectRatio: AspectRatio;
  quality: VideoQuality;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onQualityChange: (quality: VideoQuality) => void;
}

const ASPECT_RATIO_OPTIONS: {
  id: AspectRatio;
  label: string;
  icon: string;
  hint: string;
  width: number;
  height: number;
}[] = [
  { id: '16:9', label: '横型', icon: '🖥️', hint: 'YouTube, Twitter', width: 1920, height: 1080 },
  { id: '9:16', label: '縦型', icon: '📱', hint: 'Reels, TikTok, Shorts', width: 1080, height: 1920 },
  { id: '1:1', label: '正方形', icon: '⬜', hint: 'Instagram投稿', width: 1080, height: 1080 },
];

const QUALITY_OPTIONS: {
  id: VideoQuality;
  label: string;
  hint: string;
  resolution: number;
}[] = [
  { id: 'low', label: '低', hint: '速い・軽い', resolution: 0.4 },
  { id: 'medium', label: '中', hint: 'バランス', resolution: 0.6 },
  { id: 'high', label: '高', hint: '高画質', resolution: 0.8 },
];

const VideoFormatSelector: React.FC<VideoFormatSelectorProps> = ({
  aspectRatio,
  quality,
  onAspectRatioChange,
  onQualityChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Aspect Ratio Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          アスペクト比
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ASPECT_RATIO_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onAspectRatioChange(option.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all border-2 ${
                aspectRatio === option.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-transparent bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="text-2xl mb-1">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs text-gray-500">{option.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          画質
        </label>
        <div className="grid grid-cols-3 gap-2">
          {QUALITY_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onQualityChange(option.id)}
              className={`px-4 py-2 rounded-xl transition-all border-2 ${
                quality === option.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-transparent bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
              <span className="block text-xs text-gray-500">{option.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
        <p>
          <span className="font-medium">出力サイズ:</span>{' '}
          {ASPECT_RATIO_OPTIONS.find((o) => o.id === aspectRatio)?.width}×
          {ASPECT_RATIO_OPTIONS.find((o) => o.id === aspectRatio)?.height}
          {' '}({QUALITY_OPTIONS.find((o) => o.id === quality)?.label}画質)
        </p>
      </div>
    </div>
  );
};

export default VideoFormatSelector;

/**
 * アスペクト比から解像度を計算
 */
export function getResolutionFromAspectRatio(
  aspectRatio: AspectRatio,
  quality: VideoQuality,
  baseWidth = 1920
): { width: number; height: number } {
  const qualityMultiplier = {
    low: 0.5,
    medium: 0.75,
    high: 1,
  }[quality];

  let width: number;
  let height: number;

  switch (aspectRatio) {
    case '9:16':
      width = Math.round(baseWidth * 0.5625 * qualityMultiplier); // 1080 at full
      height = Math.round(baseWidth * qualityMultiplier);
      break;
    case '1:1':
      width = Math.round(baseWidth * 0.5625 * qualityMultiplier); // 1080 at full
      height = width;
      break;
    default: // 16:9
      width = Math.round(baseWidth * qualityMultiplier);
      height = Math.round(baseWidth * 0.5625 * qualityMultiplier);
  }

  // 偶数に丸める（H.264要件）
  return {
    width: Math.floor(width / 2) * 2,
    height: Math.floor(height / 2) * 2,
  };
}

/**
 * 録画フレーム用の解像度を取得
 */
export function getRecordingResolution(
  _aspectRatio: AspectRatio,
  quality: VideoQuality
): number {
  const qualityMap = {
    low: 0.4,
    medium: 0.6,
    high: 0.8,
  };
  return qualityMap[quality];
}
