import React from 'react';
import { Download, X, Loader2, Package, Clock, Play, Monitor, ShieldCheck } from 'lucide-react';
import { ESTIMATED_DOWNLOAD_SIZE_MB } from '../utils/ffmpegCache';

interface FFmpegDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDownloading: boolean;
  downloadProgress: number;
  phase: 'confirm' | 'downloading' | 'initializing';
}

const FFmpegDownloadModal: React.FC<FFmpegDownloadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDownloading,
  downloadProgress,
  phase,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isDownloading ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download size={20} />
              <span className="font-bold">録画機能の準備</span>
            </div>
            {!isDownloading && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {phase === 'confirm' && (
            <>
              <p className="text-gray-700 mb-4">
                録画機能を使用するには、追加アセットのダウンロードが必要です。
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package size={14} className="text-gray-500" />
                  <span className="text-gray-500">ダウンロードサイズ:</span>
                  <span className="font-bold text-gray-800">約 {ESTIMATED_DOWNLOAD_SIZE_MB} MB</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-gray-500" />
                  <span className="text-gray-500">推定時間:</span>
                  <span className="font-bold text-gray-800">10〜30秒</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Play size={12} className="flex-shrink-0" />
                  <span>準備ができたら自動で録画スタート！</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <Monitor size={12} className="flex-shrink-0" />
                  <span>マップ上の位置表示内容のみを録画します</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <ShieldCheck size={12} className="flex-shrink-0" />
                  <span>すべてお使いの端末内で処理、データ送信なし</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  ダウンロード
                </button>
              </div>
            </>
          )}

          {(phase === 'downloading' || phase === 'initializing') && (
            <>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 size={24} className="animate-spin text-red-500" />
                <span className="text-gray-700 font-medium">
                  {phase === 'downloading' ? '録画エンジンをダウンロード中...' : '初期化中...'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>

              <div className="text-center text-sm text-gray-500">
                {downloadProgress}%
                {phase === 'downloading' && (
                  <span className="ml-2">
                    ({Math.round(ESTIMATED_DOWNLOAD_SIZE_MB * downloadProgress / 100)} / {ESTIMATED_DOWNLOAD_SIZE_MB} MB)
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FFmpegDownloadModal;
