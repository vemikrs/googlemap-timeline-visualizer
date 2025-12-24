import React, { useEffect, useRef, useState } from 'react';
import { Download, Share2, X, Check, Film, Copy } from 'lucide-react';
import { 
  shareToTwitter, 
  shareToLine, 
  copyToClipboard,
  generateShareUrl,
} from '../utils/socialShare';

interface ExportModalProps {
  isOpen: boolean;
  outputBlob: Blob | null;
  format: 'mp4' | 'gif' | 'webm';
  onClose: () => void;
  onDownload: () => void;
  onShare: () => Promise<boolean>;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  outputBlob,
  format,
  onClose,
  onDownload,
  onShare,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (outputBlob) {
      const url = URL.createObjectURL(outputBlob);
      setPreviewUrl(url);

      // Check if Web Share API is available for files
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
        const mimeType = format === 'gif' ? 'image/gif' : format === 'webm' ? 'video/webm' : 'video/mp4';
        const file = new File([outputBlob], `test.${format}`, { type: mimeType });
        setCanShare(navigator.canShare({ files: [file] }));
      }

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [outputBlob, format]);

  useEffect(() => {
    if (shareSuccess) {
      const timer = setTimeout(() => setShareSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [shareSuccess]);

  if (!isOpen || !outputBlob) return null;

  const handleShare = async () => {
    const success = await onShare();
    if (success) {
      setShareSuccess(true);
    }
  };

  const shareUrl = generateShareUrl({ demo: true });
  const shareText = 'タイムラインを動画にしてみた！ #TimelineVisualizer #GoogleMap';

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(`${shareText}\n${shareUrl}`);
    if (success) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    shareToTwitter(shareText, shareUrl);
  };

  const handleShareLine = () => {
    shareToLine(shareText, shareUrl);
  };

  const isVideo = format !== 'gif';

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film size={20} />
              <span className="font-bold">動画が完成しました！</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-4">
            {previewUrl && (
              isVideo ? (
                <video
                  ref={videoRef}
                  src={previewUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Recording preview"
                  className="w-full h-full object-contain"
                />
              )
            )}
          </div>

          {/* File Info */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span>📁</span>
              <span>timeline-recording.{format}</span>
            </div>
            <span className="font-mono text-gray-800 font-medium">
              {formatFileSize(outputBlob.size)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDownload}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              保存
            </button>
            
            {canShare ? (
              <button
                onClick={handleShare}
                disabled={shareSuccess}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  shareSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                }`}
              >
                {shareSuccess ? (
                  <>
                    <Check size={18} />
                    共有完了
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    共有する
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onDownload}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                ダウンロード
              </button>
            )}
          </div>

          {/* Hint for iOS */}
          {canShare && (
            <p className="text-xs text-gray-500 text-center mt-3">
              💡 「共有する」から「ビデオを保存」でカメラロールに保存できます
            </p>
          )}

          {/* SNS Share Buttons */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2 text-center">アプリをシェア</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleShareTwitter}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
              >
                𝕏
              </button>
              <button
                onClick={handleShareLine}
                className="px-3 py-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 text-sm font-medium transition-colors"
              >
                LINE
              </button>
              <button
                onClick={handleCopyUrl}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  copiedUrl 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                {copiedUrl ? 'コピー済' : 'URL'}
              </button>
            </div>
          </div>
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

export default ExportModal;
