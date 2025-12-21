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
          <p className="text-sm text-gray-400 mt-2 font-medium">ロケーション履歴JSONを選択してください</p>
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
      </div>
    </>
  );
};

export default FileUploader;
