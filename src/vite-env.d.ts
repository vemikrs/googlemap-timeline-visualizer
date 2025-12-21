/// <reference types="vite/client" />

declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

export {};
