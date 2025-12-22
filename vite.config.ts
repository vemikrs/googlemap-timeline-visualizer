import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
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
})
