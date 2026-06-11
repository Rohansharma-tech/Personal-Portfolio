import * as Sentry from '@sentry/react'
import { FiAlertTriangle, FiRefreshCw, FiHome, FiSend } from 'react-icons/fi'

/**
 * ErrorFallback — shown by Sentry.ErrorBoundary when an unhandled error occurs.
 * Gives the user clear options and automatically reports the error to Sentry.
 */
export default function ErrorFallback({ error, resetError }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary, #07090f)',
      padding: '2rem',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(239,68,68,0.08), transparent)',
      }} />

      <div style={{
        width: '100%', maxWidth: 520,
        background: 'var(--bg-secondary, #0c1020)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 20,
        padding: 'clamp(2rem, 6vw, 3rem)',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(239,68,68,0.08)',
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <FiAlertTriangle size={32} style={{ color: '#ef4444' }} />
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(1.4rem, 4vw, 1.75rem)',
          fontWeight: 800,
          color: 'var(--text-primary, #f1f5f9)',
          marginBottom: '0.75rem',
        }}>
          Something went wrong
        </h1>

        <p style={{
          color: 'var(--text-secondary, #94a3b8)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          marginBottom: '1.5rem',
        }}>
          An unexpected error occurred. It's been automatically reported and I'll look into it.
        </p>

        {/* Error detail (collapsible, dev-friendly) */}
        {error?.message && (
          <details style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 10,
            padding: '0.75rem 1rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            cursor: 'pointer',
          }}>
            <summary style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#ef4444',
              letterSpacing: '0.04em',
              userSelect: 'none',
            }}>
              Error details
            </summary>
            <pre style={{
              marginTop: '0.6rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted, #475569)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
            }}>
              {error.message}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={resetError}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 50,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: '#fff', border: 'none',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              transition: 'opacity 0.2s, transform 0.2s',
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <FiRefreshCw size={15} /> Try again
          </button>

          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 50,
              background: 'transparent',
              color: 'var(--text-secondary, #94a3b8)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f1f5f9' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)' }}
          >
            <FiHome size={15} /> Go home
          </a>
        </div>

        {/* Sentry feedback button */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => Sentry.showReportDialog()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--text-muted, #475569)', fontSize: '0.82rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light, #a78bfa)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted, #475569)'}
          >
            <FiSend size={13} /> Send a report
          </button>
        </div>
      </div>
    </div>
  )
}
