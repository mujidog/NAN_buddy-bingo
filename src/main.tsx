import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// A sprite that 404s or times out otherwise renders as the browser's broken-image
// icon in the middle of the forest. Hiding it degrades to a missing character,
// which is far less wrong. Capture phase: resource errors do not bubble.
window.addEventListener(
  'error',
  (e) => {
    const el = e.target
    if (el instanceof HTMLImageElement) el.style.visibility = 'hidden'
  },
  true,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
