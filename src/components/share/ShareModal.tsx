/**
 * リッチシェアモーダル（モバイル最適化版）
 */

import React, { useState, useEffect, useCallback, RefObject } from 'react';
import { ChevronDown, Download, Check, Loader2, Image as ImageIcon, AlertTriangle, Shield, RefreshCw, ExternalLink, Copy, Share2 } from 'lucide-react';
import type { Point, MapTheme, TimelineStats, PrivacyLevelId } from '../../types';
import { generateShareImage, downloadShareImage } from '../../utils/shareImageGenerator';
import { captureMapForShare } from '../../utils/mapCapture';
import { 
  shareToTwitter, 
  shareToFacebook, 
  shareToLine, 
  shareNative,
  copyToClipboard,
  canUseNativeShare,
  canShareFiles,
  generateShareUrl,
} from '../../utils/socialShare';
import { generateShareText } from '../../utils/statsCalculator';
import { obfuscatePoints, PRIVACY_LEVELS, getPrivacyLevelById } from '../../utils/privacyObfuscator';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: Point[];
  stats: TimelineStats;
  yearRange: { start: number; end: number };
  mapTheme: MapTheme;
  privacyLevel: PrivacyLevelId;
  mapContainerRef?: RefObject<HTMLDivElement | null>;
}

// シェア用の推奨プライバシーレベル
const SHARE_MIN_PRIVACY_LEVEL = 'low';

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  points,
  stats,
  yearRange,
  mapTheme,
  privacyLevel,
  mapContainerRef,
}) => {
  const [shareImage, setShareImage] = useState<Blob | null>(null);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareText, setShareText] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [sharePrivacyLevel, setSharePrivacyLevel] = useState<PrivacyLevelId>(
    privacyLevel === 'none' ? SHARE_MIN_PRIVACY_LEVEL : privacyLevel
  );
  const [acknowledgedPrivacy, setAcknowledgedPrivacy] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const useMapCapture = true;

  const currentSharePrivacy = getPrivacyLevelById(sharePrivacyLevel);
  const isPrivacyApplied = sharePrivacyLevel !== 'none';

  // 初期化
  useEffect(() => {
    if (isOpen) {
      setShareText(generateShareText(stats, yearRange));
      setSharePrivacyLevel(privacyLevel === 'none' ? SHARE_MIN_PRIVACY_LEVEL : privacyLevel);
      setAcknowledgedPrivacy(false);
      setShowTextEditor(false);
    }
  }, [isOpen, stats, yearRange, privacyLevel]);

  // 画像生成
  const generateImage = useCallback(async () => {
    if (!isOpen || points.length === 0) return;
    
    setIsGenerating(true);
    if (shareImageUrl) {
      URL.revokeObjectURL(shareImageUrl);
      setShareImageUrl(null);
    }
    setShareImage(null);
    
    try {
      let blob: Blob;
      
      if (useMapCapture && mapContainerRef?.current) {
        try {
          blob = await captureMapForShare({
            mapContainer: mapContainerRef.current,
            stats,
            yearRange,
            isDarkTheme: mapTheme === 'dark' || mapTheme === 'satellite',
          });
        } catch {
          const privacyData = getPrivacyLevelById(sharePrivacyLevel);
          const obfuscatedPoints = obfuscatePoints(points, privacyData?.gridSize ?? 0);
          blob = await generateShareImage({
            points: obfuscatedPoints,
            stats,
            yearRange,
            mapTheme,
            privacyLevel: sharePrivacyLevel,
          });
        }
      } else {
        const privacyData = getPrivacyLevelById(sharePrivacyLevel);
        const obfuscatedPoints = obfuscatePoints(points, privacyData?.gridSize ?? 0);
        blob = await generateShareImage({
          points: obfuscatedPoints,
          stats,
          yearRange,
          mapTheme,
          privacyLevel: sharePrivacyLevel,
        });
      }
      
      setShareImage(blob);
      setShareImageUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Failed to generate share image:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [isOpen, points, stats, yearRange, mapTheme, sharePrivacyLevel, useMapCapture, mapContainerRef]);

  useEffect(() => {
    if (isOpen && points.length > 0) {
      // 少し遅延を入れてモーダルの表示とマップのレンダリングが安定するのを待つ
      const timer = setTimeout(() => {
        generateImage();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, sharePrivacyLevel]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (shareImageUrl) URL.revokeObjectURL(shareImageUrl);
    };
  }, [shareImageUrl]);

  useEffect(() => {
    if (!isOpen) {
      setShareImage(null);
      if (shareImageUrl) {
        URL.revokeObjectURL(shareImageUrl);
        setShareImageUrl(null);
      }
      setCopied(false);
      setShareSuccess(null);
    }
  }, [isOpen]);

  const showSuccessMessage = useCallback((platform: string) => {
    setShareSuccess(platform);
    setTimeout(() => setShareSuccess(null), 2000);
  }, []);

  const handleTwitterShare = useCallback(() => {
    shareToTwitter(shareText, generateShareUrl());
    showSuccessMessage('twitter');
  }, [shareText, showSuccessMessage]);

  const handleFacebookShare = useCallback(() => {
    shareToFacebook(generateShareUrl());
    showSuccessMessage('facebook');
  }, [showSuccessMessage]);

  const handleLineShare = useCallback(() => {
    shareToLine(shareText, generateShareUrl());
    showSuccessMessage('line');
  }, [shareText, showSuccessMessage]);

  const handleNativeShare = useCallback(async () => {
    if (!canUseNativeShare()) return;
    const files: File[] = [];
    if (shareImage && canShareFiles()) {
      files.push(new File([shareImage], 'timeline-share.jpg', { type: 'image/jpeg' }));
    }
    const success = await shareNative('Timeline Visualizer', shareText, generateShareUrl(), files);
    if (success) showSuccessMessage('native');
  }, [shareImage, shareText, showSuccessMessage]);

  const handleCopyText = useCallback(async () => {
    const success = await copyToClipboard(`${shareText}\n\n${generateShareUrl()}`);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  const handleDownloadImage = useCallback(() => {
    if (shareImage) downloadShareImage(shareImage);
  }, [shareImage]);

  if (!isOpen) return null;

  const canShare = acknowledgedPrivacy;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 flex items-end sm:items-center justify-center animate-in fade-in backdrop-blur-md">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal - モバイルではボトムシート風 */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-[2rem] rounded-t-[1.5rem] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-slideUp">
        
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 py-3 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 size={18} />
              <span className="font-bold text-sm">シェア</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <div className="p-3 sm:p-4 space-y-3">
            
            {/* プレビュー画像（コンパクト） */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden aspect-[1200/630] shadow-inner">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="text-xs text-gray-500">生成中...</span>
                </div>
              ) : shareImageUrl ? (
                <>
                  <img src={shareImageUrl} alt="Share preview" className="w-full h-full object-cover" />
                  {isPrivacyApplied && (
                    <div className="absolute top-1.5 right-1.5 bg-blue-500/90 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" />
                      {currentSharePrivacy?.label}
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* 画像アクション（横並びコンパクト） */}
            <div className="flex gap-2">
              <button
                onClick={handleDownloadImage}
                disabled={!shareImage}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-all disabled:opacity-40"
              >
                <Download size={14} />
                保存
              </button>
              <button
                onClick={generateImage}
                disabled={isGenerating}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-all disabled:opacity-40"
              >
                <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                再生成
              </button>
            </div>

            {/* プライバシー設定（コンパクト） */}
            <div className={`rounded-xl p-2.5 border ${
              !isPrivacyApplied 
                ? 'bg-red-50/80 border-red-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {!isPrivacyApplied ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${
                    !isPrivacyApplied ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    位置の丸め
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">
                  {currentSharePrivacy?.description}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {PRIVACY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSharePrivacyLevel(level.id as PrivacyLevelId)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      sharePrivacyLevel === level.id
                        ? level.id === 'none' 
                          ? 'bg-red-500 text-white shadow-sm' 
                          : 'bg-blue-500 text-white shadow-sm'
                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* シェアテキスト（折りたたみ式） */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowTextEditor(!showTextEditor)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700">シェアテキスト</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showTextEditor ? 'rotate-180' : ''}`} />
              </button>
              {showTextEditor && (
                <div className="p-2.5 bg-white border-t border-gray-100">
                  <textarea
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value.slice(0, 500))}
                    className="w-full px-2.5 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs text-gray-800 bg-gray-50"
                    rows={3}
                    maxLength={500}
                  />
                  <p className={`text-[9px] mt-1 ${shareText.length > 280 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {shareText.length}/280 {shareText.length > 280 && '(自動短縮)'}
                  </p>
                </div>
              )}
            </div>

            {/* プライバシー確認 */}
            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
              acknowledgedPrivacy 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <input
                type="checkbox"
                checked={acknowledgedPrivacy}
                onChange={(e) => setAcknowledgedPrivacy(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-green-500 rounded border-gray-300 focus:ring-green-400"
              />
              <span className="text-[10px] leading-relaxed text-gray-600">
                位置情報（軌跡）が含まれることを理解し、自宅・職場等の特定可能な情報がないことを確認しました
              </span>
            </label>

            {/* SNSボタン（リッチでコンパクト） */}
            <div className={`space-y-2 transition-all ${!canShare ? 'opacity-40 pointer-events-none' : ''}`}>
              {/* メインシェアボタン */}
              {canUseNativeShare() && (
                <button
                  onClick={handleNativeShare}
                  disabled={!canShare}
                  className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    shareSuccess === 'native'
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  }`}
                >
                  {shareSuccess === 'native' ? (
                    <><Check size={18} /> 完了</>
                  ) : (
                    <><ExternalLink size={16} /> アプリで共有</>
                  )}
                </button>
              )}

              {/* SNSボタングリッド */}
              <div className="grid grid-cols-4 gap-1.5">
                {/* Twitter/X */}
                <button
                  onClick={handleTwitterShare}
                  disabled={!canShare}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-xl transition-all ${
                    shareSuccess === 'twitter'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {shareSuccess === 'twitter' ? <Check size={18} /> : <span className="text-sm font-black">𝕏</span>}
                  <span className="text-[9px] mt-0.5 font-medium">X</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleFacebookShare}
                  disabled={!canShare}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-xl transition-all ${
                    shareSuccess === 'facebook'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-[#1877f2] hover:bg-[#166fe5] text-white'
                  }`}
                >
                  {shareSuccess === 'facebook' ? <Check size={18} /> : <span className="text-sm font-bold">f</span>}
                  <span className="text-[9px] mt-0.5 font-medium">Facebook</span>
                </button>

                {/* LINE */}
                <button
                  onClick={handleLineShare}
                  disabled={!canShare}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-xl transition-all ${
                    shareSuccess === 'line'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-[#00b900] hover:bg-[#00a000] text-white'
                  }`}
                >
                  {shareSuccess === 'line' ? <Check size={18} /> : <span className="text-sm">💬</span>}
                  <span className="text-[9px] mt-0.5 font-medium">LINE</span>
                </button>

                {/* Copy */}
                <button
                  onClick={handleCopyText}
                  disabled={!canShare}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-xl transition-all ${
                    copied
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={16} />}
                  <span className="text-[9px] mt-0.5 font-medium">{copied ? '完了' : 'コピー'}</span>
                </button>
              </div>
            </div>

            {/* ヒント */}
            {!canShare && (
              <p className="text-[10px] text-amber-600 text-center font-medium">
                ☝️ 上のチェックを入れてシェアを有効化
              </p>
            )}
            <p className="text-[9px] text-gray-400 text-center pb-1">
              💡 画像を保存してInstagram等に投稿できます
            </p>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar & Animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 transparent;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in.fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ShareModal;
