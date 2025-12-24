import React, { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker, Polyline, LatLngBounds } from 'leaflet';
import type { Point, MapTheme } from '../types';
import { getTileLayerUrl } from '../utils/mapHelpers';

interface MiniMapProps {
  points: Point[];
  currentIndex: number;
  bounds: LatLngBounds | null;
  mapTheme: MapTheme;
  isVisible: boolean;
}

const MiniMap: React.FC<MiniMapProps> = ({
  points,
  currentIndex,
  bounds,
  mapTheme,
  isVisible,
}) => {
  const miniMapRef = useRef<HTMLDivElement | null>(null);
  const miniMapInstance = useRef<LeafletMap | null>(null);
  const miniPolylineRef = useRef<Polyline | null>(null);
  const miniMarkerRef = useRef<Marker | null>(null);

  // ミニマップ初期化
  useEffect(() => {
    if (!isVisible || !miniMapRef.current || !window.L) return;
    
    if (miniMapInstance.current) return; // 既に初期化済み

    const L = window.L;
    miniMapInstance.current = L.map(miniMapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    // タイルレイヤー追加
    const url = getTileLayerUrl(mapTheme);
    L.tileLayer(url, {
      crossOrigin: 'anonymous',
    }).addTo(miniMapInstance.current);

    // boundsがあればフィット
    if (bounds) {
      miniMapInstance.current.fitBounds(bounds, { padding: [10, 10] });
    }

    return () => {
      if (miniMapInstance.current) {
        miniMapInstance.current.remove();
        miniMapInstance.current = null;
        miniPolylineRef.current = null;
        miniMarkerRef.current = null;
      }
    };
  }, [isVisible]);

  // テーマ変更時にタイルレイヤー更新
  useEffect(() => {
    if (!miniMapInstance.current || !window.L) return;
    
    const L = window.L;
    miniMapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        miniMapInstance.current!.removeLayer(layer);
      }
    });
    
    const url = getTileLayerUrl(mapTheme);
    L.tileLayer(url, {
      crossOrigin: 'anonymous',
    }).addTo(miniMapInstance.current);
  }, [mapTheme]);

  // bounds変更時に表示範囲を更新
  useEffect(() => {
    if (!miniMapInstance.current || !bounds) return;
    miniMapInstance.current.fitBounds(bounds, { padding: [10, 10], animate: false });
  }, [bounds]);

  // ポリラインとマーカーの更新
  useEffect(() => {
    if (!miniMapInstance.current || !window.L || points.length === 0) return;
    
    const L = window.L;
    
    // 全軌跡をポリラインで表示
    const latlngs: [number, number][] = points
      .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map(p => [p.lat, p.lng]);

    if (latlngs.length === 0) return;

    if (miniPolylineRef.current) {
      miniPolylineRef.current.setLatLngs(latlngs);
    } else {
      miniPolylineRef.current = L.polyline(latlngs, {
        color: '#3b82f6',
        weight: 2,
        opacity: 0.5,
      }).addTo(miniMapInstance.current);
    }

    // 現在位置マーカー
    const cp = points[currentIndex];
    if (cp && typeof cp.lat === 'number' && typeof cp.lng === 'number') {
      if (miniMarkerRef.current) {
        miniMarkerRef.current.setLatLng([cp.lat, cp.lng]);
      } else {
        const icon = L.divIcon({
          className: 'mini-map-marker',
          html: `<div style="background-color: #ef4444; width: 8px; height: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });
        miniMarkerRef.current = L.marker([cp.lat, cp.lng], { icon }).addTo(miniMapInstance.current);
      }
    }
  }, [points, currentIndex]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-2 left-2 z-[1000] pointer-events-auto animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div 
          ref={miniMapRef} 
          className="w-28 h-28 sm:w-36 sm:h-36"
          style={{ cursor: 'default' }}
        />
        <div className="px-2 py-1 bg-gray-50/80 border-t border-gray-100">
          <p className="text-[8px] text-gray-500 font-semibold text-center">
            全体マップ
          </p>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;
