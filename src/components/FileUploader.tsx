import React from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  isProcessing: boolean;
  progress: number;
  errorMsg: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  isProcessing,
  progress,
  errorMsg,
  onFileUpload,
}) => {
  return (
    <>
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-3 animate-in fade-in">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-500 font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center py-10 gap-6">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
          <Upload size={40} />
        </div>
        <div className="text-center px-4">
          <h3 className="font-black text-2xl text-gray-800 tracking-tight">Timeline Visualizer</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Google Mapタイムラインデータを可視化</p>
          
          {/* Export Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-100 text-left">
            <p className="text-xs font-bold text-blue-600 mb-1.5">📍 データのエクスポート方法</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Google Mapアプリを開く</li>
              <li>「設定」→「位置情報とプライバシー」</li>
              <li>「タイムライン データをエクスポート」を選択</li>
              <li>エクスポートされたJSONファイルをアップロード</li>
            </ol>
          </div>
          
          {/* Privacy Notice */}
          <div className="mt-3 p-2.5 bg-green-50 rounded-xl border border-green-100">
            <p className="text-xs text-green-700 font-semibold">
              🔒 プライバシー保護: 位置情報はブラウザ内でのみ処理され、サーバーには送信・保存されません
            </p>
          </div>
        </div>
        <label className="w-full">
          <input 
            type="file" 
            accept=".json,.geojson" 
            onChange={onFileUpload} 
            className="hidden" 
            disabled={isProcessing} 
          />
          <div className={`w-full font-black py-5.5 rounded-3xl flex items-center justify-center gap-3 shadow-xl ${
            isProcessing 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-blue-500 text-white shadow-blue-200'
          }`}>
            {isProcessing ? <span>解析中 {progress}%</span> : 'ファイルを選択'}
          </div>
        </label>
        
        {/* Copyright */}
        <p className="text-[10px] text-gray-400 font-medium mt-2">
          © 2025 VEMI.jp - All Rights Reserved
        </p>
      </div>
    </>
  );
};

export default FileUploader;
