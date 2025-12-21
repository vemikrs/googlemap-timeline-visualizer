import type { MapTheme } from '../types';

/**
 * Get tile layer URL based on theme
 * Uses internationalized tile servers with English labels for consistency
 */
export const getTileLayerUrl = (theme: MapTheme): string => {
  switch (theme) {
    case 'dark':
      // CartoDB Dark Matter - minimal labels, international (English-primary)
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    case 'satellite':
      // ArcGIS satellite imagery (minimal labels)
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    case 'light':
    default:
      // Wikimedia OSM International - English labels with Japanese local names
      return 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png';
  }
};

/**
 * Load Leaflet library dynamically
 */
export const loadLeaflet = async (): Promise<void> => {
  if (window.L) return;

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);

  // Load JS
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
};
