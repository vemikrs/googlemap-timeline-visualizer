import React, { useState, useCallback } from 'react';
import { ChevronDown, FileSearch, Download, Copy, Check, AlertTriangle, CheckCircle, Info, Shield, FileText, Eye } from 'lucide-react';
import { 
  generateDiagnosticReport, 
  formatReportForDownload, 
  formatReportForClipboard,
  type DiagnosticReport 
} from '../utils/schemaDiagnostics';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setReport(null);
    setShowPreview(false);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const diagnosticReport = generateDiagnosticReport(json);
      setReport(diagnosticReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイルの解析に失敗しました');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!report) return;
    const content = formatReportForDownload(report);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-diagnostic-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report]);

  const handleCopy = useCallback(async () => {
    if (!report) return;
    try {
      const content = formatReportForClipboard(report);
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const content = formatReportForClipboard(report);
      const textarea = document.createElement('textarea');
      textarea.value = content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [report]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNewAnalysis = () => {
    setReport(null);
    setError(null);
    setShowPreview(false);
  };

  // 上位検出フォーマット（UI表示用）
  const topDetectedFormats = report
    ? [...report.supportedFormats]
        .filter((f) => f.found)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
    : [];

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 z-[2100] bg-black/40 flex items-center justify-center p-3 sm:p-6 animate-in fade-in backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-sm rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileSearch className="text-orange-500" size={20} />
            <h2 className="font-black text-lg sm:text-xl text-gray-800">データ診断</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 p-1 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronDown size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 custom-scrollbar">
          <div className="space-y-4 text-sm font-medium">
            
            {/* Privacy Notice */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Shield className="text-green-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-bold text-green-800">完全プライバシー保護</p>
                  <p className="text-[10px] text-green-700 mt-0.5 leading-relaxed">
                    位置情報・日時・個人情報を<strong>一切含まない</strong>診断レポートを生成。
                    JSONの「構造」のみを分析します。
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            {!report && (
              <>
                <div className="space-y-2">
                  <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    ファイル選択
                  </label>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    エラーが発生した location-history.json をアップロードしてください。
                  </p>

                  <label className="block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                      className="hidden"
                    />
                    <div className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isProcessing 
                        ? 'border-gray-200 bg-gray-50 text-gray-400' 
                        : 'border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}>
                      {isProcessing ? (
                        <span className="animate-pulse font-bold text-xs">解析中...</span>
                      ) : (
                        <>
                          <FileSearch size={18} />
                          <span className="font-bold text-xs">ファイルを選択して診断</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                {/* How to Use */}
                <div className="space-y-2">
                  <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    使い方
                  </label>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                    <ol className="text-[11px] text-gray-600 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>エラーが発生した location-history.json をアップロード</li>
                      <li>生成されたレポートをダウンロードまたはコピー</li>
                      <li>GitHubのIssueに添付して報告</li>
                    </ol>
                    <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-200">
                      ※ レポートに緯度経度・日時は含まれません
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Report Display */}
            {report && !showPreview && (
              <>
                {/* Summary Stats */}
                <div className="space-y-2">
                  <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    検出結果
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-blue-600">
                        {report.fileStats.estimatedRecords.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-blue-500 font-medium">位置レコード</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-purple-600">{report.fileStats.maxDepth}</p>
                      <p className="text-[10px] text-purple-500 font-medium">最大深度</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-gray-600">
                        {(report.fileStats.scannedNodes / 1000).toFixed(0)}K
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">スキャン済</p>
                    </div>
                  </div>
                  
                  {report.fileStats.scanLimitReached && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2 flex items-center gap-2">
                      <Info className="text-yellow-600 shrink-0" size={14} />
                      <p className="text-[10px] text-yellow-700">
                        大容量ファイルのため一部のみスキャン
                      </p>
                    </div>
                  )}
                </div>

                {/* Supported Formats */}
                <div className="space-y-2">
                  <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    検出フォーマット
                  </label>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                    {report.supportedFormats.map((format, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {format.found ? (
                            <CheckCircle className="text-green-500" size={14} />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                          )}
                          <span className={format.found ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                            {format.format}
                          </span>
                        </div>
                        {format.found && (
                          <span className="text-gray-500 font-bold">{format.count.toLocaleString()}件</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Errors */}
                {report.errors.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                      検出された問題 ({report.errors.length}件)
                    </label>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2 max-h-24 overflow-y-auto">
                      {report.errors.map((err, i) => (
                        <div key={i} className="text-[10px] bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              err.stage === 'coords' ? 'bg-red-100 text-red-600' :
                              err.stage === 'timestamp' ? 'bg-yellow-100 text-yellow-600' :
                              err.stage === 'filter' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {err.stage === 'coords' ? '座標' :
                               err.stage === 'timestamp' ? '時刻' :
                               err.stage === 'filter' ? 'フィルタ' : '不明'}
                            </span>
                          </div>
                          <code className="text-orange-600 break-all block">{err.path}</code>
                          <p className="text-gray-600 mt-0.5">{err.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter Stats (NEW) */}
                {report.filterStats && (
                  <div className="space-y-2">
                    <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                      抽出結果の詳細
                    </label>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">候補総数:</span>
                          <span className="font-bold text-gray-800">{report.filterStats.totalCandidates.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">✅ 成功:</span>
                          <span className="font-bold text-green-700">{report.filterStats.successfulExtraction.toLocaleString()}</span>
                        </div>
                        {report.filterStats.noTimestamp > 0 && (
                          <div className="flex justify-between">
                            <span className="text-yellow-600">時刻なし:</span>
                            <span className="font-bold text-yellow-700">{report.filterStats.noTimestamp.toLocaleString()}</span>
                          </div>
                        )}
                        {report.filterStats.invalidCoords > 0 && (
                          <div className="flex justify-between">
                            <span className="text-red-600">座標不正:</span>
                            <span className="font-bold text-red-700">{report.filterStats.invalidCoords.toLocaleString()}</span>
                          </div>
                        )}
                        {report.filterStats.zeroOrNegativeTs > 0 && (
                          <div className="flex justify-between">
                            <span className="text-purple-600">無効TS:</span>
                            <span className="font-bold text-purple-700">{report.filterStats.zeroOrNegativeTs.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Samples (NEW) */}
                {report.successSamples && report.successSamples.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                      成功パスのサンプル ({report.successSamples.length}件)
                    </label>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1.5 max-h-24 overflow-y-auto">
                      {report.successSamples.map((sample, i) => (
                        <div key={i} className="text-[10px] bg-white rounded-lg p-2">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-600 text-[9px] font-bold">
                              {sample.format}
                            </span>
                            {sample.hasTimestamp && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[9px] font-bold">
                                時刻あり
                              </span>
                            )}
                          </div>
                          <code className="text-green-700 break-all block">{sample.path}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="space-y-2">
                  <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    分析結果
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <ul className="space-y-1.5">
                      {report.recommendations.map((rec, i) => (
                        <li key={i} className="text-[11px] text-blue-800 leading-relaxed flex items-start gap-1.5">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Top Detected Formats (上位フォーマット) */}
                {topDetectedFormats.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                      上位フォーマット
                    </label>
                    <div className="bg-white rounded-xl p-3 border border-gray-100 text-sm">
                      <ul className="space-y-1">
                        {topDetectedFormats.map((f, i) => (
                          <li key={f.format} className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">{`${i + 1}位: ${f.format}`}</span>
                            <span className="text-gray-500 text-xs">{f.count.toLocaleString()}件</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-gray-400 mt-2">※ 上位3件を表示</p>
                    </div>
                  </div>
                )}

                {/* Preview Button */}
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-100 transition-colors"
                >
                  <Eye size={14} />
                  レポート内容をプレビュー
                </button>

                {/* Actions */}
                <div className="space-y-2">
                  <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    レポート出力
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-600 transition-colors shadow-md"
                    >
                      <Download size={16} />
                      ダウンロード
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Analysis Button */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleNewAnalysis}
                    className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    別のファイルを診断
                  </button>
                </div>
              </>
            )}

            {/* Report Preview */}
            {report && showPreview && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                      <FileText size={12} />
                      レポートプレビュー
                    </label>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-xs text-blue-500 font-bold hover:text-blue-700"
                    >
                      ← 戻る
                    </button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-3 max-h-[50vh] overflow-auto">
                    <pre className="text-[10px] text-green-400 whitespace-pre-wrap break-all font-mono leading-relaxed">
                      {formatReportForDownload(report)}
                    </pre>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 text-center">
                    ↑ このテキストがダウンロード/コピーされます
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-600 transition-colors shadow-md"
                  >
                    <Download size={16} />
                    ダウンロード
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </>
            )}
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
          background: linear-gradient(180deg, #f97316 0%, #ea580c 100%);
          border-radius: 10px;
          border: 2px solid white;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ea580c 0%, #c2410c 100%);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #f97316 transparent;
        }
      `}</style>
    </div>
  );
};

export default DiagnosticsModal;
