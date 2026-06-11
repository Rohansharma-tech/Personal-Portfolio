import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import './index.css'

// ── Initialize Sentry ────────────────────────────────────────────────────────
// Only activates when VITE_SENTRY_DSN is set (safe to omit in local dev)
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,

    integrations: [
      // Tracks page navigation performance across React Router routes
      Sentry.browserTracingIntegration(),
      // Records a short video replay of the session when an error occurs
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Performance monitoring: capture 10% of transactions in production
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session Replay: capture 5% of all sessions, 100% with errors
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,

    // Tag every event with the environment
    environment: import.meta.env.MODE,

    // Release name (injected by CI or set manually)
    release: import.meta.env.VITE_APP_VERSION ?? 'unknown',

    // Don't send errors from localhost
    beforeSend(event) {
      if (window.location.hostname === 'localhost') return null
      return event
    },
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
