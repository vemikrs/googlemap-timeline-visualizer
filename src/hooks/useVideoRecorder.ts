/**
 * 動画録画用カスタムフック
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  loadFFmpeg, 
  exportVideo, 
  isFFmpegLoaded, 
  type LoadProgress 
} from '../utils/videoExporter';

export type RecorderStatus = 
  | 'idle' 
  | 'need-download' 
  | 'downloading' 
  | 'ready' 
  | 'recording' 
  | 'processing' 
  | 'done' 
  | 'error';

export interface RecorderState {
  status: RecorderStatus;
  downloadProgress: number;
  downloadPhase: 'confirm' | 'downloading' | 'initializing';
  processingProgress: number;
  frameCount: number;
  elapsedTime: number;
  outputBlob: Blob | null;
  error: string | null;
}

export interface RecorderOptions {
  targetRef: React.RefObject<HTMLElement | null>;
  fps?: number;
  maxDuration?: number;
  resolution?: number;
  format?: 'mp4' | 'gif' | 'webm';
}

export interface RecorderActions {
  requestRecording: () => void;
  confirmDownload: () => Promise<void>;
  cancelDownload: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  downloadVideo: () => void;
  shareVideo: () => Promise<boolean>;
  reset: () => void;
}

const DEFAULT_OPTIONS = {
  fps: 10,
  maxDuration: 30,
  resolution: 0.6,
  format: 'mp4' as const,
};

export function useVideoRecorder(options: RecorderOptions): RecorderState & RecorderActions {
  const { 
    targetRef, 
    fps = DEFAULT_OPTIONS.fps,
    maxDuration = DEFAULT_OPTIONS.maxDuration,
    resolution = DEFAULT_OPTIONS.resolution,
    format = DEFAULT_OPTIONS.format,
  } = options;

  const [state, setState] = useState<RecorderState>({
    status: 'idle',
    downloadProgress: 0,
    downloadPhase: 'confirm',
    processingProgress: 0,
    frameCount: 0,
    elapsedTime: 0,
    outputBlob: null,
    error: null,
  });

  const framesRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  // ポリラインcanvasのキャッシュ（チカチカ防止用）
  const polylineCacheRef = useRef<ImageData | null>(null);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // 録画リクエスト（ダウンロード確認が必要かチェック）
  const requestRecording = useCallback(() => {
    if (isFFmpegLoaded()) {
      setState(prev => ({ ...prev, status: 'ready' }));
    } else {
      // キャッシュされていても、ブラウザ再起動後は再ロードが必要
      setState(prev => ({ 
        ...prev, 
        status: 'need-download',
        downloadPhase: 'confirm',
        downloadProgress: 0,
      }));
    }
  }, []);

  // ダウンロード確認後の実行
  const confirmDownload = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      downloadPhase: 'downloading',
      downloadProgress: 0,
    }));

    try {
      await loadFFmpeg((progress: LoadProgress) => {
        setState(prev => ({
          ...prev,
          downloadPhase: progress.phase === 'downloading' ? 'downloading' : 'initializing',
          downloadProgress: progress.progress,
        }));
      });

      setState(prev => ({ 
        ...prev, 
        status: 'ready',
        downloadProgress: 100,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: `FFmpegのロードに失敗しました: ${(error as Error).message}`,
      }));
    }
  }, []);

  // ダウンロードキャンセル
  const cancelDownload = useCallback(() => {
    setState(prev => ({ ...prev, status: 'idle' }));
  }, []);

  // フレームキャプチャ（同期的に実行してチカチカ防止）
  const captureFrame = useCallback(() => {
    if (!targetRef.current || !isRecordingRef.current) return;

    try {
      const target = targetRef.current;
      const rect = target.getBoundingClientRect();
      
      // Canvas作成（H.264用に偶数サイズ）
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(rect.width * resolution / 2) * 2;
      canvas.height = Math.floor(rect.height * resolution / 2) * 2;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // 背景色
      ctx.fillStyle = '#e8f4f8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. タイル画像を描画
      const tileImages = target.querySelectorAll('.leaflet-tile-pane img');
      let tileDrawn = false;
      
      for (const img of Array.from(tileImages)) {
        const imgEl = img as HTMLImageElement;
        if (imgEl.complete && imgEl.naturalWidth > 0 && imgEl.style.display !== 'none') {
          try {
            const imgRect = imgEl.getBoundingClientRect();
            const x = (imgRect.left - rect.left) * scaleX;
            const y = (imgRect.top - rect.top) * scaleY;
            const w = imgRect.width * scaleX;
            const h = imgRect.height * scaleY;
            ctx.drawImage(imgEl, x, y, w, h);
            tileDrawn = true;
          } catch {
            // CORSエラーはスキップ
          }
        }
      }

      // タイルなしの場合のフォールバック
      if (!tileDrawn) {
        ctx.strokeStyle = '#d0e8f0';
        ctx.lineWidth = 1;
        const gridSize = 50 * scaleX;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // 2. Leaflet canvas（ポリラインなど）を描画
      const leafletCanvases = target.querySelectorAll('.leaflet-overlay-pane canvas');
      let polylineDrawn = false;
      
      for (const leafletCanvas of Array.from(leafletCanvases)) {
        const canvasEl = leafletCanvas as HTMLCanvasElement;
        try {
          // canvasが空かどうかチェック
          const tempCtx = canvasEl.getContext('2d');
          if (tempCtx && canvasEl.width > 0 && canvasEl.height > 0) {
            const canvasRect = canvasEl.getBoundingClientRect();
            const x = (canvasRect.left - rect.left) * scaleX;
            const y = (canvasRect.top - rect.top) * scaleY;
            const w = canvasRect.width * scaleX;
            const h = canvasRect.height * scaleY;
            
            // 描画前の状態を取得してキャッシュ
            ctx.drawImage(canvasEl, x, y, w, h);
            polylineDrawn = true;
            
            // 描画成功したらキャッシュを更新
            polylineCacheRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
          }
        } catch {
          // エラーはスキップ
        }
      }
      
      // canvasが描画できなかった場合、キャッシュから復元
      if (!polylineDrawn && polylineCacheRef.current) {
        ctx.putImageData(polylineCacheRef.current, 0, 0);
      }

      // 3. divIconマーカー（現在地マーカー）を手動で描画
      const divIcons = target.querySelectorAll('.leaflet-marker-pane .custom-div-icon');
      for (const divIcon of Array.from(divIcons)) {
        const divEl = divIcon as HTMLElement;
        const divRect = divEl.getBoundingClientRect();
        const cx = (divRect.left - rect.left + divRect.width / 2) * scaleX;
        const cy = (divRect.top - rect.top + divRect.height / 2) * scaleY;
        const radius = (divRect.width / 2) * scaleX;
        
        // 外側の光彩効果
        ctx.save();
        ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
        ctx.shadowBlur = 20 * scaleX;
        
        // 白い枠線
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 2 * scaleX, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // 青い円
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 2 * scaleX, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.restore();
      }

      // 4. imgマーカー（その他のマーカー）を描画
      const markerPane = target.querySelector('.leaflet-marker-pane');
      if (markerPane) {
        const markers = markerPane.querySelectorAll('img');
        for (const marker of Array.from(markers)) {
          const markerEl = marker as HTMLImageElement;
          if (markerEl.complete && markerEl.naturalWidth > 0) {
            try {
              const markerRect = markerEl.getBoundingClientRect();
              const x = (markerRect.left - rect.left) * scaleX;
              const y = (markerRect.top - rect.top) * scaleY;
              const w = markerRect.width * scaleX;
              const h = markerRect.height * scaleY;
              ctx.drawImage(markerEl, x, y, w, h);
            } catch {
              // CORSエラーはスキップ
            }
          }
        }
      }

      // 5. TimestampHeader を手動で描画
      const headerContainer = target.querySelector('[class*="pointer-events-none"]');
      if (headerContainer) {
        const headerCard = headerContainer.querySelector('[class*="rounded-3xl"]') as HTMLElement;
        if (headerCard) {
          const headerRect = headerCard.getBoundingClientRect();
          const hx = (headerRect.left - rect.left) * scaleX;
          const hy = (headerRect.top - rect.top) * scaleY;
          const hw = headerRect.width * scaleX;
          const hh = headerRect.height * scaleY;
          const radius = 24 * scaleX;
          
          // 背景（角丸・半透明白）
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(hx, hy, hw, hh, radius);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 20 * scaleX;
          ctx.shadowOffsetY = 4 * scaleY;
          ctx.fill();
          ctx.restore();
          
          // Year Badge（青いグラデーション）
          const yearBadge = headerCard.querySelector('[class*="rounded-full"]') as HTMLElement;
          if (yearBadge) {
            const badgeRect = yearBadge.getBoundingClientRect();
            const bx = (badgeRect.left - rect.left) * scaleX;
            const by = (badgeRect.top - rect.top) * scaleY;
            const bw = badgeRect.width * scaleX;
            const bh = badgeRect.height * scaleY;
            const bradius = bh / 2;
            
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, bradius);
            const gradient = ctx.createLinearGradient(bx, by, bx + bw, by);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.9)');
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Year テキスト
            ctx.fillStyle = 'white';
            ctx.font = `bold ${9 * scaleX}px system-ui`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const yearText = yearBadge.textContent?.trim() || '';
            ctx.fillText(yearText.toUpperCase(), bx + bw / 2, by + bh / 2);
            ctx.restore();
          }
          
          // Point カウンター
          const pointText = headerCard.querySelector('[class*="font-mono"][class*="text-base"]');
          const pointTotal = headerCard.querySelector('[class*="text-gray-400"][class*="font-mono"]');
          if (pointText && pointTotal) {
            const pRect = pointText.getBoundingClientRect();
            ctx.save();
            ctx.font = `900 ${16 * scaleX}px system-ui`;
            ctx.fillStyle = '#3b82f6';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const px = (pRect.right - rect.left) * scaleX;
            const py = (pRect.top - rect.top + pRect.height / 2) * scaleY;
            ctx.fillText(pointText.textContent || '', px, py);
            
            // "/ total"
            ctx.font = `bold ${9 * scaleX}px system-ui`;
            ctx.fillStyle = '#9ca3af';
            ctx.fillText(pointTotal.textContent || '', px + 35 * scaleX, py);
            ctx.restore();
          }
          
          // メインのタイムスタンプ
          const timestamp = headerCard.querySelector('h3');
          if (timestamp) {
            const tsRect = timestamp.getBoundingClientRect();
            ctx.save();
            ctx.font = `900 ${18 * scaleX}px ui-monospace, monospace`;
            ctx.fillStyle = '#1f2937';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const tsx = (tsRect.left - rect.left) * scaleX;
            const tsy = (tsRect.top - rect.top) * scaleY;
            ctx.fillText(timestamp.textContent || '', tsx, tsy);
            ctx.restore();
          }
        }
      }

      // Blobに変換（同期的にframesRefに追加）
      canvas.toBlob(
        (blob) => {
          if (blob && isRecordingRef.current) {
            framesRef.current.push(blob);
            
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            setState(prev => ({
              ...prev,
              frameCount: framesRef.current.length,
              elapsedTime: elapsed,
            }));

            // 最大時間に達したら自動停止
            if (elapsed >= maxDuration) {
              isRecordingRef.current = false;
              if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
              }
            }
          }
        },
        'image/png',
        0.9
      );
    } catch (error) {
      console.error('Frame capture error:', error);
    }
  }, [targetRef, resolution, maxDuration]);

  // 録画開始
  const startRecording = useCallback(() => {
    if (!isFFmpegLoaded()) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: 'FFmpegがロードされていません' 
      }));
      return;
    }

    framesRef.current = [];
    polylineCacheRef.current = null; // キャッシュをクリア
    startTimeRef.current = Date.now();
    isRecordingRef.current = true;

    setState(prev => ({
      ...prev,
      status: 'recording',
      frameCount: 0,
      elapsedTime: 0,
      outputBlob: null,
      error: null,
    }));

    // キャプチャ間隔 (fps から計算)
    const interval = 1000 / fps;
    
    // 最初のフレームを即座にキャプチャ
    captureFrame();
    
    recordingIntervalRef.current = window.setInterval(captureFrame, interval);
  }, [fps, captureFrame]);

  // 録画停止 & エンコード開始
  const stopRecording = useCallback(async () => {
    // 既に停止処理中なら何もしない
    if (!isRecordingRef.current && framesRef.current.length === 0) {
      return;
    }
    
    isRecordingRef.current = false;
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    const frames = [...framesRef.current]; // コピーを作成
    framesRef.current = []; // 即座にクリア

    if (frames.length === 0) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'キャプチャされたフレームがありません',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      status: 'processing',
      processingProgress: 0,
    }));

    try {
      const blob = await exportVideo({
        frames,
        fps,
        format,
        onProgress: (percent) => {
          setState(prev => ({ ...prev, processingProgress: percent }));
        },
      });

      setState(prev => ({
        ...prev,
        status: 'done',
        outputBlob: blob,
        processingProgress: 100,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: `動画の生成に失敗しました: ${(error as Error).message}`,
      }));
    }
  }, [fps, format]);

  // 録画キャンセル
  const cancelRecording = useCallback(() => {
    isRecordingRef.current = false;
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    framesRef.current = [];
    setState(prev => ({
      ...prev,
      status: 'idle',
      frameCount: 0,
      elapsedTime: 0,
    }));
  }, []);

  // ダウンロード
  const downloadVideo = useCallback(() => {
    if (!state.outputBlob) return;

    const extension = format === 'gif' ? 'gif' : format === 'webm' ? 'webm' : 'mp4';
    const filename = `timeline-${new Date().toISOString().slice(0, 10)}.${extension}`;
    
    const url = URL.createObjectURL(state.outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.outputBlob, format]);

  // 共有 (Web Share API)
  const shareVideo = useCallback(async (): Promise<boolean> => {
    if (!state.outputBlob) return false;

    const extension = format === 'gif' ? 'gif' : format === 'webm' ? 'webm' : 'mp4';
    const mimeType = format === 'gif' ? 'image/gif' : format === 'webm' ? 'video/webm' : 'video/mp4';
    const filename = `timeline-${new Date().toISOString().slice(0, 10)}.${extension}`;

    // Web Share API が使えるかチェック
    if (navigator.share && navigator.canShare) {
      const file = new File([state.outputBlob], filename, { type: mimeType });
      const shareData = { files: [file] };

      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return true;
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error('Share failed:', error);
          }
          return false;
        }
      }
    }

    // 共有できない場合はダウンロードにフォールバック
    downloadVideo();
    return true;
  }, [state.outputBlob, format, downloadVideo]);

  // リセット
  const reset = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    isRecordingRef.current = false;
    framesRef.current = [];
    
    setState({
      status: 'idle',
      downloadProgress: 0,
      downloadPhase: 'confirm',
      processingProgress: 0,
      frameCount: 0,
      elapsedTime: 0,
      outputBlob: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    requestRecording,
    confirmDownload,
    cancelDownload,
    startRecording,
    stopRecording,
    cancelRecording,
    downloadVideo,
    shareVideo,
    reset,
  };
}
