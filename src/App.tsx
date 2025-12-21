import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Upload, 
  Settings, 
  RotateCcw, 
  Map as MapIcon, 
  ChevronDown,
  Trash2,
  AlertCircle,
  Calendar,
  Crosshair,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { Map as LeafletMap, Polyline, Marker } from 'leaflet';
import type { Point, MapTheme } from './types';
import { processData } from './utils/dataProcessor';
import { loadLeaflet, getTileLayerUrl } from './utils/mapHelpers';

/**
 * Google Maps Timeline Visualizer (Location History JSON Optimized)
 * 修正版: 日本地図レベルの定点モードと、現在地へのフォーカスボタンを追加。
 */

const App: React.FC = () => {
  // --- States ---
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [rawPoints, setRawPoints] = useState<Point[]>([]); 
  const [points, setPoints] = useState<Point[]>([]); 
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | 'all'>('all');
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(5); 
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [samplingRate, setSamplingRate] = useState<number>(5); 
  const [mapTheme, setMapTheme] = useState<MapTheme>('light'); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isWideView, setIsWideView] = useState<boolean>(false);

  // --- Refs ---
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const polylineRef = useRef<Polyline | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const animationRef = useRef<number | null>(null);

  // --- Map Initialization ---
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    loadLeaflet().then(() => {
      if (!window.L || !mapRef.current || mapInstance.current) return;
      const L = window.L;
      mapInstance.current = L.map(mapRef.current, { 
        zoomControl: false, 
        preferCanvas: true 
      }).setView([36.2048, 138.2529], 5);
      
      updateTileLayer();
    }).catch(err => {
      setErrorMsg('マップの初期化に失敗しました: ' + err.message);
    });

    return () => { 
      if (mapInstance.current) { 
        mapInstance.current.remove(); 
        mapInstance.current = null; 
      } 
    };
  }, []);

  const updateTileLayer = () => {
    if (!mapInstance.current || !window.L) return;
    const L = window.L;
    
    mapInstance.current.eachLayer((layer) => { 
      if (layer instanceof L.TileLayer) {
        mapInstance.current!.removeLayer(layer); 
      }
    });
    
    const url = getTileLayerUrl(mapTheme);
    L.tileLayer(url, { 
      attribution: '&copy; OpenStreetMap' 
    }).addTo(mapInstance.current);
  };

  useEffect(() => {
    updateTileLayer();
  }, [mapTheme]);

  // --- Wide View Mode Logic ---
  useEffect(() => {
    if (!mapInstance.current || !points.length) return;
    if (isWideView) {
      mapInstance.current.setView([36.2048, 138.2529], 5, { animate: true });
    } else if (currentIndex < points.length) {
      const cp = points[currentIndex];
      if (cp) {
        mapInstance.current.setView([cp.lat, cp.lng], 13, { animate: true });
      }
    }
  }, [isWideView, points.length, currentIndex]);

  // --- Helper Functions ---
  const focusOnCurrent = () => {
    if (!mapInstance.current || points.length === 0) return;
    const cp = points[currentIndex];
    if (!cp) return;
    setIsWideView(false);
    mapInstance.current.setView([cp.lat, cp.lng], 15, { animate: true });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true); 
    setProgress(5); 
    setErrorMsg(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const allPoints = await processData(json, setProgress);
        setRawPoints(allPoints);
        
        const years = [...new Set(allPoints.filter(p => p.year > 2000).map(p => p.year))].sort((a, b) => b - a);
        setAvailableYears(years);
        if (years.length > 0) setSelectedYear(years[0].toString());
      } catch (err) { 
        setErrorMsg((err as Error).message); 
      } finally { 
        setIsProcessing(false); 
        setProgress(100); 
      }
    };
    reader.readAsText(file);
  };

  // --- Filtering & Sampling ---
  useEffect(() => {
    let filtered = rawPoints;
    if (selectedYear !== 'all') {
      filtered = rawPoints.filter(p => p.year === parseInt(selectedYear));
    }
    
    const autoSampling = Math.max(1, Math.floor(filtered.length / 3000));
    const finalSampling = Math.max(samplingRate, autoSampling);
    const sampled = filtered.filter((_, idx) => idx % finalSampling === 0);
    
    setPoints(sampled);
    setCurrentIndex(0);
    setIsPlaying(false);
    
    if (sampled.length > 0 && mapInstance.current && !isWideView) {
      mapInstance.current.setView([sampled[0].lat, sampled[0].lng], 12);
    }
  }, [rawPoints, selectedYear, samplingRate, isWideView]);

  // --- Animation Loop ---
  useEffect(() => {
    if (isPlaying && currentIndex < points.length - 1) {
      const step = () => {
        setCurrentIndex(prev => {
          const next = prev + playbackSpeed;
          if (next >= points.length - 1) { 
            setIsPlaying(false); 
            return points.length - 1; 
          }
          return next;
        });
        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, points.length, playbackSpeed, currentIndex]);

  // --- Rendering Points on Map ---
  useEffect(() => {
    if (!mapInstance.current || points.length === 0 || !window.L) return;
    if (currentIndex >= points.length || currentIndex < 0) return;
    
    const L = window.L;
    const latlngs: [number, number][] = points
      .slice(0, currentIndex + 1)
      .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map(p => [p.lat, p.lng]);

    if (latlngs.length === 0) return;

    // Update or create polyline
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latlngs);
    } else {
      try {
        polylineRef.current = L.polyline(latlngs, { 
          color: '#3b82f6', 
          weight: 6, 
          opacity: 0.8, 
          lineJoin: 'round' 
        }).addTo(mapInstance.current);
      } catch (err) {
        console.error('Polyline creation error:', err);
        return;
      }
    }

    // Update or create marker
    const cp = points[currentIndex];
    if (!cp || typeof cp.lat !== 'number' || typeof cp.lng !== 'number') return;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([cp.lat, cp.lng]);
    } else {
      try {
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #3b82f6; width: 22px; height: 22px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 20px rgba(59,130,246,0.6); animation: pulse 1.5s infinite;"></div>`,
          iconSize: [22, 22], 
          iconAnchor: [11, 11]
        });
        markerRef.current = L.marker([cp.lat, cp.lng], { icon }).addTo(mapInstance.current);
      } catch (err) {
        console.error('Marker creation error:', err);
        return;
      }
    }
    
    // Auto-panning: only if not in wide view
    if (isPlaying && !isWideView) {
      mapInstance.current.panTo([cp.lat, cp.lng], { animate: true, duration: 0.1 });
    }
  }, [currentIndex, points, isWideView, isPlaying]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans select-none">
      {/* Header UI */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/40 pointer-events-auto">
          <h1 className="text-sm font-black text-gray-800 flex items-center gap-2 tracking-tight uppercase">
            <MapIcon size={16} className="text-blue-500" />
            Timeline Tracker
          </h1>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          {/* Mode Toggle Button */}
          <button 
            onClick={() => setIsWideView(!isWideView)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl border transition-all ${isWideView ? 'bg-blue-500 text-white border-blue-600' : 'bg-white/95 text-gray-600 border-white/40'}`}
          >
            {isWideView ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            <span className="text-xs font-black">{isWideView ? '追従' : '広域'}</span>
          </button>
          
          <button onClick={() => setShowSettings(!showSettings)} className="bg-white/95 backdrop-blur-xl p-2.5 rounded-2xl shadow-xl border border-white/40 text-gray-600">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div ref={mapRef} className="flex-1 w-full h-full z-0" />

      {/* Floating Focus Button */}
      {points.length > 0 && (
        <button 
          onClick={focusOnCurrent}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] bg-white p-4 rounded-full shadow-2xl border border-gray-100 text-blue-500 active:scale-90 transition-transform"
          title="現在地にフォーカス"
        >
          <Crosshair size={24} />
        </button>
      )}

      {showSettings && (
        <div className="absolute inset-0 z-[2000] bg-black/40 flex items-center justify-center p-6 animate-in fade-in backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-8 overflow-hidden">
            <div className="flex justify-between items-center">
              <h2 className="font-black text-xl text-gray-800">アプリ設定</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 p-2"><ChevronDown size={28} /></button>
            </div>
            <div className="space-y-6 text-sm font-medium">
              <div className="space-y-3">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">表示する年</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  <button onClick={() => setSelectedYear('all')} className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase ${selectedYear === 'all' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-50 text-gray-500'}`}>ALL</button>
                  {availableYears.map(y => (
                    <button key={y} onClick={() => setSelectedYear(y.toString())} className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase ${selectedYear === y.toString() ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-50 text-gray-500'}`}>{y}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">地図のスタイル</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'satellite'] as const).map(t => (
                    <button key={t} onClick={() => setMapTheme(t)} className={`py-3.5 rounded-2xl border text-[10px] font-black uppercase ${mapTheme === t ? 'bg-blue-500 border-blue-500 text-white shadow-lg' : 'bg-gray-50 text-gray-500'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button onClick={() => { setRawPoints([]); setPoints([]); setShowSettings(false); }} className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 font-black rounded-2xl">
                  <Trash2 size={20} /> データをリセット
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controller HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 flex flex-col pointer-events-none pb-12">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] border border-white/50 p-8 pointer-events-auto max-w-xl mx-auto w-full transition-all">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-3 animate-in fade-in">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-500 font-bold">{errorMsg}</p>
            </div>
          )}

          {points.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-6">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"><Upload size={40} /></div>
              <div className="text-center px-4">
                <h3 className="font-black text-2xl text-gray-800 tracking-tight">Timeline Visualizer</h3>
                <p className="text-sm text-gray-400 mt-2 font-medium">ロケーション履歴JSONを選択してください</p>
              </div>
              <label className="w-full">
                <input type="file" accept=".json,.geojson" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
                <div className={`w-full font-black py-5.5 rounded-3xl flex items-center justify-center gap-3 shadow-xl ${isProcessing ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white shadow-blue-200'}`}>
                  {isProcessing ? <span>解析中 {progress}%</span> : 'ファイルを選択'}
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-end px-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-500 font-black">
                    <Calendar size={12} />
                    <p className="text-[10px] uppercase tracking-widest">{selectedYear === 'all' ? 'All Years' : `${selectedYear} Year`}</p>
                  </div>
                  <h4 className="text-2xl font-mono font-black text-gray-800 tracking-tighter">
                    {points[currentIndex]?.ts ? new Date(points[currentIndex].ts).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--/--/-- --:--'}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-500 font-mono">{currentIndex + 1} / {points.length}</p>
                </div>
              </div>

              <div className="px-2">
                <input type="range" min="0" max={points.length - 1} value={currentIndex} onChange={(e) => { setIsPlaying(false); setCurrentIndex(parseInt(e.target.value)); }} className="w-full h-3 bg-gray-100 rounded-full appearance-none accent-blue-500 shadow-inner" />
              </div>

              <div className="flex items-center justify-between gap-6 px-1">
                <button onClick={() => { setIsPlaying(false); setCurrentIndex(0); }} className="w-16 h-16 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100"><RotateCcw size={24} /></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="flex-1 h-18 rounded-[2.25rem] bg-blue-500 text-white flex items-center justify-center gap-4 shadow-2xl active:scale-[0.97] transition-all">
                  {isPlaying ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} />}
                  <span className="font-black text-xl">{isPlaying ? 'STOP' : 'PLAY'}</span>
                </button>
                <div className="flex flex-col items-center gap-1.5 min-w-[80px] bg-gray-50/80 p-3 rounded-3xl border border-gray-100">
                  <span className="text-[9px] font-black uppercase text-blue-400">Speed</span>
                  <span className="text-sm font-black font-mono text-gray-800">x{playbackSpeed}</span>
                  <input type="range" min="1" max="50" step="1" value={playbackSpeed} onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))} className="w-14 h-1 bg-gray-200 rounded-full appearance-none accent-blue-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); opacity: 0.8; } }
        .leaflet-container { background-color: #f8fafc; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 32px; height: 32px; background: #3b82f6; border: 6px solid white; border-radius: 50%; shadow: 0 10px 30px rgba(59, 130, 246, 0.4); }
        .custom-div-icon { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default App;
