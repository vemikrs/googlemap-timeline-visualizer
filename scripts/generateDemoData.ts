/**
 * デモ用位置情報履歴データ生成スクリプト
 * 
 * ペルソナ: 会社員の女性、25歳
 * 期間: 2023年1月1日〜2025年12月31日
 * 
 * 実行: npx ts-node scripts/generateDemoData.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 固定位置
const LOCATIONS = {
  // 自宅: 千葉県松戸市（東松戸中央公園付近）
  home: { lat: 35.7732402, lng: 139.9414015, name: '自宅' },
  // 会社: 東京都千代田区（日比谷公園付近）
  office: { lat: 35.673738, lng: 139.7562857, name: '会社' },
  
  // 千葉県内のカフェ・商業施設（休日用）
  chibaSpots: [
    { lat: 35.7796, lng: 139.9311, name: 'イオンモール新松戸' },
    { lat: 35.7654, lng: 139.8975, name: 'ららテラス' },
    { lat: 35.7891, lng: 139.9542, name: '松戸駅周辺' },
    { lat: 35.6996, lng: 139.9713, name: 'IKEA Tokyo-Bay' },
    { lat: 35.6329, lng: 140.0376, name: '幕張メッセ周辺' },
    { lat: 35.6585, lng: 139.9884, name: '船橋ららぽーと' },
    { lat: 35.8617, lng: 139.9551, name: '柏の葉T-SITE' },
    { lat: 35.8500, lng: 139.9689, name: '柏駅周辺' },
    { lat: 35.7081, lng: 140.1125, name: '千葉駅周辺' },
  ],
  
  // 新宿（金曜日の寄り道）
  shinjuku: [
    { lat: 35.6896, lng: 139.7006, name: '新宿駅周辺' },
    { lat: 35.6938, lng: 139.7034, name: '新宿伊勢丹' },
    { lat: 35.6905, lng: 139.6995, name: '新宿ルミネ' },
    { lat: 35.6917, lng: 139.7003, name: '新宿カフェ' },
  ],
  
  // 旅行先
  travel: {
    osaka: [
      { lat: 34.6937, lng: 135.5023, name: '大阪駅' },
      { lat: 34.6687, lng: 135.5030, name: '難波' },
      { lat: 34.6851, lng: 135.5265, name: '大阪城' },
      { lat: 34.6544, lng: 135.5062, name: '天王寺' },
      { lat: 34.7024, lng: 135.4959, name: '梅田' },
      { lat: 34.6687, lng: 135.4291, name: 'USJ' },
    ],
    nagoya: [
      { lat: 35.1709, lng: 136.8815, name: '名古屋駅' },
      { lat: 35.1855, lng: 136.8990, name: '名古屋城' },
      { lat: 35.1707, lng: 136.9066, name: '栄' },
      { lat: 35.1547, lng: 136.9209, name: '熱田神宮' },
      { lat: 35.1625, lng: 136.9064, name: '大須' },
    ],
    fukuoka: [
      { lat: 33.5902, lng: 130.4206, name: '博多駅' },
      { lat: 33.5898, lng: 130.3986, name: '天神' },
      { lat: 33.5841, lng: 130.3465, name: '福岡タワー' },
      { lat: 33.5631, lng: 130.4083, name: '太宰府天満宮' },
      { lat: 33.6033, lng: 130.4181, name: '中洲' },
    ],
  },
  
  // 季節イベント
  events: {
    // 初詣
    hatsumode: [
      { lat: 35.6764, lng: 139.6993, name: '明治神宮', month: 1, day: 1 },
      { lat: 35.7148, lng: 139.7967, name: '浅草寺', month: 1, day: 2 },
    ],
    // 花見
    hanami: [
      { lat: 35.7146, lng: 139.7732, name: '上野公園', month: 3, endMonth: 4 },
      { lat: 35.6762, lng: 139.7714, name: '千鳥ヶ淵', month: 3, endMonth: 4 },
    ],
    // 長岡花火大会 (8/3固定)
    nagaokaFireworks: { lat: 37.4483, lng: 138.8509, name: '長岡花火大会', month: 8, day: 3 },
    // 夏祭り
    summerFestival: [
      { lat: 35.7106, lng: 139.8103, name: '隅田川花火大会', month: 7 },
    ],
    // 紅葉
    autumn: [
      { lat: 35.6586, lng: 139.7454, name: '代々木公園紅葉', month: 11 },
      { lat: 35.6994, lng: 139.5743, name: '高尾山', month: 11 },
    ],
    // クリスマス
    christmas: [
      { lat: 35.6654, lng: 139.7707, name: '東京ミッドタウン', month: 12 },
      { lat: 35.4553, lng: 139.6336, name: '横浜みなとみらい', month: 12 },
    ],
  },
};

// 通勤経路のポイント（自宅→会社）
const COMMUTE_POINTS = [
  { lat: 35.7732, lng: 139.9414 }, // 自宅
  { lat: 35.7621, lng: 139.9125 }, // 東松戸駅
  { lat: 35.7284, lng: 139.8687 }, // 松戸駅
  { lat: 35.7100, lng: 139.8109 }, // 北千住
  { lat: 35.6938, lng: 139.7714 }, // 上野
  { lat: 35.6812, lng: 139.7671 }, // 秋葉原
  { lat: 35.6762, lng: 139.7580 }, // 有楽町
  { lat: 35.6738, lng: 139.7563 }, // 会社
];

interface Point {
  lat: number;
  lng: number;
  ts: number;
}

// ランダムな微小変動を加える（自然さのため）
function jitter(value: number, amount: number = 0.001): number {
  return value + (Math.random() - 0.5) * amount;
}

// 2点間を補間
function interpolate(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  steps: number
): Array<{ lat: number; lng: number }> {
  const result: Array<{ lat: number; lng: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    result.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    });
  }
  return result;
}

// 通勤データ生成
function generateCommute(
  date: Date,
  startHour: number,
  isGoingToWork: boolean,
  extraStops?: Array<{ lat: number; lng: number; stayMinutes: number }>
): Point[] {
  const points: Point[] = [];
  const route = isGoingToWork ? [...COMMUTE_POINTS] : [...COMMUTE_POINTS].reverse();
  
  let currentTime = new Date(date);
  currentTime.setHours(startHour, Math.floor(Math.random() * 15), 0, 0);
  
  // 通勤時間は約60-80分
  const totalMinutes = 60 + Math.floor(Math.random() * 20);
  const minutesPerSegment = totalMinutes / (route.length - 1);
  
  for (let i = 0; i < route.length; i++) {
    const point = route[i];
    // 駅での乗り換え待ち（1-3分）
    if (i > 0 && i < route.length - 1) {
      currentTime = new Date(currentTime.getTime() + (1 + Math.random() * 2) * 60000);
    }
    
    points.push({
      lat: jitter(point.lat),
      lng: jitter(point.lng),
      ts: currentTime.getTime(),
    });
    
    if (i < route.length - 1) {
      currentTime = new Date(currentTime.getTime() + minutesPerSegment * 60000);
    }
  }
  
  // 寄り道がある場合
  if (extraStops && !isGoingToWork) {
    for (const stop of extraStops) {
      // 移動（20-30分）
      currentTime = new Date(currentTime.getTime() + (20 + Math.random() * 10) * 60000);
      points.push({
        lat: jitter(stop.lat),
        lng: jitter(stop.lng),
        ts: currentTime.getTime(),
      });
      
      // 滞在
      currentTime = new Date(currentTime.getTime() + stop.stayMinutes * 60000);
      points.push({
        lat: jitter(stop.lat, 0.0005),
        lng: jitter(stop.lng, 0.0005),
        ts: currentTime.getTime(),
      });
    }
  }
  
  return points;
}

// 休日のお出かけデータ生成
function generateWeekendOuting(date: Date): Point[] {
  const points: Point[] = [];
  
  // 朝（家で少しだけ記録）
  const morning = new Date(date);
  morning.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0);
  points.push({
    lat: jitter(LOCATIONS.home.lat),
    lng: jitter(LOCATIONS.home.lng),
    ts: morning.getTime(),
  });
  
  // 出発（10-12時）
  const departure = new Date(date);
  departure.setHours(10 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
  
  // 千葉県内のスポットを1-3箇所訪問
  const numSpots = 1 + Math.floor(Math.random() * 3);
  const spots = [...LOCATIONS.chibaSpots].sort(() => Math.random() - 0.5).slice(0, numSpots);
  
  let currentTime = departure;
  
  for (const spot of spots) {
    // 移動（30-60分）
    currentTime = new Date(currentTime.getTime() + (30 + Math.random() * 30) * 60000);
    points.push({
      lat: jitter(spot.lat),
      lng: jitter(spot.lng),
      ts: currentTime.getTime(),
    });
    
    // 滞在（1-3時間）
    const stayHours = 1 + Math.random() * 2;
    currentTime = new Date(currentTime.getTime() + stayHours * 3600000);
    points.push({
      lat: jitter(spot.lat, 0.0005),
      lng: jitter(spot.lng, 0.0005),
      ts: currentTime.getTime(),
    });
  }
  
  // 帰宅（18-21時）
  const returnHome = new Date(date);
  returnHome.setHours(18 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
  if (returnHome.getTime() < currentTime.getTime()) {
    returnHome.setTime(currentTime.getTime() + 60 * 60000);
  }
  
  points.push({
    lat: jitter(LOCATIONS.home.lat),
    lng: jitter(LOCATIONS.home.lng),
    ts: returnHome.getTime(),
  });
  
  return points;
}

// 旅行データ生成
function generateTrip(
  startDate: Date,
  nights: number,
  destination: 'osaka' | 'nagoya' | 'fukuoka'
): Point[] {
  const points: Point[] = [];
  const spots = LOCATIONS.travel[destination];
  
  // 出発日朝（自宅）
  const departureTime = new Date(startDate);
  departureTime.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0);
  points.push({
    lat: jitter(LOCATIONS.home.lat),
    lng: jitter(LOCATIONS.home.lng),
    ts: departureTime.getTime(),
  });
  
  // 東京駅
  const tokyoStation = { lat: 35.6812, lng: 139.7671 };
  const tokyoTime = new Date(departureTime.getTime() + 90 * 60000);
  points.push({
    lat: jitter(tokyoStation.lat),
    lng: jitter(tokyoStation.lng),
    ts: tokyoTime.getTime(),
  });
  
  // 新幹線移動（2-5時間）
  const travelHours = destination === 'fukuoka' ? 5 : destination === 'osaka' ? 2.5 : 2;
  let currentTime = new Date(tokyoTime.getTime() + travelHours * 3600000);
  
  // 目的地到着
  points.push({
    lat: jitter(spots[0].lat),
    lng: jitter(spots[0].lng),
    ts: currentTime.getTime(),
  });
  
  // 各日の観光
  for (let day = 0; day <= nights; day++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + day);
    
    // 1日に2-4スポット訪問
    const numSpots = 2 + Math.floor(Math.random() * 3);
    const daySpots = [...spots].sort(() => Math.random() - 0.5).slice(0, numSpots);
    
    const startHour = day === 0 ? currentTime.getHours() + 1 : 9;
    let dayTime = new Date(dayDate);
    dayTime.setHours(startHour, Math.floor(Math.random() * 30), 0, 0);
    
    for (const spot of daySpots) {
      // 移動（20-40分）
      dayTime = new Date(dayTime.getTime() + (20 + Math.random() * 20) * 60000);
      points.push({
        lat: jitter(spot.lat),
        lng: jitter(spot.lng),
        ts: dayTime.getTime(),
      });
      
      // 滞在（1-2時間）
      dayTime = new Date(dayTime.getTime() + (1 + Math.random()) * 3600000);
      points.push({
        lat: jitter(spot.lat, 0.0003),
        lng: jitter(spot.lng, 0.0003),
        ts: dayTime.getTime(),
      });
    }
    
    currentTime = dayTime;
  }
  
  // 帰り
  const returnDate = new Date(startDate);
  returnDate.setDate(returnDate.getDate() + nights);
  returnDate.setHours(16 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 30), 0, 0);
  
  // 帰りの新幹線
  const returnTokyoTime = new Date(returnDate.getTime() + travelHours * 3600000);
  points.push({
    lat: jitter(tokyoStation.lat),
    lng: jitter(tokyoStation.lng),
    ts: returnTokyoTime.getTime(),
  });
  
  // 帰宅
  const homeTime = new Date(returnTokyoTime.getTime() + 90 * 60000);
  points.push({
    lat: jitter(LOCATIONS.home.lat),
    lng: jitter(LOCATIONS.home.lng),
    ts: homeTime.getTime(),
  });
  
  return points;
}

// 季節イベントデータ生成
function generateSeasonalEvent(date: Date, event: { lat: number; lng: number; name: string }): Point[] {
  const points: Point[] = [];
  
  // 朝出発
  const departure = new Date(date);
  departure.setHours(8 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 30), 0, 0);
  points.push({
    lat: jitter(LOCATIONS.home.lat),
    lng: jitter(LOCATIONS.home.lng),
    ts: departure.getTime(),
  });
  
  // イベント会場到着（1-2時間後）
  const arrival = new Date(departure.getTime() + (1 + Math.random()) * 3600000);
  points.push({
    lat: jitter(event.lat),
    lng: jitter(event.lng),
    ts: arrival.getTime(),
  });
  
  // イベント滞在（2-5時間）
  const stayHours = 2 + Math.random() * 3;
  const leave = new Date(arrival.getTime() + stayHours * 3600000);
  points.push({
    lat: jitter(event.lat, 0.002),
    lng: jitter(event.lng, 0.002),
    ts: leave.getTime(),
  });
  
  // 帰宅
  const returnHome = new Date(leave.getTime() + (1 + Math.random()) * 3600000);
  points.push({
    lat: jitter(LOCATIONS.home.lat),
    lng: jitter(LOCATIONS.home.lng),
    ts: returnHome.getTime(),
  });
  
  return points;
}

// 長岡花火大会（特別イベント：泊まりがけ）
function generateNagaokaFireworks(year: number): Point[] {
  const points: Point[] = [];
  const date = new Date(year, 7, 3); // 8月3日
  
  // 朝出発
  const departure = new Date(date);
  departure.setHours(10, Math.floor(Math.random() * 30), 0, 0);
  points.push({
    lat: jitter(LOCATIONS.home.lat),
    lng: jitter(LOCATIONS.home.lng),
    ts: departure.getTime(),
  });
  
  // 東京駅
  const tokyoTime = new Date(departure.getTime() + 90 * 60000);
  points.push({
    lat: jitter(35.6812),
    lng: jitter(139.7671),
    ts: tokyoTime.getTime(),
  });
  
  // 長岡到着（約2時間）
  const nagaokaArrival = new Date(tokyoTime.getTime() + 2 * 3600000);
  points.push({
    lat: jitter(37.4483),
    lng: jitter(138.8509),
    ts: nagaokaArrival.getTime(),
  });
  
  // 花火会場周辺を散策
  const walk1 = new Date(nagaokaArrival.getTime() + 2 * 3600000);
  points.push({
    lat: jitter(37.4520, 0.003),
    lng: jitter(138.8480, 0.003),
    ts: walk1.getTime(),
  });
  
  // 花火開始（19:20頃）
  const fireworksStart = new Date(date);
  fireworksStart.setHours(19, 20, 0, 0);
  points.push({
    lat: jitter(37.4490),
    lng: jitter(138.8520),
    ts: fireworksStart.getTime(),
  });
  
  // 花火終了（21:10頃）
  const fireworksEnd = new Date(date);
  fireworksEnd.setHours(21, 10, 0, 0);
  points.push({
    lat: jitter(37.4485),
    lng: jitter(138.8515),
    ts: fireworksEnd.getTime(),
  });
  
  // 翌日帰宅
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(10, Math.floor(Math.random() * 30), 0, 0);
  points.push({
    lat: jitter(37.4483),
    lng: jitter(138.8509),
    ts: nextDay.getTime(),
  });
  
  // 帰宅
  const returnHome = new Date(nextDay.getTime() + 4 * 3600000);
  points.push({
    lat: jitter(LOCATIONS.home.lat),
    lng: jitter(LOCATIONS.home.lng),
    ts: returnHome.getTime(),
  });
  
  return points;
}

// メイン生成関数
function generateDemoData(): Point[] {
  const allPoints: Point[] = [];
  const startDate = new Date(2023, 0, 1);
  const endDate = new Date(2025, 11, 31);
  
  // 旅行スケジュールを事前に決定
  const tripDates: Map<string, { destination: 'osaka' | 'nagoya' | 'fukuoka'; nights: number }> = new Map();
  
  // 各月に1-3回の旅行を設定（季節による偏り）
  for (let year = 2023; year <= 2025; year++) {
    for (let month = 0; month < 12; month++) {
      const numTrips = Math.random() < 0.3 ? 2 : 1; // 30%の確率で2回
      
      for (let t = 0; t < numTrips; t++) {
        // 週末を選ぶ
        const weekendDay = 7 + Math.floor(Math.random() * 3) * 7 + t * 7;
        const tripDate = new Date(year, month, Math.min(weekendDay, 28));
        
        // 季節による旅行先の偏り
        let destination: 'osaka' | 'nagoya' | 'fukuoka';
        if (month >= 3 && month <= 5) {
          // 春は大阪（桜）
          destination = Math.random() < 0.6 ? 'osaka' : Math.random() < 0.5 ? 'nagoya' : 'fukuoka';
        } else if (month >= 9 && month <= 11) {
          // 秋は名古屋・大阪
          destination = Math.random() < 0.5 ? 'nagoya' : Math.random() < 0.6 ? 'osaka' : 'fukuoka';
        } else if (month >= 6 && month <= 8) {
          // 夏は福岡
          destination = Math.random() < 0.5 ? 'fukuoka' : Math.random() < 0.5 ? 'osaka' : 'nagoya';
        } else {
          // その他はランダム
          const r = Math.random();
          destination = r < 0.33 ? 'osaka' : r < 0.66 ? 'nagoya' : 'fukuoka';
        }
        
        const nights = Math.random() < 0.6 ? 1 : 2;
        const dateKey = `${year}-${month}-${tripDate.getDate()}`;
        tripDates.set(dateKey, { destination, nights });
      }
    }
  }
  
  // 日付をイテレート
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const dayOfWeek = currentDate.getDay();
    const dateKey = `${year}-${month}-${day}`;
    
    // 旅行日かチェック
    const tripInfo = tripDates.get(dateKey);
    if (tripInfo) {
      const tripPoints = generateTrip(currentDate, tripInfo.nights, tripInfo.destination);
      allPoints.push(...tripPoints);
      // 旅行日数分スキップ
      currentDate.setDate(currentDate.getDate() + tripInfo.nights + 1);
      continue;
    }
    
    // 旅行中かチェック（前日からの旅行）
    let isInTrip = false;
    for (let i = 1; i <= 2; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - i);
      const prevKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}-${prevDate.getDate()}`;
      const prevTrip = tripDates.get(prevKey);
      if (prevTrip && prevTrip.nights >= i) {
        isInTrip = true;
        break;
      }
    }
    
    if (isInTrip) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // 季節イベント
    // 長岡花火大会（8/3）
    if (month === 7 && day === 3) {
      allPoints.push(...generateNagaokaFireworks(year));
      currentDate.setDate(currentDate.getDate() + 2);
      continue;
    }
    
    // 初詣（1/1-1/3）
    if (month === 0 && day >= 1 && day <= 3) {
      const event = LOCATIONS.events.hatsumode[day - 1] || LOCATIONS.events.hatsumode[0];
      allPoints.push(...generateSeasonalEvent(currentDate, event));
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // 花見（3月下旬〜4月上旬の週末）
    if ((month === 2 && day >= 25) || (month === 3 && day <= 10)) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const event = LOCATIONS.events.hanami[Math.floor(Math.random() * LOCATIONS.events.hanami.length)];
        allPoints.push(...generateSeasonalEvent(currentDate, event));
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
    }
    
    // 隅田川花火大会（7月最終土曜日付近）
    if (month === 6 && day >= 20 && day <= 31 && dayOfWeek === 6) {
      const event = LOCATIONS.events.summerFestival[0];
      allPoints.push(...generateSeasonalEvent(currentDate, event));
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // 紅葉（11月の週末）
    if (month === 10 && (dayOfWeek === 0 || dayOfWeek === 6)) {
      if (Math.random() < 0.3) {
        const event = LOCATIONS.events.autumn[Math.floor(Math.random() * LOCATIONS.events.autumn.length)];
        allPoints.push(...generateSeasonalEvent(currentDate, event));
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
    }
    
    // クリスマス周辺（12月23-25日）
    if (month === 11 && day >= 23 && day <= 25) {
      const event = LOCATIONS.events.christmas[Math.floor(Math.random() * LOCATIONS.events.christmas.length)];
      allPoints.push(...generateSeasonalEvent(currentDate, event));
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    // 通常の日
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // 平日：通勤
      
      // 朝（自宅、1点だけ）
      const morningHome = new Date(currentDate);
      morningHome.setHours(7, Math.floor(Math.random() * 30), 0, 0);
      allPoints.push({
        lat: jitter(LOCATIONS.home.lat),
        lng: jitter(LOCATIONS.home.lng),
        ts: morningHome.getTime(),
      });
      
      // 出勤（7:30-8:30）
      const toWork = generateCommute(currentDate, 7 + Math.floor(Math.random() * 1.5), true);
      allPoints.push(...toWork);
      
      // 会社（昼休み1回だけ記録）
      const lunchTime = new Date(currentDate);
      lunchTime.setHours(12, Math.floor(Math.random() * 30), 0, 0);
      allPoints.push({
        lat: jitter(LOCATIONS.office.lat, 0.002),
        lng: jitter(LOCATIONS.office.lng, 0.002),
        ts: lunchTime.getTime(),
      });
      
      // 退勤
      if (dayOfWeek === 5) {
        // 金曜日：新宿に寄り道
        const shinjukuStop = LOCATIONS.shinjuku[Math.floor(Math.random() * LOCATIONS.shinjuku.length)];
        const fromWork = generateCommute(currentDate, 18 + Math.floor(Math.random() * 1), false, [
          { lat: shinjukuStop.lat, lng: shinjukuStop.lng, stayMinutes: 60 + Math.floor(Math.random() * 60) },
        ]);
        allPoints.push(...fromWork);
      } else {
        // 通常退勤
        const fromWork = generateCommute(currentDate, 18 + Math.floor(Math.random() * 2), false);
        allPoints.push(...fromWork);
      }
      
      // 夜（自宅、1点だけ）
      const eveningHome = new Date(currentDate);
      eveningHome.setHours(22, Math.floor(Math.random() * 60), 0, 0);
      allPoints.push({
        lat: jitter(LOCATIONS.home.lat),
        lng: jitter(LOCATIONS.home.lng),
        ts: eveningHome.getTime(),
      });
      
    } else {
      // 週末：お出かけまたは家でゆっくり
      if (Math.random() < 0.7) {
        // 70%の確率でお出かけ
        allPoints.push(...generateWeekendOuting(currentDate));
      } else {
        // 30%の確率で家でゆっくり（数点だけ）
        const morning = new Date(currentDate);
        morning.setHours(10, Math.floor(Math.random() * 60), 0, 0);
        allPoints.push({
          lat: jitter(LOCATIONS.home.lat, 0.0003),
          lng: jitter(LOCATIONS.home.lng, 0.0003),
          ts: morning.getTime(),
        });
        
        const afternoon = new Date(currentDate);
        afternoon.setHours(15, Math.floor(Math.random() * 60), 0, 0);
        allPoints.push({
          lat: jitter(LOCATIONS.home.lat, 0.0003),
          lng: jitter(LOCATIONS.home.lng, 0.0003),
          ts: afternoon.getTime(),
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // タイムスタンプでソート
  allPoints.sort((a, b) => a.ts - b.ts);
  
  return allPoints;
}

// Google Takeout形式に変換
function convertToGoogleFormat(points: Point[]): object {
  return {
    semanticSegments: points.map((p) => ({
      startTime: new Date(p.ts).toISOString(),
      timelinePath: [
        {
          point: `geo:${p.lat.toFixed(7)},${p.lng.toFixed(7)}`,
          durationMinutesOffsetFromStartTime: '0',
        },
      ],
    })),
  };
}

// 実行
const points = generateDemoData();
console.log(`Generated ${points.length} points`);

const googleFormat = convertToGoogleFormat(points);
const outputPath = path.join(__dirname, '..', 'public', 'demo-location-history.json');

fs.writeFileSync(outputPath, JSON.stringify(googleFormat, null, 2));
console.log(`Saved to ${outputPath}`);

// 統計情報
const years = [...new Set(points.map((p) => new Date(p.ts).getFullYear()))];
console.log(`Years: ${years.join(', ')}`);
console.log(`Date range: ${new Date(points[0].ts).toLocaleDateString()} - ${new Date(points[points.length - 1].ts).toLocaleDateString()}`);
