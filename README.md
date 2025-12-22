![Screenshot](https://gmap-tlvr.vemi.jp/og-image.jpg)

🌐 **[Live Demo](https://gmap-tlvr.vemi.jp/)**

# Timeline Visualizer

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vite.dev/)

> Google Maps のロケーション履歴を可視化・動画エクスポートするWebアプリケーション

## ✨ 機能

### 📍 位置情報の可視化
- Googleマップアプリからエクスポートしたロケーション履歴JSONファイルを読み込み、地図上にプロット
- 年別フィルター機能で特定の期間の履歴を表示

### ▶️ タイムライン再生
- 時系列で移動履歴をアニメーション再生
- 1x〜50xまで再生速度を調整可能
- 広域表示モードと現在地追従モードの切り替え

### 🎬 動画エクスポート（NEW!）
- タイムライン再生をMP4動画として書き出し
- FFmpeg.wasmによるブラウザ内エンコード
- 最大30秒の動画を生成可能

### 🎨 カスタマイズ
- 地図テーマ: ライト / ダーク / 衛星画像
- 座標表示のオン/オフ

### 🔒 プライバシー重視
- **すべてのデータ処理はブラウザ内で完結**
- サーバーへのデータ送信なし
- ページを閉じるとデータは自動消去


## 📖 使い方

1. **データのエクスポート**: Googleマップアプリ（スマホ）で「設定」→「個人的なコンテンツ」→「タイムライン データをエクスポート」
2. **ファイル選択**: アプリケーションで `location-history.json` を選択
3. **再生**: PLAYボタンでアニメーション再生開始
4. **動画出力**: メニューから録画ボタンを押して動画をエクスポート


## 🚀 セットアップ

### 依存関係のインストール

```bash
pnpm install
```

### 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで http://localhost:5173 を開きます。

### プロダクションビルド

```bash
pnpm build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 19 + TypeScript 5.9 |
| ビルドツール | Vite 7 |
| スタイリング | Tailwind CSS 4 |
| 地図 | Leaflet 1.9 |
| 動画エンコード | FFmpeg.wasm 0.12 |
| アイコン | Lucide React |

## 📁 プロジェクト構造

```
timeline-tracker/
├── src/
│   ├── App.tsx              # メインコンポーネント
│   ├── main.tsx             # エントリーポイント
│   ├── types.ts             # 型定義
│   ├── components/          # UIコンポーネント
│   │   ├── ControllerHUD.tsx
│   │   ├── FileUploader.tsx
│   │   ├── TimelineControls.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── HelpModal.tsx
│   │   ├── LegalModal.tsx
│   │   ├── RecordingOverlay.tsx
│   │   ├── ExportModal.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── useVideoRecorder.ts  # 録画機能フック
│   └── utils/
│       ├── dataProcessor.ts     # データ処理
│       ├── mapHelpers.ts        # 地図ヘルパー
│       ├── videoExporter.ts     # 動画エクスポート
│       └── ffmpegCache.ts       # FFmpegキャッシュ管理
├── public/
│   ├── manifest.json        # PWAマニフェスト
│   ├── sitemap.xml
│   └── robots.txt
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 📄 ライセンス

[MIT](LICENSE)

---

Made with ❤️ by [VEMI.jp](https://vemi.jp)
