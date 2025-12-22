import type { ParsedCoords, Point } from '../types';

/**
 * Parse geo string format (e.g., "geo:35.6812,139.7671")
 */
export const parseGeoString = (str: string): ParsedCoords | null => {
  if (typeof str !== 'string' || !str.startsWith('geo:')) return null;
  const parts = str.replace('geo:', '').split(',');
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
};

/**
 * Extract location points from a timeline object
 */
export const getPointsFromObject = (item: any, contextBaseTime: string | null = null): Array<{lat: number, lng: number, ts: number}> => {
  const results: Array<{lat: number, lng: number, ts: number}> = [];
  if (!item || typeof item !== 'object') return results;
  
  const geoKeys = ['point', 'placeLocation', 'start', 'end', 'location'];
  let foundBaseCoords: ParsedCoords | null = null;
  
  for (const key of geoKeys) {
    if (item[key] && typeof item[key] === 'string' && item[key].startsWith('geo:')) {
      foundBaseCoords = parseGeoString(item[key]);
      if (foundBaseCoords) break;
    }
  }
  
  const startTimeStr = item.startTime || item.timestamp || contextBaseTime;
  let baseTimeMs = startTimeStr ? new Date(startTimeStr).getTime() : null;
  
  if (foundBaseCoords && baseTimeMs) {
    results.push({ ...foundBaseCoords, ts: baseTimeMs });
  }
  
  if (Array.isArray(item.timelinePath) && baseTimeMs) {
    item.timelinePath.forEach((p: any) => {
      const coords = parseGeoString(p.point);
      if (coords) {
        const offsetMinutes = parseInt(p.durationMinutesOffsetFromStartTime) || 0;
        const actualTs = baseTimeMs + (offsetMinutes * 60000);
        results.push({ ...coords, ts: actualTs });
      }
    });
  }
  
  // latitudeE7/longitudeE7 が 0 の場合も正しく処理（赤道直下など）
  if (item.latitudeE7 != null && item.longitudeE7 != null && baseTimeMs) {
    results.push({ lat: item.latitudeE7 / 1e7, lng: item.longitudeE7 / 1e7, ts: baseTimeMs });
  }
  
  return results;
};

/**
 * Process JSON data and extract all location points
 */
export const processData = async (
  json: any,
  onProgress: (progress: number) => void
): Promise<Point[]> => {
  const extracted: Array<{ lat: number; lng: number; ts: number }> = [];
  
  // スタックにデータとコンテキスト(基準時刻)をペアで持たせる（入力JSONを汚染しない）
  const stack: Array<{ node: any; parentTime: string | null }> = [
    { node: json, parentTime: null }
  ];

  const maxScan = 2000000;
  let itemsScanned = 0;

  // 進捗計算用の推定母数（ヒューリスティック値、ファイルサイズにより実際の要素数は異なる）
  const estimatedTotal = 800000;

  while (stack.length > 0 && itemsScanned < maxScan) {
    const { node, parentTime } = stack.pop()!;
    itemsScanned++;

    if (!node || typeof node !== 'object') continue;

    // parentTime を渡すことで timelinePath 等の相対時刻計算が正しく機能する
    const found = getPointsFromObject(node, parentTime);
    if (found.length > 0) extracted.push(...found);

    // 次の階層へ渡す時刻を決定（現在のノードが時刻を持っていればそれを、なければ親の時刻を継承）
    const nextContextTime = node.startTime || node.timestamp || parentTime;

    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) {
        stack.push({ node: node[i], parentTime: nextContextTime });
      }
    } else {
      // Object.valuesを使わずキー走査でメモリ節約（GC負荷軽減）
      const keys = Object.keys(node);
      for (let i = keys.length - 1; i >= 0; i--) {
        const val = node[keys[i]];
        // 配列またはオブジェクトのみ探索対象にする
        if (val && typeof val === 'object') {
          stack.push({ node: val, parentTime: nextContextTime });
        }
      }
    }

    if (itemsScanned % 30000 === 0) {
      onProgress(Math.min(99, Math.round((itemsScanned / estimatedTotal) * 100)));
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  if (extracted.length === 0) {
    throw new Error('位置情報が見つかりませんでした。');
  }

  return extracted
    .filter((p) => p.ts > 0)
    .map((p) => {
      const d = new Date(p.ts);
      return { ...p, year: d.getFullYear() };
    })
    .sort((a, b) => a.ts - b.ts);
};
