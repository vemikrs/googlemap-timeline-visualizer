import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import pkg from './package.json'

// ビルド番号を生成（タグベースで連番管理）
function generateBuildNumber(): string {
  const version = pkg.version;
  
  // JST日付を取得（UTC+9）
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9
  const jst = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60000);
  const today = jst.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD in JST
  
  try {
    // 今日のビルドタグ数をカウント（連番）
    const tags = execSync(`git tag -l "v${version}-${today}-*" 2>/dev/null || echo ""`, { encoding: 'utf-8' });
    const tagList = tags.trim().split('\n').filter((t: string) => t.length > 0);
    const buildNum = (tagList.length + 1).toString().padStart(3, '0');
    return `${version}-${today}-${buildNum}`;
  } catch {
    // Git未使用の場合
    return `${version}-${today}-001`;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const buildInfo = isDev ? `${pkg.version}-dev` : `Build: ${generateBuildNumber()}`;
  
  return {
    plugins: [react()],
    base: '/',
    define: {
      '__APP_VERSION__': JSON.stringify(pkg.version),
      '__BUILD_INFO__': JSON.stringify(buildInfo),
    },
    server: {
      // Note: COOP/COEP headers removed - they block external tile maps
      // ffmpeg.wasm 0.12+ works without SharedArrayBuffer
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // ffmpeg関連は別チャンクに分離（遅延ロード用）
            'ffmpeg': ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
          },
        },
      },
    },
    optimizeDeps: {
      // ffmpegは事前バンドルから除外
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },
  };
})
