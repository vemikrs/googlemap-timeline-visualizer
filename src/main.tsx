import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Strict Modeを無効化してマップの二重初期化を防ぐ
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
