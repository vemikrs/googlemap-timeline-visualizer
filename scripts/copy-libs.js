/**
 * ライブラリファイルを public/lib にコピーするスクリプト
 * postinstall で自動実行される
 */

import { copyFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

/**
 * Leaflet ライブラリをコピー
 */
function copyLeaflet() {
  const leafletDist = resolve(rootDir, 'node_modules/leaflet/dist');
  const targetDir = resolve(rootDir, 'public/lib/leaflet');

  if (!existsSync(leafletDist)) {
    console.warn('⚠️  Leaflet not found in node_modules, skipping copy');
    return;
  }

  // ディレクトリ作成
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  try {
    // メインファイルをコピー
    copyFileSync(
      resolve(leafletDist, 'leaflet.js'),
      resolve(targetDir, 'leaflet.js')
    );
    copyFileSync(
      resolve(leafletDist, 'leaflet.css'),
      resolve(targetDir, 'leaflet.css')
    );

    // images ディレクトリをコピー
    const imagesDir = resolve(leafletDist, 'images');
    if (existsSync(imagesDir)) {
      cpSync(imagesDir, resolve(targetDir, 'images'), { recursive: true });
    }

    console.log('✅ Leaflet copied to public/lib/leaflet');
  } catch (err) {
    console.error('❌ Failed to copy Leaflet:', err.message);
  }
}

// 実行
console.log('📦 Copying library files...');
copyLeaflet();
console.log('✅ Done!');
