/**
 * 統計サマリーカードコンポーネント
 */

import React from 'react';
import { Share2, MapPin, Car, Globe, Calendar, TrendingUp } from 'lucide-react';
import type { TimelineStats } from '../../types';
import { formatDistance, formatLargeNumber } from '../../utils/statsCalculator';

interface StatsCardProps {
  stats: TimelineStats;
  yearRange: { start: number; end: number };
  onShare?: () => void;
  compact?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  stats,
  yearRange,
  onShare,
  compact = false,
}) => {
  const yearText = yearRange.start === yearRange.end
    ? `${yearRange.start}年`
    : `${yearRange.start}-${yearRange.end}年`;

  if (compact) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="text-lg">📊</span>
            {yearText}の記録
          </h3>
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <Share2 size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatItem
            icon={<MapPin size={18} className="text-blue-500" />}
            value={formatLargeNumber(stats.totalPoints)}
            label="ポイント"
          />
          <StatItem
            icon={<Car size={18} className="text-green-500" />}
            value={formatDistance(stats.totalDistance)}
            label="移動"
          />
          <StatItem
            icon={<Globe size={18} className="text-purple-500" />}
            value={stats.earthCircumferences.toFixed(2)}
            label="地球周"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="text-xl">📊</span>
            {yearText}のあなたの移動記録
          </h3>
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Share2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatCard
            icon="📍"
            value={formatLargeNumber(stats.totalPoints)}
            label="ポイント"
            color="blue"
          />
          <StatCard
            icon="🚗"
            value={formatDistance(stats.totalDistance)}
            label="移動距離"
            color="green"
          />
          <StatCard
            icon="🌍"
            value={stats.earthCircumferences.toFixed(2)}
            label="地球周"
            color="purple"
          />
        </div>

        {/* Additional Stats */}
        <div className="space-y-3">
          {/* Longest Trip */}
          {stats.longestTrip && (
            <div className="bg-amber-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="text-lg">🎉</span>
                <span className="font-medium">最長の移動</span>
              </div>
              <p className="text-amber-800 font-bold mt-1">
                {formatDistance(stats.longestTrip.distance)}
              </p>
            </div>
          )}

          {/* Moon Distance */}
          {stats.moonDistancePercent > 0 && (
            <div className="bg-indigo-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <span className="text-lg">🌙</span>
                <span className="font-medium">月までの距離</span>
              </div>
              <p className="text-indigo-800 font-bold mt-1">
                {stats.moonDistancePercent.toFixed(2)}% 達成
              </p>
            </div>
          )}

          {/* Average Points Per Day */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              <span className="font-medium">1日平均</span>
            </div>
            <p className="text-gray-800 font-bold mt-1">
              {stats.averagePointsPerDay.toFixed(1)} ポイント/日
            </p>
          </div>
        </div>

        {/* Yearly Breakdown (if multiple years) */}
        {stats.yearlyBreakdown.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <TrendingUp size={16} />
              年別内訳
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {stats.yearlyBreakdown.map((year) => (
                <div
                  key={year.year}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-gray-600">{year.year}年</span>
                  <span className="text-gray-800">
                    {formatLargeNumber(year.points)}pt / {formatDistance(year.distance)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Button */}
        {onShare && (
          <button
            onClick={onShare}
            className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            この統計をシェアする
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * 統計アイテム（コンパクト版用）
 */
const StatItem: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
}> = ({ icon, value, label }) => (
  <div className="text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

/**
 * 統計カード（フル版用）
 */
const StatCard: React.FC<{
  icon: string;
  value: string;
  label: string;
  color: 'blue' | 'green' | 'purple';
}> = ({ icon, value, label, color }) => {
  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
  };

  return (
    <div className={`${bgColors[color]} rounded-xl p-3 text-center`}>
      <span className="text-2xl">{icon}</span>
      <p className="font-bold text-xl text-gray-800 mt-1">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

export default StatsCard;
