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
  
  if (item.latitudeE7 && item.longitudeE7 && baseTimeMs) {
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
  const extracted: Array<{lat: number, lng: number, ts: number}> = [];
  const stack: any[] = [json];
  const maxScan = 2000000;
  let itemsScanned = 0;
  
  while (stack.length > 0 && itemsScanned < maxScan) {
    const current = stack.pop();
    itemsScanned++;
    if (!current) continue;
    
    const found = getPointsFromObject(current);
    if (found.length > 0) extracted.push(...found);
    
    if (typeof current === 'object') {
      const values = Array.isArray(current) ? current : Object.values(current);
      for (let i = values.length - 1; i >= 0; i--) {
        const val = values[i];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          if (current.startTime) val._contextStartTime = current.startTime;
          stack.push(val);
        } else if (Array.isArray(val)) {
          stack.push(val);
        }
      }
    }
    
    if (itemsScanned % 30000 === 0) {
      onProgress(Math.min(99, Math.round((itemsScanned / 800000) * 100)));
      await new Promise(r => setTimeout(r, 0));
    }
  }
  
  if (extracted.length === 0) {
    throw new Error('位置情報が見つかりませんでした。');
  }
  
  return extracted
    .filter(p => p.ts > 0)
    .map(p => {
      const d = new Date(p.ts);
      return { ...p, year: d.getFullYear() };
    })
    .sort((a, b) => a.ts - b.ts);
};
