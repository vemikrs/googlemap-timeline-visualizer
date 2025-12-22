/**
 * FFmpeg.wasm を使った動画エクスポート処理
 * 遅延ロード対応
 */

import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { markAsLoaded, FFMPEG_CORE_BASE_URL } from './ffmpegCache';

let ffmpegInstance: FFmpeg | null = null;
let isLoaded = false;
let loadingPromise: Promise<FFmpeg> | null = null;

export interface LoadProgress {
  phase: 'downloading' | 'initializing';
  progress: number; // 0-100
}

export interface ExportOptions {
  frames: Blob[];
  fps: number;
  format: 'mp4' | 'gif' | 'webm';
  onProgress: (percent: number) => void;
}

/**
 * FFmpegがロード済みかチェック
 */
export function isFFmpegLoaded(): boolean {
  return isLoaded;
}

/**
 * FFmpegの遅延ロード
 */
export async function loadFFmpeg(
  onProgress?: (progress: LoadProgress) => void
): Promise<FFmpeg> {
  // 既にロード済み
  if (ffmpegInstance && isLoaded) {
    return ffmpegInstance;
  }

  // ロード中なら既存のPromiseを返す
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      onProgress?.({ phase: 'downloading', progress: 0 });

      // 動的import
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');

      onProgress?.({ phase: 'downloading', progress: 10 });

      ffmpegInstance = new FFmpeg();

      // WASM/JSファイルをCDNから取得（ESM版、シングルスレッドモード）
      onProgress?.({ phase: 'downloading', progress: 20 });

      const coreURL = await toBlobURL(
        `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
        'text/javascript'
      );
      onProgress?.({ phase: 'downloading', progress: 50 });

      const wasmURL = await toBlobURL(
        `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
        'application/wasm'
      );
      onProgress?.({ phase: 'downloading', progress: 80 });

      onProgress?.({ phase: 'initializing', progress: 85 });

      await ffmpegInstance.load({
        coreURL,
        wasmURL,
        // workerURL省略でシングルスレッドモード
      });

      onProgress?.({ phase: 'initializing', progress: 100 });

      isLoaded = true;
      markAsLoaded();
      
      return ffmpegInstance;
    } catch (error) {
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * フレームをMP4/GIF/WebMに変換
 */
export async function exportVideo(options: ExportOptions): Promise<Blob> {
  const { frames, fps, format, onProgress } = options;

  if (!ffmpegInstance || !isLoaded) {
    throw new Error('FFmpeg is not loaded. Call loadFFmpeg() first.');
  }

  const ffmpeg = ffmpegInstance;
  const { fetchFile } = await import('@ffmpeg/util');

  onProgress(0);

  // フレームをFFmpegのファイルシステムに書き込み
  const totalFrames = frames.length;
  for (let i = 0; i < totalFrames; i++) {
    const frameBlob = frames[i];
    
    if (frameBlob.size === 0) {
      continue;
    }
    
    const frameData = await fetchFile(frameBlob);
    const filename = `frame${String(i).padStart(5, '0')}.png`;
    await ffmpeg.writeFile(filename, frameData);
    onProgress(Math.round((i / totalFrames) * 50)); // 0-50%
  }

  onProgress(50);

  // エンコード設定
  let outputFilename: string;
  let ffmpegArgs: string[];

  switch (format) {
    case 'gif':
      outputFilename = 'output.gif';
      ffmpegArgs = [
        '-framerate', String(fps),
        '-i', 'frame%05d.png',
        '-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        '-loop', '0',
        outputFilename
      ];
      break;
    case 'webm':
      outputFilename = 'output.webm';
      ffmpegArgs = [
        '-framerate', String(fps),
        '-i', 'frame%05d.png',
        '-c:v', 'libvpx',
        '-b:v', '2M',
        '-pix_fmt', 'yuv420p',
        outputFilename
      ];
      break;
    case 'mp4':
    default:
      outputFilename = 'output.mp4';
      ffmpegArgs = [
        '-framerate', String(fps),
        '-i', 'frame%05d.png',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '23',
        outputFilename
      ];
      break;
  }

  // 進捗監視
  ffmpeg.on('progress', ({ progress }) => {
    onProgress(50 + Math.round(progress * 45)); // 50-95%
  });

  // エンコード実行
  await ffmpeg.exec(ffmpegArgs);

  onProgress(95);

  // 結果ファイルを取得
  const outputData = await ffmpeg.readFile(outputFilename) as Uint8Array;

  if (outputData.length === 0) {
    throw new Error('FFmpeg produced empty output file');
  }

  // クリーンアップ: 入力フレームと出力ファイルを削除
  for (let i = 0; i < totalFrames; i++) {
    const filename = `frame${String(i).padStart(5, '0')}.png`;
    try {
      await ffmpeg.deleteFile(filename);
    } catch {
      // 無視
    }
  }
  try {
    await ffmpeg.deleteFile(outputFilename);
  } catch {
    // 無視
  }

  onProgress(100);

  // MIMEタイプを設定
  const mimeType = format === 'gif' ? 'image/gif' 
    : format === 'webm' ? 'video/webm' 
    : 'video/mp4';

  // Uint8Arrayから新しいArrayBufferにコピーしてBlobを作成
  const arrayBuffer = new ArrayBuffer(outputData.length);
  new Uint8Array(arrayBuffer).set(outputData);
  return new Blob([arrayBuffer], { type: mimeType });
}

/**
 * FFmpegインスタンスを解放
 */
export function terminateFFmpeg(): void {
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch {
      // 無視
    }
    ffmpegInstance = null;
    isLoaded = false;
    loadingPromise = null;
  }
}
