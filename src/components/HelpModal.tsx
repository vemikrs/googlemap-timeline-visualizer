import React, { useState } from 'react';
import { ChevronDown, Github, FileText, Shield, Scale, ExternalLink, Twitter, ChevronRight, FileSearch, Bug } from 'lucide-react';
import LegalModal from './LegalModal';

type LegalPage = 'terms' | 'privacy' | 'license';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiagnostics?: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onOpenDiagnostics,
}) => {
  const [legalPage, setLegalPage] = useState<LegalPage | null>(null);
  
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className="absolute inset-0 z-[2000] bg-black/40 flex items-center justify-center p-3 sm:p-6 animate-in fade-in backdrop-blur-md"
        onClick={handleBackdropClick}
      >
        <div className="bg-white w-full max-w-sm rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          {/* Fixed Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-black text-lg sm:text-xl text-gray-800">ヘルプ</h2>
            <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 px-5 py-4 custom-scrollbar">
            <div className="space-y-4 text-sm font-medium">
            
              {/* Troubleshooting Section */}
              <div className="space-y-2">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                  トラブルシューティング
                </label>
                <div className="space-y-1.5">
                  {onOpenDiagnostics && (
                    <button
                      onClick={onOpenDiagnostics}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl transition-colors group text-left border border-orange-100"
                    >
                      <FileSearch size={16} className="text-orange-500" />
                      <div className="flex-1">
                        <span className="block text-xs font-bold text-gray-700">データ診断ツール</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">
                          エラー時の匿名レポート生成
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-orange-300 group-hover:text-orange-500" />
                    </button>
                  )}
                  <a
                    href="https://github.com/vemikrs/googlemap-timeline-visualizer/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group text-left"
                  >
                    <Bug size={16} className="text-gray-400 group-hover:text-blue-500" />
                    <div className="flex-1">
                      <span className="block text-xs font-bold text-gray-700">バグ報告・機能要望</span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">
                        GitHub Issues
                      </span>
                    </div>
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-blue-400" />
                  </a>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-2">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                  このアプリについて
                </label>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <p className="text-gray-600 text-xs leading-relaxed mb-3">
                    Google Maps タイムラインのデータを可視化し、移動履歴をアニメーションで再生できるWebアプリです。
                  </p>
                  <a
                    href="https://github.com/vemikrs/googlemap-timeline-visualizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Github size={18} />
                    <span className="text-xs font-bold">GitHub で公開中</span>
                    <ExternalLink size={12} className="text-gray-400" />
                  </a>
                </div>
              </div>

              {/* Legal Links - Now opens in-app */}
              <div className="space-y-2">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                  法的情報
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setLegalPage('terms')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group text-left"
                  >
                    <FileText size={16} className="text-gray-400 group-hover:text-blue-500" />
                    <span className="flex-1 text-xs font-bold text-gray-700">利用規約</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400" />
                  </button>
                  <button
                    onClick={() => setLegalPage('privacy')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group text-left"
                  >
                    <Shield size={16} className="text-gray-400 group-hover:text-blue-500" />
                    <span className="flex-1 text-xs font-bold text-gray-700">プライバシーポリシー</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400" />
                  </button>
                  <button
                    onClick={() => setLegalPage('license')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group text-left"
                  >
                    <Scale size={16} className="text-gray-400 group-hover:text-blue-500" />
                    <span className="flex-1 text-xs font-bold text-gray-700">ライセンス情報</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400" />
                  </button>
                </div>
              </div>

              {/* Developer Section - Subtle */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {__BUILD_INFO__}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]">Developed by</span>
                    <a
                      href="https://twitter.com/vemikrs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] hover:text-blue-500 transition-colors"
                    >
                      <Twitter size={12} />
                      <span>@vemikrs</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Custom Scrollbar Styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3b82f6 0%, #6366f1 100%);
            border-radius: 10px;
            border: 2px solid white;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2563eb 0%, #4f46e5 100%);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 transparent;
          }
        `}</style>
      </div>

      {/* Legal Page Modal */}
      <LegalModal
        isOpen={legalPage !== null}
        page={legalPage || 'terms'}
        onClose={() => setLegalPage(null)}
      />
    </>
  );
};

export default HelpModal;
