import React from 'react';
import { ChevronLeft, FileText, Shield, Scale, Github, ExternalLink } from 'lucide-react';

type LegalPage = 'terms' | 'privacy' | 'license';

interface LegalModalProps {
  isOpen: boolean;
  page: LegalPage;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  page,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const pageConfig = {
    terms: {
      title: '利用規約',
      icon: FileText,
    },
    privacy: {
      title: 'プライバシーポリシー',
      icon: Shield,
    },
    license: {
      title: 'ライセンス情報',
      icon: Scale,
    },
  };

  const { title, icon: Icon } = pageConfig[page];

  return (
    <div 
      className="absolute inset-0 z-[2100] bg-black/40 flex items-center justify-center p-3 sm:p-6 animate-in fade-in backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <button 
            onClick={onClose} 
            className="text-gray-400 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Icon size={20} className="text-blue-500" />
            <h2 className="font-black text-lg text-gray-800">{title}</h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 custom-scrollbar">
          {page === 'terms' && <TermsContent />}
          {page === 'privacy' && <PrivacyContent />}
          {page === 'license' && <LicenseContent />}
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
          background: linear-gradient(180deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 10px;
          border: 2px solid white;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb 0%, #4f46e5 100%);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 transparent;
        }
      `}</style>
    </div>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="font-bold text-sm text-gray-800 mt-4 mb-2 first:mt-0">{children}</h3>
);

const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-gray-600 leading-relaxed mb-2">{children}</p>
);

const List: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="text-xs text-gray-600 leading-relaxed mb-2 list-disc list-inside space-y-1">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

// ===== 利用規約 =====
const TermsContent: React.FC = () => (
  <div className="space-y-1">
    <div className="bg-blue-50 rounded-xl p-3 mb-4">
      <p className="text-xs text-blue-700 font-medium">
        最終更新日: 2024年12月22日
      </p>
    </div>

    <SectionTitle>第1条（適用）</SectionTitle>
    <Paragraph>
      本利用規約（以下「本規約」）は、Timeline Visualizer（以下「本サービス」）の利用条件を定めるものです。
      ユーザーの皆様には、本規約に同意いただいた上で、本サービスをご利用いただきます。
    </Paragraph>

    <SectionTitle>第2条（サービスの内容）</SectionTitle>
    <Paragraph>
      本サービスは、Google Maps タイムラインからエクスポートされた位置情報データを可視化し、
      移動履歴をアニメーションとして再生するWebアプリケーションです。
    </Paragraph>
    <List items={[
      '位置情報データの読み込みと解析',
      '地図上での移動履歴の表示',
      'タイムラインのアニメーション再生',
      '動画としてのエクスポート機能',
    ]} />

    <SectionTitle>第3条（データの取り扱い）</SectionTitle>
    <Paragraph>
      本サービスはユーザーのプライバシーを最優先に設計されています：
    </Paragraph>
    <List items={[
      'すべてのデータ処理はユーザーのブラウザ内でのみ行われます',
      '位置情報データは外部サーバーに送信されません',
      'データはブラウザのメモリ上でのみ一時的に保持されます',
      'ページを閉じると、すべてのデータは自動的に消去されます',
    ]} />

    <SectionTitle>第4条（禁止事項）</SectionTitle>
    <Paragraph>
      ユーザーは、以下の行為をしてはなりません：
    </Paragraph>
    <List items={[
      '法令または公序良俗に違反する行為',
      '本サービスの運営を妨害する行為',
      '他のユーザーまたは第三者の権利を侵害する行為',
      '本サービスを改変、リバースエンジニアリングする行為（ライセンスで許可された範囲を除く）',
    ]} />

    <SectionTitle>第5条（免責事項）</SectionTitle>
    <Paragraph>
      本サービスは「現状有姿」で提供され、明示または黙示を問わず、いかなる種類の保証も行いません。
      本サービスの利用によって生じた損害について、運営者は一切の責任を負いません。
    </Paragraph>

    <SectionTitle>第6条（サービスの変更・停止）</SectionTitle>
    <Paragraph>
      運営者は、事前の通知なく、本サービスの内容を変更、または提供を停止することができます。
    </Paragraph>

    <SectionTitle>第7条（規約の変更）</SectionTitle>
    <Paragraph>
      運営者は、必要と判断した場合には、ユーザーに通知することなく本規約を変更できるものとします。
      変更後の規約は、本サービス上に掲載した時点で効力を生じるものとします。
    </Paragraph>

    <SectionTitle>第8条（準拠法・管轄裁判所）</SectionTitle>
    <Paragraph>
      本規約の解釈にあたっては、日本法を準拠法とします。
    </Paragraph>
  </div>
);

// ===== プライバシーポリシー =====
const PrivacyContent: React.FC = () => (
  <div className="space-y-1">
    <div className="bg-green-50 rounded-xl p-3 mb-4">
      <p className="text-xs text-green-700 font-medium">
        🔒 本サービスはプライバシーファーストで設計されています
      </p>
    </div>

    <SectionTitle>1. はじめに</SectionTitle>
    <Paragraph>
      Timeline Visualizer（以下「本サービス」）は、ユーザーのプライバシーを最も重要視しています。
      本プライバシーポリシーでは、本サービスがどのようにユーザーの情報を取り扱うかを説明します。
    </Paragraph>

    <SectionTitle>2. 収集する情報</SectionTitle>
    <div className="bg-blue-50 rounded-xl p-3 my-2">
      <p className="text-xs text-blue-700 font-bold mb-1">重要なお知らせ</p>
      <p className="text-xs text-blue-600">
        本サービスは、ユーザーの位置情報データを<strong>収集・保存・送信しません</strong>。
      </p>
    </div>
    <Paragraph>
      すべてのデータ処理はユーザーのデバイス上（ブラウザ内）でのみ行われます。
      サーバーサイドのデータ収集は一切行っていません。
    </Paragraph>

    <SectionTitle>3. ローカルでの処理</SectionTitle>
    <Paragraph>本サービスのデータ処理の特徴：</Paragraph>
    <List items={[
      '位置情報JSONファイルはブラウザのメモリ内でのみ処理されます',
      'データはインターネットを通じて送信されることはありません',
      'ブラウザを閉じると、すべてのデータは自動的に消去されます',
      '録画機能で作成された動画もブラウザ内で生成されます',
    ]} />

    <SectionTitle>4. サードパーティサービス</SectionTitle>
    <Paragraph>本サービスは以下のサードパーティサービスを利用しています：</Paragraph>
    <List items={[
      'OpenStreetMap: 地図タイルの表示（ユーザーの位置情報は送信されません）',
      'Leaflet: 地図表示ライブラリ',
      'FFmpeg (WebAssembly): ブラウザ内での動画エンコード',
    ]} />
    <Paragraph>
      地図タイルの読み込み時に、OpenStreetMapサーバーにHTTPリクエストが送信されますが、
      これにはユーザーの位置情報データは含まれません。
    </Paragraph>

    <SectionTitle>5. Cookie・トラッキング</SectionTitle>
    <Paragraph>
      本サービスは、Cookie、トラッキングピクセル、その他のトラッキング技術を使用しません。
      ユーザーの行動分析やアクセス解析は行っていません。
    </Paragraph>

    <SectionTitle>6. データセキュリティ</SectionTitle>
    <Paragraph>
      すべての処理がブラウザ内で完結するため、データ漏洩のリスクは最小限に抑えられています。
      ただし、ユーザーは自身のデバイスとブラウザのセキュリティを適切に管理する責任があります。
    </Paragraph>

    <SectionTitle>7. 子どものプライバシー</SectionTitle>
    <Paragraph>
      本サービスは、13歳未満の子どもを対象としていません。
    </Paragraph>

    <SectionTitle>8. プライバシーポリシーの変更</SectionTitle>
    <Paragraph>
      本プライバシーポリシーは、必要に応じて更新されることがあります。
      重要な変更がある場合は、本サービス上でお知らせします。
    </Paragraph>

    <SectionTitle>9. お問い合わせ</SectionTitle>
    <Paragraph>
      プライバシーに関するご質問は、GitHubリポジトリのIssueからお問い合わせください。
    </Paragraph>
  </div>
);

// ===== ライセンス情報 =====
const LicenseContent: React.FC = () => (
  <div className="space-y-1">
    <div className="bg-purple-50 rounded-xl p-3 mb-4">
      <p className="text-xs text-purple-700 font-medium">
        本サービスはオープンソースソフトウェアです
      </p>
    </div>

    <SectionTitle>MIT License</SectionTitle>
    <div className="bg-gray-50 rounded-xl p-3 my-2 font-mono text-[10px] text-gray-600 leading-relaxed">
      <p>Copyright (c) 2025 VEMI.jp</p>
      <br />
      <p>
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
      </p>
      <br />
      <p>
        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.
      </p>
      <br />
      <p>
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
      </p>
    </div>

    <SectionTitle>使用しているオープンソースライブラリ</SectionTitle>
    <div className="space-y-2 mt-2">
      <LicenseItem name="React" license="MIT" url="https://github.com/facebook/react" />
      <LicenseItem name="Leaflet" license="BSD-2-Clause" url="https://github.com/Leaflet/Leaflet" />
      <LicenseItem name="FFmpeg.wasm" license="MIT" url="https://github.com/ffmpegwasm/ffmpeg.wasm" />
      <LicenseItem name="Tailwind CSS" license="MIT" url="https://github.com/tailwindlabs/tailwindcss" />
      <LicenseItem name="Lucide React" license="ISC" url="https://github.com/lucide-icons/lucide" />
      <LicenseItem name="Vite" license="MIT" url="https://github.com/vitejs/vite" />
    </div>

    <SectionTitle>地図データ</SectionTitle>
    <Paragraph>
      地図タイルはOpenStreetMapから提供されています。
    </Paragraph>
    <div className="bg-gray-50 rounded-xl p-3 my-2">
      <p className="text-xs text-gray-600">
        © OpenStreetMap contributors
      </p>
      <p className="text-xs text-gray-500 mt-1">
        OpenStreetMapのデータは Open Database License (ODbL) の下でライセンスされています。
      </p>
    </div>

    <div className="mt-4 pt-3 border-t border-gray-100">
      <a
        href="https://github.com/vemikrs/googlemap-timeline-visualizer"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <Github size={16} />
        <span className="text-xs font-bold">ソースコードを見る</span>
        <ExternalLink size={12} />
      </a>
    </div>
  </div>
);

const LicenseItem: React.FC<{ name: string; license: string; url: string }> = ({ name, license, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
  >
    <span className="text-xs font-medium text-gray-700">{name}</span>
    <span className="text-[10px] text-gray-400 group-hover:text-blue-500">{license}</span>
  </a>
);

export default LegalModal;
