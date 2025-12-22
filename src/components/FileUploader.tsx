import React from 'react';
import { Upload, AlertCircle, HelpCircle, Play } from 'lucide-react';

interface FileUploaderProps {
  isProcessing: boolean;
  progress: number;
  errorMsg: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenHelp?: () => void;
  onLoadDemo?: () => void;
  isDemoLoading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  isProcessing,
  progress,
  errorMsg,
  onFileUpload,
  onOpenHelp,
  onLoadDemo,
  isDemoLoading,
}) => {
  return (
    <>
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-2 animate-in fade-in">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-500 font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-4 sm:py-6 gap-3 sm:gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
          <Upload size={32} className="sm:hidden" />
          <Upload size={36} className="hidden sm:block" />
        </div>
        <div className="text-center px-2">
          <h3 className="font-black text-xl sm:text-2xl text-gray-800 tracking-tight">Timeline Visualizer</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Google Mapタイムラインデータを可視化</p>
          
          {/* Export Instructions */}
          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-blue-700">📍 データのエクスポート方法</p>
              <a 
                href="https://support.google.com/maps/answer/6258979?hl=ja" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-blue-500 underline hover:text-blue-700"
              >
                公式ヘルプ ↗
              </a>
            </div>
            
            <div className="space-y-2">
              <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-700 mb-1">📱 スマホアプリから</p>
                <ol className="text-[10px] text-gray-600 space-y-0.5 list-decimal list-inside leading-relaxed">
                  <li>Googleマップアプリを開く</li>
                  <li><span className="font-bold bg-gray-100 px-0.5 rounded">プロフィール</span> → <span className="font-bold bg-gray-100 px-0.5 rounded">設定</span></li>
                  <li><span className="font-bold bg-gray-100 px-0.5 rounded">個人的なコンテンツ</span> → <span className="font-bold bg-gray-100 px-0.5 rounded">タイムライン データをエクスポート</span></li>
                  <li>保存された <span className="font-bold text-blue-600">location-history.json</span> を選択</li>
                </ol>
              </div>
            </div>
          </div>
          
          {/* Privacy Notice */}
          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-[10px] text-green-700 font-semibold">
              🔒 位置情報はブラウザ内でのみ処理、サーバーには送信されません
            </p>
          </div>
        </div>
        <label className="w-full">
          <input 
            type="file" 
            accept=".json,.geojson" 
            onChange={onFileUpload} 
            className="hidden" 
            disabled={isProcessing || isDemoLoading} 
          />
          <div className={`w-full font-black py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base ${
            isProcessing || isDemoLoading
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-blue-500 text-white shadow-blue-200'
          }`}>
            {isProcessing ? <span>解析中 {progress}%</span> : isDemoLoading ? <span>デモデータ読込中...</span> : 'ファイルを選択'}
          </div>
        </label>
        
        {/* Demo Button */}
        {onLoadDemo && (
          <button
            onClick={onLoadDemo}
            disabled={isProcessing || isDemoLoading}
            className={`w-full font-bold py-3 sm:py-4 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base transition-all ${
              isProcessing || isDemoLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Play size={18} fill="currentColor" />
            <span>デモを試す</span>
          </button>
        )}
        
        {/* Footer with Copyright and Help */}
        <div className="flex items-center justify-between w-full px-1 mt-1">
          <p className="text-[10px] text-gray-400 font-medium">
            © 2025 VEMI.jp
          </p>
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-500 transition-colors"
            >
              <HelpCircle size={14} />
              <span>ヘルプ</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FileUploader;
