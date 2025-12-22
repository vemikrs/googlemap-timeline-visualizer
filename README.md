# Timeline Visualizer

Google Maps のロケーション履歴を可視化するWebアプリケーション

## 機能

- **位置情報の可視化**: Googleマップアプリからエクスポートしたロケーション履歴JSONファイルを読み込み、地図上にプロットします
- **タイムライン再生**: 時系列で移動履歴を再生できます
- **広域/追従モード**: 日本地図レベルの広域表示と、現在地追従モードを切り替え可能
- **年別フィルター**: 特定の年の履歴のみを表示
- **地図テーマ**: ライト/ダーク/衛星画像の3つのテーマから選択
- **再生速度調整**: 1x〜50xまで再生速度を変更可能

## セットアップ

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

## 使い方

1. Googleマップアプリ（スマホ）の「設定」→「個人的なコンテンツ」から位置情報データをエクスポート（デフォルトファイル名: `location-history.json`）
2. アプリケーションでJSONファイルを選択
3. データが解析され、地図上に表示されます
4. PLAYボタンで再生開始
5. 設定ボタンから年や地図テーマを変更可能

## 技術スタック

- **React 18** + **TypeScript 5**
- **Vite 6** - 高速ビルドツール
- **Tailwind CSS 3** - ユーティリティファーストCSSフレームワーク
- **Leaflet 1.9** - 地図表示ライブラリ
- **Lucide React** - アイコンライブラリ

## プロジェクト構造

```
timeline-tracker/
├── src/
│   ├── App.tsx           # メインコンポーネント
│   ├── main.tsx          # エントリーポイント
│   ├── types.ts          # 型定義
│   ├── utils/
│   │   ├── dataProcessor.ts   # データ処理ロジック
│   │   └── mapHelpers.ts      # 地図関連ヘルパー
│   └── index.css         # グローバルスタイル
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## ライセンス

MIT
