export interface Point {
  lat: number;
  lng: number;
  ts: number;
  year: number;
}

export interface ParsedCoords {
  lat: number;
  lng: number;
}

export type MapTheme = 'light' | 'dark' | 'satellite';
