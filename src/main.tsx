import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Service Worker登録（本番環境のみ）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration.scope);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

// Strict Modeを無効化してマップの二重初期化を防ぐ
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
