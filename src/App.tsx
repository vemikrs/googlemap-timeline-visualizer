import React, { useState, useEffect, useRef } from 'react';
import type { Map as LeafletMap, Polyline, Marker } from 'leaflet';
import type { Point, MapTheme } from './types';
import { processData } from './utils/dataProcessor';
import { loadLeaflet, getTileLayerUrl } from './utils/mapHelpers';
import Header from './components/Header';
import ControlButtons from './components/ControlButtons';
import FocusButton from './components/FocusButton';
import SettingsModal from './components/SettingsModal';
import TimestampHeader from './components/TimestampHeader';
import ControllerHUD from './components/ControllerHUD';

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
  const [selectedYearStart, setSelectedYearStart] = useState<number | null>(null);
  const [selectedYearEnd, setSelectedYearEnd] = useState<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(5); 
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [samplingRate] = useState<number>(5); 
  const [mapTheme, setMapTheme] = useState<MapTheme>('light'); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isWideView, setIsWideView] = useState<boolean>(false);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false);

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
        if (years.length > 0) {
          setSelectedYearStart(years[0]);
          setSelectedYearEnd(years[0]);
        }
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
    if (selectedYearStart !== null && selectedYearEnd !== null) {
      filtered = rawPoints.filter(p => p.year >= selectedYearStart && p.year <= selectedYearEnd);
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
  }, [rawPoints, selectedYearStart, selectedYearEnd, samplingRate, isWideView]);

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

  const handleReset = () => {
    setRawPoints([]);
    setPoints([]);
    setShowSettings(false);
  };

  const handleSeek = (index: number) => {
    setIsPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans select-none">
      {/* Header UI */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <Header />
      </div>

      {/* Right Toolbox */}
      {points.length > 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 right-3 z-[950] flex flex-col gap-1.5 pointer-events-auto">
          <FocusButton visible={true} onClick={focusOnCurrent} />
          <ControlButtons
            isWideView={isWideView}
            onToggleWideView={() => setIsWideView(!isWideView)}
            onOpenSettings={() => setShowSettings(true)}
          />
        </div>
      )}

      {/* Timestamp Display */}
      {points.length > 0 && (
        <TimestampHeader
          currentPoint={points[currentIndex] || null}
          currentIndex={currentIndex}
          totalPoints={points.length}
          selectedYear={
            selectedYearStart === null || selectedYearEnd === null
              ? 'all'
              : selectedYearStart === selectedYearEnd
              ? selectedYearStart.toString()
              : `${selectedYearStart}-${selectedYearEnd}`
          }
          showCoordinates={showCoordinates}
        />
      )}

      <div ref={mapRef} className="flex-1 w-full h-full z-0" />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        selectedYearStart={selectedYearStart}
        selectedYearEnd={selectedYearEnd}
        availableYears={availableYears}
        onYearRangeChange={(start, end) => {
          setSelectedYearStart(start);
          setSelectedYearEnd(end);
        }}
        mapTheme={mapTheme}
        onThemeChange={setMapTheme}
        onReset={handleReset}
        showCoordinates={showCoordinates}
        onCoordinatesToggle={setShowCoordinates}
      />

      <ControllerHUD
        points={points}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        selectedYear={
          selectedYearStart === null || selectedYearEnd === null
            ? 'all'
            : selectedYearStart === selectedYearEnd
            ? selectedYearStart.toString()
            : `${selectedYearStart}-${selectedYearEnd}`
        }
        isProcessing={isProcessing}
        progress={progress}
        errorMsg={errorMsg}
        onFileUpload={handleFileUpload}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onReset={() => {
          setIsPlaying(false);
          setCurrentIndex(0);
        }}
        onSeek={handleSeek}
        onSpeedChange={setPlaybackSpeed}
      />

      {/* Copyright Footer */}
      {points.length > 0 && (
        <div className="absolute bottom-2 left-0 right-0 z-[999] pointer-events-none">
          <p className="text-center text-[10px] text-gray-400 font-medium opacity-70">
            © 2025 VEMI.jp
          </p>
        </div>
      )}

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
