import React, { useState, useEffect, useRef } from 'react';
import type { Map as LeafletMap, Polyline, Marker } from 'leaflet';
import type { Point, MapTheme } from './types';
import { processData } from './utils/dataProcessor';
import { loadLeaflet, getTileLayerUrl } from './utils/mapHelpers';
import SettingsModal from './components/SettingsModal';
import YearFilterModal from './components/YearFilterModal';
import TimestampHeader from './components/TimestampHeader';
import ControllerHUD from './components/ControllerHUD';
import FFmpegDownloadModal from './components/FFmpegDownloadModal';
import RecordingOverlay from './components/RecordingOverlay';
import ExportModal from './components/ExportModal';
import HelpModal from './components/HelpModal';
import { useVideoRecorder } from './hooks/useVideoRecorder';

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
  const [isWideView, setIsWideView] = useState<boolean>(true);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false);
  const [showYearFilter, setShowYearFilter] = useState<boolean>(false);
  const [showInitialHints, setShowInitialHints] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // --- Refs ---
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const polylineRef = useRef<Polyline | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const animationRef = useRef<number | null>(null);

  // --- Video Recorder ---
  const recorder = useVideoRecorder({
    targetRef: mapContainerRef,
    fps: 10,
    maxDuration: 30,
    resolution: 0.6,
    format: 'mp4',
  });

  // --- Map Initialization ---
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    loadLeaflet().then(() => {
      if (!window.L || !mapRef.current || mapInstance.current) return;
      const L = window.L;
      mapInstance.current = L.map(mapRef.current, { 
        zoomControl: false, 
        preferCanvas: true,
        attributionControl: false
      }).setView([36.2048, 138.2529], 5);
      
      // Add simple text-only attribution
      L.control.attribution({
        prefix: '<a href="https://leafletjs.com" target="_blank">Leaflet</a>'
      }).addTo(mapInstance.current);
      
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
      attribution: '&copy; OpenStreetMap',
      crossOrigin: 'anonymous'  // CORS対応：録画機能で必要
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
        // 初回ヒントを表示
        setShowInitialHints(true);
        // 5秒後にヒントを非表示
        setTimeout(() => setShowInitialHints(false), 5000);
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

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (points.length === 0) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentIndex >= points.length - 1 && !isPlaying) {
            setCurrentIndex(0);
            setTimeout(() => setIsPlaying(true), 50);
          } else {
            setIsPlaying(prev => !prev);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentIndex(prev => Math.max(0, prev - Math.max(1, Math.floor(points.length / 100))));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentIndex(prev => Math.min(points.length - 1, prev + Math.max(1, Math.floor(points.length / 100))));
          break;
        case 'Home':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentIndex(points.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [points.length, currentIndex, isPlaying]);

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

  const handleBackToUpload = () => {
    setRawPoints([]);
    setPoints([]);
    setShowSettings(false);
    setIsPlaying(false);
    setCurrentIndex(0);
    // マップからポリラインとマーカーを削除
    if (polylineRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (markerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    // マップを日本中心にリセット
    if (mapInstance.current) {
      mapInstance.current.setView([36.2048, 138.2529], 5, { animate: true });
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Timeline Visualizer',
          text: 'Google Mapタイムラインデータを可視化しよう！',
          url: window.location.href,
        });
      } catch (err) {
        // ユーザーがシェアをキャンセルした場合は無視
        if ((err as Error).name !== 'AbortError') {
          console.error('シェアに失敗しました:', err);
        }
      }
    }
  };

  const handleSeek = (index: number) => {
    setIsPlaying(false);
    setCurrentIndex(index);
  };

  // --- Recording Handlers ---
  const pendingRecordingRef = useRef(false);
  
  const handleRecordClick = () => {
    if (recorder.status === 'recording') {
      recorder.stopRecording();
    } else if (recorder.status === 'ready') {
      // 最後の位置にいる場合は最初に戻してから録画開始
      if (currentIndex >= points.length - 1) {
        setCurrentIndex(0);
        setTimeout(() => {
          recorder.startRecording();
          setIsPlaying(true);
        }, 100);
      } else {
        recorder.startRecording();
        // 録画開始と同時に再生も開始
        if (!isPlaying) {
          setIsPlaying(true);
        }
      }
    } else {
      // ダウンロードが必要な場合、完了後に録画開始フラグを立てる
      pendingRecordingRef.current = true;
      recorder.requestRecording();
    }
  };

  // ダウンロード完了後、自動的に録画を開始
  useEffect(() => {
    if (recorder.status === 'ready' && pendingRecordingRef.current && points.length > 0) {
      pendingRecordingRef.current = false;
      // 少し遅延を入れてUIが更新されてから開始
      const timer = setTimeout(() => {
        // 最後の位置にいる場合は最初に戻す
        if (currentIndex >= points.length - 1) {
          setCurrentIndex(0);
          setTimeout(() => {
            recorder.startRecording();
            setIsPlaying(true);
          }, 100);
        } else {
          recorder.startRecording();
          if (!isPlaying) {
            setIsPlaying(true);
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [recorder.status]);

  // 録画中に再生が終了したら録画も停止
  useEffect(() => {
    if (recorder.status === 'recording' && !isPlaying && currentIndex >= points.length - 1) {
      recorder.stopRecording();
    }
  }, [isPlaying, currentIndex, points.length, recorder.status]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans select-none">
      {/* Recording Container - includes header and map */}
      <div ref={mapContainerRef} className="relative flex-1 w-full h-full flex flex-col">
        {/* Timestamp Display - included in recording */}
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
            onYearFilterClick={() => setShowYearFilter(true)}
            showInitialHint={showInitialHints}
          />
        )}

        {/* Map Container */}
        <div ref={mapRef} className="flex-1 relative z-0" />
        
        {/* Recording Overlay */}
        <RecordingOverlay
          isRecording={recorder.status === 'recording'}
          isProcessing={recorder.status === 'processing'}
          elapsedTime={recorder.elapsedTime}
          maxDuration={30}
          frameCount={recorder.frameCount}
          processingProgress={recorder.processingProgress}
          onStop={recorder.stopRecording}
          onCancel={recorder.cancelRecording}
        />
      </div>

      <YearFilterModal
        isOpen={showYearFilter}
        onClose={() => setShowYearFilter(false)}
        selectedYearStart={selectedYearStart}
        selectedYearEnd={selectedYearEnd}
        availableYears={availableYears}
        onYearRangeChange={(start, end) => {
          setSelectedYearStart(start);
          setSelectedYearEnd(end);
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        mapTheme={mapTheme}
        onThemeChange={setMapTheme}
        onReset={handleBackToUpload}
        showCoordinates={showCoordinates}
        onCoordinatesToggle={setShowCoordinates}
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
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
        onSeek={handleSeek}
        onSpeedChange={setPlaybackSpeed}
        isWideView={isWideView}
        onToggleWideView={() => setIsWideView(!isWideView)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHelp={() => setShowHelp(true)}
        onFocusCurrent={focusOnCurrent}
        onBackToUpload={handleBackToUpload}
        onShare={handleShare}
        onRecord={handleRecordClick}
        isRecording={recorder.status === 'recording'}
        showInitialHints={showInitialHints}
      />

      {/* FFmpeg Download Modal */}
      <FFmpegDownloadModal
        isOpen={recorder.status === 'need-download'}
        onClose={recorder.cancelDownload}
        onConfirm={recorder.confirmDownload}
        isDownloading={recorder.downloadPhase !== 'confirm'}
        downloadProgress={recorder.downloadProgress}
        phase={recorder.downloadPhase}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={recorder.status === 'done'}
        outputBlob={recorder.outputBlob}
        format="mp4"
        onClose={recorder.reset}
        onDownload={recorder.downloadVideo}
        onShare={recorder.shareVideo}
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
        .leaflet-control-attribution { font-size: 10px !important; background: rgba(255, 255, 255, 0.7) !important; padding: 2px 5px !important; }
      `}</style>
    </div>
  );
};

export default App;
