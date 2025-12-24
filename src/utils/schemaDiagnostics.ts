/**
 * Schema Diagnostics Tool
 * 
 * location-history.json の構造を分析し、実際の位置情報を含まない
 * 完全に匿名化された診断レポートを生成します。
 * 
 * これにより、ユーザーは機密情報を共有することなく、
 * 開発者がエラーの原因を特定できる情報を提供できます。
 */

export interface SchemaNode {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'undefined';
  keys?: string[];                    // objectの場合のキー一覧
  arrayLength?: number;               // arrayの場合の長さ
  sampleStringFormat?: string;        // stringの場合のフォーマット推測（"geo:*", "ISO8601", etc.）
  numberRange?: 'e7coords' | 'timestamp' | 'small' | 'other';  // 数値の範囲推測
  children?: Record<string, SchemaNode>;  // ネストされた構造
  occurrences?: number;               // この構造が何回出現したか
}

export interface ParseAttempt {
  path: string;
  success: boolean;
  extractedType: string;
  error?: string;
}

export interface FilterStats {
  totalCandidates: number;       // 座標抽出候補の総数
  noTimestamp: number;           // 時刻がなく除外された数
  invalidCoords: number;         // 座標パース失敗で除外された数
  zeroOrNegativeTs: number;      // ts <= 0 で除外された数
  successfulExtraction: number;  // 正常に抽出された数
}

export interface SuccessSample {
  path: string;
  format: string;
  hasTimestamp: boolean;
}

export interface DiagnosticReport {
  version: string;
  appBuildInfo: string;  // NEW: アプリのビルド情報
  generatedAt: string;
  fileStats: {
    estimatedRecords: number;
    maxDepth: number;
    uniqueKeyPatterns: number;
    scannedNodes: number;
    scanLimitReached: boolean;
  };
  filterStats: FilterStats;  // NEW: フィルタリング統計
  successSamples: SuccessSample[];  // NEW: 成功パスのサンプル
  rootSchema: SchemaNode;
  parseAttempts: ParseAttempt[];
  supportedFormats: {
    format: string;
    found: boolean;
    count: number;
  }[];
  errors: {
    path: string;
    message: string;
    stage: 'coords' | 'timestamp' | 'filter' | 'unknown';  // NEW: 失敗段階
    schemaAtPath: SchemaNode | null;
  }[];
  recommendations: string[];
}

/**
 * 文字列のフォーマットを推測（値自体は含まない）
 */
function inferStringFormat(str: string): string {
  if (str.startsWith('geo:')) return 'geo:lat,lng';
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return 'ISO8601';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return 'date-only';
  if (/^https?:\/\//.test(str)) return 'url';
  if (/^[A-Za-z0-9+/=]+$/.test(str) && str.length > 20) return 'base64-like';
  if (str.length > 100) return `long-string(${str.length}chars)`;
  // 文字列自体は絶対に含めない
  return `string(${str.length}chars)`;
}

/**
 * 数値の範囲を推測
 */
function inferNumberRange(num: number): SchemaNode['numberRange'] {
  const absNum = Math.abs(num);
  // E7座標（緯度経度を10^7倍した整数）
  if (Number.isInteger(num) && absNum > 1_000_000 && absNum < 2_000_000_000) {
    return 'e7coords';
  }
  // タイムスタンプ（ミリ秒）
  if (num > 1_000_000_000_000 && num < 2_000_000_000_000) {
    return 'timestamp';
  }
  // 小さい数値
  if (absNum < 1000) {
    return 'small';
  }
  return 'other';
}

/**
 * JSONノードのスキーマを抽出（値は含まない）
 */
function extractSchema(node: unknown, depth: number = 0, maxDepth: number = 10): SchemaNode {
  if (depth > maxDepth) {
    return { type: 'object', keys: ['...truncated...'] };
  }

  if (node === null) return { type: 'null' };
  if (node === undefined) return { type: 'undefined' };

  const nodeType = typeof node;

  if (nodeType === 'string') {
    return {
      type: 'string',
      sampleStringFormat: inferStringFormat(node as string),
    };
  }

  if (nodeType === 'number') {
    return {
      type: 'number',
      numberRange: inferNumberRange(node as number),
    };
  }

  if (nodeType === 'boolean') {
    return { type: 'boolean' };
  }

  if (Array.isArray(node)) {
    const schema: SchemaNode = {
      type: 'array',
      arrayLength: node.length,
    };
    // 配列の最初の要素のスキーマをサンプルとして取得
    if (node.length > 0) {
      schema.children = {
        '[sample]': extractSchema(node[0], depth + 1, maxDepth),
      };
    }
    return schema;
  }

  if (nodeType === 'object') {
    const obj = node as Record<string, unknown>;
    const keys = Object.keys(obj);
    const schema: SchemaNode = {
      type: 'object',
      keys: keys.slice(0, 50), // 最大50キーまで
    };

    // 子要素のスキーマを抽出（深さ制限あり）
    if (depth < maxDepth) {
      schema.children = {};
      for (const key of keys.slice(0, 20)) { // 最大20キーまで詳細展開
        schema.children[key] = extractSchema(obj[key], depth + 1, maxDepth);
      }
    }

    return schema;
  }

  return { type: 'undefined' };
}

/**
 * サポートされているフォーマットをチェック
 */
interface FormatCheckResult {
  formats: DiagnosticReport['supportedFormats'];
  scanned: number;
  limitReached: boolean;
  filterStats: FilterStats;
  successSamples: SuccessSample[];
}

function checkSupportedFormats(json: unknown): FormatCheckResult {
  const formats: DiagnosticReport['supportedFormats'] = [
    { format: 'geo:lat,lng strings', found: false, count: 0 },
    { format: 'latitudeE7/longitudeE7', found: false, count: 0 },
    { format: 'timelinePath array', found: false, count: 0 },
    { format: 'startTime field', found: false, count: 0 },
    { format: 'timestamp field', found: false, count: 0 },
    { format: 'placeLocation', found: false, count: 0 },
    { format: 'point field', found: false, count: 0 },
    { format: 'durationMinutesOffset', found: false, count: 0 },  // NEW
  ];

  const filterStats: FilterStats = {
    totalCandidates: 0,
    noTimestamp: 0,
    invalidCoords: 0,
    zeroOrNegativeTs: 0,
    successfulExtraction: 0,
  };

  const successSamples: SuccessSample[] = [];
  const maxSamples = 5;

  const stack: { node: unknown; path: string; parentHasTime: boolean }[] = [
    { node: json, path: '$', parentHasTime: false }
  ];
  let scanned = 0;
  const maxScan = 2000000; // 大容量ファイル対応

  while (stack.length > 0 && scanned < maxScan) {
    const { node, path, parentHasTime } = stack.pop()!;
    scanned++;

    if (!node || typeof node !== 'object') continue;

    if (Array.isArray(node)) {
      // 全要素をスキャン（正確なカウントのため）
      for (let i = 0; i < node.length; i++) {
        stack.push({ node: node[i], path: `${path}[${i}]`, parentHasTime });
      }
      continue;
    }

    const obj = node as Record<string, unknown>;
    const keys = Object.keys(obj);

    // 時刻フィールドの存在確認
    const hasOwnTime = obj.startTime !== undefined || obj.timestamp !== undefined;
    const hasTime = hasOwnTime || parentHasTime;

    // 各フォーマットをチェック
    for (const key of keys) {
      const val = obj[key];

      if (typeof val === 'string' && val.startsWith('geo:')) {
        formats[0].found = true;
        formats[0].count++;
        filterStats.totalCandidates++;

        // geo座標のパース試行
        const parts = val.replace('geo:', '').split(',');
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        
        if (isNaN(lat) || isNaN(lng)) {
          filterStats.invalidCoords++;
        } else if (!hasTime) {
          filterStats.noTimestamp++;
        } else {
          filterStats.successfulExtraction++;
          if (successSamples.length < maxSamples) {
            successSamples.push({ path: `${path}.${key}`, format: 'geo-string', hasTimestamp: hasTime });
          }
        }
      }

      if (key === 'latitudeE7' || key === 'longitudeE7') {
        formats[1].found = true;
        formats[1].count++;
        
        if (key === 'latitudeE7') {
          filterStats.totalCandidates++;
          if (typeof val !== 'number') {
            filterStats.invalidCoords++;
          } else if (!hasTime) {
            filterStats.noTimestamp++;
          } else {
            filterStats.successfulExtraction++;
            if (successSamples.length < maxSamples) {
              successSamples.push({ path: `${path}.latitudeE7`, format: 'e7-coords', hasTimestamp: hasTime });
            }
          }
        }
      }

      if (key === 'timelinePath' && Array.isArray(val)) {
        formats[2].found = true;
        formats[2].count++;
      }

      if (key === 'startTime') {
        formats[3].found = true;
        formats[3].count++;
      }

      if (key === 'timestamp') {
        formats[4].found = true;
        formats[4].count++;
      }

      if (key === 'placeLocation') {
        formats[5].found = true;
        formats[5].count++;
      }

      if (key === 'point' && typeof val === 'string') {
        formats[6].found = true;
        formats[6].count++;
      }

      // NEW: durationMinutesOffsetFromStartTime の検出
      if (key === 'durationMinutesOffsetFromStartTime') {
        formats[7].found = true;
        formats[7].count++;
      }

      // 子要素をスタックに追加
      if (val && typeof val === 'object') {
        stack.push({ node: val, path: `${path}.${key}`, parentHasTime: hasTime });
      }
    }
  }

  return { formats, scanned, limitReached: scanned >= maxScan, filterStats, successSamples };
}

/**
 * パース試行結果を記録
 */
function collectParseAttempts(json: unknown): ParseAttempt[] {
  const attempts: ParseAttempt[] = [];
  const stack: { node: unknown; path: string }[] = [{ node: json, path: '$' }];
  let scanned = 0;
  const maxScan = 10000;
  const maxAttempts = 100;

  while (stack.length > 0 && scanned < maxScan && attempts.length < maxAttempts) {
    const { node, path } = stack.pop()!;
    scanned++;

    if (!node || typeof node !== 'object') continue;

    if (Array.isArray(node)) {
      // 配列の最初の数要素だけチェック
      for (let i = 0; i < Math.min(3, node.length); i++) {
        stack.push({ node: node[i], path: `${path}[${i}]` });
      }
      continue;
    }

    const obj = node as Record<string, unknown>;

    // 位置情報抽出を試みる
    const geoKeys = ['point', 'placeLocation', 'start', 'end', 'location'];
    for (const key of geoKeys) {
      if (obj[key] && typeof obj[key] === 'string') {
        const str = obj[key] as string;
        if (str.startsWith('geo:')) {
          const parts = str.replace('geo:', '').split(',');
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          attempts.push({
            path: `${path}.${key}`,
            success: !isNaN(lat) && !isNaN(lng),
            extractedType: 'geo-string',
            error: isNaN(lat) || isNaN(lng) ? 'Failed to parse coordinates' : undefined,
          });
        }
      }
    }

    // E7座標をチェック
    if (obj.latitudeE7 !== undefined || obj.longitudeE7 !== undefined) {
      const lat = obj.latitudeE7;
      const lng = obj.longitudeE7;
      attempts.push({
        path: `${path}.latitudeE7/longitudeE7`,
        success: typeof lat === 'number' && typeof lng === 'number',
        extractedType: 'e7-coords',
        error: typeof lat !== 'number' || typeof lng !== 'number' 
          ? `Invalid types: lat=${typeof lat}, lng=${typeof lng}` 
          : undefined,
      });
    }

    // 時刻フィールドをチェック
    for (const timeKey of ['startTime', 'timestamp', 'endTime']) {
      if (obj[timeKey] !== undefined) {
        const timeVal = obj[timeKey];
        let success = false;
        let error: string | undefined;

        if (typeof timeVal === 'string') {
          const parsed = new Date(timeVal).getTime();
          success = !isNaN(parsed);
          error = isNaN(parsed) ? 'Invalid date string format' : undefined;
        } else if (typeof timeVal === 'number') {
          success = timeVal > 0;
          error = timeVal <= 0 ? 'Invalid timestamp number' : undefined;
        } else {
          error = `Unexpected type: ${typeof timeVal}`;
        }

        attempts.push({
          path: `${path}.${timeKey}`,
          success,
          extractedType: 'timestamp',
          error,
        });
      }
    }

    // 子要素をスタックに追加
    for (const key of Object.keys(obj).slice(0, 20)) {
      const val = obj[key];
      if (val && typeof val === 'object') {
        stack.push({ node: val, path: `${path}.${key}` });
      }
    }
  }

  return attempts;
}

/**
 * 最大深度を計算
 */
function calculateMaxDepth(json: unknown, currentDepth: number = 0, maxCheck: number = 15): number {
  if (currentDepth >= maxCheck) return currentDepth;
  if (!json || typeof json !== 'object') return currentDepth;

  let maxDepth = currentDepth;

  if (Array.isArray(json)) {
    for (const item of json.slice(0, 5)) {
      maxDepth = Math.max(maxDepth, calculateMaxDepth(item, currentDepth + 1, maxCheck));
    }
  } else {
    const keys = Object.keys(json as Record<string, unknown>);
    for (const key of keys.slice(0, 10)) {
      maxDepth = Math.max(
        maxDepth, 
        calculateMaxDepth((json as Record<string, unknown>)[key], currentDepth + 1, maxCheck)
      );
    }
  }

  return maxDepth;
}

/**
 * 推奨事項を生成
 */
function generateRecommendations(
  supportedFormats: DiagnosticReport['supportedFormats'],
  parseAttempts: ParseAttempt[],
  filterStats?: FilterStats
): string[] {
  const recommendations: string[] = [];

  // サポートされているフォーマットが見つからない場合
  const anyFormatFound = supportedFormats.some(f => f.found);
  if (!anyFormatFound) {
    recommendations.push(
      'サポートされている位置情報フォーマットが検出されませんでした。' +
      'Google Takeoutからエクスポートした「タイムライン」データであることを確認してください。'
    );
  }

  // フィルタリング統計に基づく推奨事項（NEW）
  if (filterStats) {
    if (filterStats.noTimestamp > 0) {
      recommendations.push(
        `⚠️ ${filterStats.noTimestamp} 件の位置情報が時刻データなしで検出されました。` +
        '親ノードに startTime/timestamp がない可能性があります。'
      );
    }
    if (filterStats.invalidCoords > 0) {
      recommendations.push(
        `⚠️ ${filterStats.invalidCoords} 件の座標パースエラーが検出されました。` +
        'geo形式またはE7座標のフォーマットが不正な可能性があります。'
      );
    }
    if (filterStats.zeroOrNegativeTs > 0) {
      recommendations.push(
        `⚠️ ${filterStats.zeroOrNegativeTs} 件のデータが無効なタイムスタンプ(ts<=0)で除外されました。`
      );
    }
    if (filterStats.successfulExtraction > 0) {
      recommendations.push(
        `✅ ${filterStats.successfulExtraction} 件の位置情報が正常に検出されました。`
      );
    }
  }

  // パースエラーの傾向を分析
  const failedAttempts = parseAttempts.filter(a => !a.success);
  const failedByType = failedAttempts.reduce((acc, a) => {
    acc[a.extractedType] = (acc[a.extractedType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [type, count] of Object.entries(failedByType)) {
    if (count > 3) {
      recommendations.push(
        `${type} 形式のパースで ${count} 件のエラーが検出されました。` +
        'このフォーマットに対応していない可能性があります。'
      );
    }
  }

  // 特定のフォーマットの推奨
  if (supportedFormats[2].found && supportedFormats[2].count > 0) {
    recommendations.push(
      `timelinePath フォーマットが ${supportedFormats[2].count} 件検出されました（対応済み）`
    );
  }

  if (supportedFormats[1].found && supportedFormats[1].count > 0) {
    recommendations.push(
      `latitudeE7/longitudeE7 フォーマットが ${supportedFormats[1].count} 件検出されました（対応済み）`
    );
  }

  // durationMinutesOffsetの検出（NEW）
  if (supportedFormats[7]?.found && supportedFormats[7].count > 0) {
    recommendations.push(
      `durationMinutesOffset フォーマットが ${supportedFormats[7].count} 件検出されました（timelinePath内の時間オフセット）`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('データ形式は正常に認識されています。');
  }

  return recommendations;
}

/**
 * 診断レポートを生成（完全に匿名化）
 */
export function generateDiagnosticReport(json: unknown): DiagnosticReport {
  const rootSchema = extractSchema(json, 0, 8);
  const { formats: supportedFormats, scanned, limitReached, filterStats, successSamples } = checkSupportedFormats(json);
  const parseAttempts = collectParseAttempts(json);
  const maxDepth = calculateMaxDepth(json);
  
  // ユニークなキーパターンをカウント
  const uniqueKeys = new Set<string>();
  const collectKeys = (schema: SchemaNode) => {
    if (schema.keys) {
      schema.keys.forEach(k => uniqueKeys.add(k));
    }
    if (schema.children) {
      Object.values(schema.children).forEach(collectKeys);
    }
  };
  collectKeys(rootSchema);

  // エラーに stage を追加（失敗段階を特定）
  const errors = parseAttempts
    .filter(a => !a.success && a.error)
    .map(a => {
      let stage: 'coords' | 'timestamp' | 'filter' | 'unknown' = 'unknown';
      
      if (a.extractedType === 'geo-string' || a.extractedType === 'e7-coords') {
        stage = 'coords';
      } else if (a.extractedType === 'timestamp') {
        stage = 'timestamp';
      }
      
      return {
        path: a.path,
        message: a.error!,
        stage,
        schemaAtPath: null as SchemaNode | null, // プライバシーのため詳細スキーマは含めない
      };
    });

  return {
    version: '1.1.0',  // バージョンアップ
    appBuildInfo: __BUILD_INFO__,  // NEW: アプリのビルド情報
    generatedAt: new Date().toISOString(),
    fileStats: {
      estimatedRecords: supportedFormats.reduce((sum: number, f: { count: number }) => sum + f.count, 0),
      maxDepth,
      uniqueKeyPatterns: uniqueKeys.size,
      scannedNodes: scanned,
      scanLimitReached: limitReached,
    },
    filterStats,  // NEW: フィルタリング統計
    successSamples,  // NEW: 成功パスのサンプル
    rootSchema,
    parseAttempts: parseAttempts.slice(0, 50), // 最大50件
    supportedFormats,
    errors: errors.slice(0, 20), // 最大20件
    recommendations: generateRecommendations(supportedFormats, parseAttempts, filterStats),
  };
}

/**
 * 診断レポートをダウンロード可能な形式に変換
 */
export function formatReportForDownload(report: DiagnosticReport): string {
  // 敏感な情報が含まれていないことを確認するヘッダー
  const safetyHeader = `
# Timeline Visualizer - 診断レポート
# =====================================
# このレポートには位置情報、日時、個人情報は含まれていません。
# JSONの「構造」のみを分析した結果です。
# 開発者に安全に共有できます。
# =====================================

`;
  return safetyHeader + JSON.stringify(report, null, 2);
}

/**
 * レポートをクリップボードにコピー（短縮版）
 */
export function formatReportForClipboard(report: DiagnosticReport): string {
  const summary = {
    version: report.version,
    generatedAt: report.generatedAt,
    stats: report.fileStats,
    formats: report.supportedFormats.filter(f => f.found),
    errors: report.errors.length,
    errorSummary: report.errors.slice(0, 5),
    recommendations: report.recommendations,
  };

  return `Timeline Visualizer 診断レポート
=====================================
※ 位置情報・個人情報は含まれていません

${JSON.stringify(summary, null, 2)}`;
}
