import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGithub, FiExternalLink, FiX, FiCheckCircle, FiClock, FiArchive, FiCalendar } from 'react-icons/fi'
import { getProjects } from '../../services/api'

const STATUS_FILTERS = ['all', 'completed', 'in_progress', 'planned', 'archived']

const STATUS_META = {
  completed: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', dot: '#10b981', label: 'Completed', Icon: FiCheckCircle },
  in_progress: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', dot: '#3b82f6', label: 'In Progress', Icon: FiClock },
  planned: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', dot: '#f59e0b', label: 'Planned', Icon: FiCalendar },
  archived: { bg: 'rgba(107,114,128,0.12)', text: '#9ca3af', dot: '#6b7280', label: 'Archived', Icon: FiArchive },
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } } }

/* ── Modal overlay animation ── */
const overlayAnim = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
const drawerAnim = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 24, scale: 0.97, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
}

/* ── Project Detail Modal ── */
function ProjectModal({ project: p, onClose }) {
  const sc = STATUS_META[p.status] ?? STATUS_META.archived
  const StatusIcon = sc.Icon

  // close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayAnim} initial="hidden" animate="show" exit="exit"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <motion.div
          variants={drawerAnim} initial="hidden" animate="show" exit="exit"
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 680,
            maxHeight: '90vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--bg-secondary, #111)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            position: 'relative',
          }}
        >
          {/* Close button — fixed inside modal, no float, no sticky */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              zIndex: 20,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
          >
            <FiX size={16} />
          </button>

          {/* Thumbnail */}
          <div style={{
            width: '100%',
            height: 260,
            overflow: 'hidden',
            borderRadius: '20px 20px 0 0',
            background: 'var(--bg-primary)',
            flexShrink: 0,
            position: 'relative',
            display: 'block',
          }}>
            {p.screenshots?.[0]?.image_url
              ? <img
                src={p.screenshots[0].image_url}
                alt={p.title}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                }}
              />
              : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 100%)',
                }}>
                  <FiGithub size={56} style={{ color: 'rgba(255,255,255,0.1)' }} />
                </div>
              )
            }
            {/* gradient fade at bottom of thumb */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
              background: 'linear-gradient(to bottom, transparent, var(--bg-secondary, #111))',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Content */}
          <div style={{ padding: '0 2rem 2rem' }}>

            {/* Status + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.6rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 999,
                background: sc.bg, color: sc.text,
                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
              }}>
                <StatusIcon size={11} /> {sc.label}
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.25, marginBottom: '0.75rem', color: 'var(--text-primary, #f1f1f1)' }}>
              {p.title}
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #aaa)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              {p.description}
            </p>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1.5rem' }} />

            {/* Tech stack */}
            {p.tech_stack?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted, #666)', marginBottom: '0.6rem' }}>
                  Tech Stack
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {p.tech_stack.map(t => (
                    <span key={t} style={{
                      fontSize: '0.78rem', padding: '4px 12px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-secondary, #bbb)',
                      fontWeight: 500,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Features — all of them in modal */}
            {p.features?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted, #666)', marginBottom: '0.6rem' }}>
                  Features
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      fontSize: '0.875rem', color: 'var(--text-secondary, #bbb)',
                      padding: '6px 0',
                      borderBottom: i < p.features.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      lineHeight: 1.6,
                    }}>
                      <span style={{ color: 'var(--primary-light, #a78bfa)', marginTop: 3, flexShrink: 0 }}>▸</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1.25rem' }} />

            {/* Action links */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {p.github_url && (
                <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '0.55rem 1.2rem', borderRadius: 10,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--text-primary, #f1f1f1)',
                  fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                >
                  <FiGithub size={15} /> View Code
                </a>
              )}
              {p.live_url && (
                <a href={p.live_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '0.55rem 1.2rem', borderRadius: 10,
                  background: 'var(--grad-primary)',
                  border: '1px solid transparent',
                  color: '#fff',
                  fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <FiExternalLink size={15} /> Live Demo
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Main Projects Page ── */
export default function Projects() {
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = filter !== 'all' ? { status: filter } : {}
    getProjects(params)
      .then(r => {
        const d = r.data?.results ?? r.data
        setProjects(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [filter])

  return (
    <div className="page-offset">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        .pf-btn {
          padding: 0.45rem 1.1rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          text-transform: capitalize;
          letter-spacing: 0.02em;
          transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
        }
        .pf-btn:hover { background: rgba(255,255,255,0.07); transform: translateY(-1px); }
        .pf-btn.active { background: var(--grad-primary); color: #fff; border-color: transparent; }

        .proj-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.3s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        .proj-card:hover {
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          transform: translateY(-6px);
        }
        .proj-card:hover .proj-thumb-img { transform: scale(1.06); }

        .proj-thumb {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: var(--bg-primary);
          position: relative;
          flex-shrink: 0;
          display: block;
        }
        .proj-thumb-img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.55s cubic-bezier(0.22,1,0.36,1);
        }
        .proj-thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 100%);
        }

        /* "Click to expand" hint on hover */
        .proj-hover-hint {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transition: opacity 0.25s;
          pointer-events: none;
        }
        .proj-card:hover .proj-hover-hint { opacity: 1; }
        .proj-hover-hint span {
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em;
          color: #fff; text-transform: uppercase;
          padding: 6px 16px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(4px);
        }

        .status-pill {
          position: absolute; top: 10px; right: 10px;
          display: flex; align-items: center; gap: 5px;
          padding: 3px 9px 3px 7px; border-radius: 999px;
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em;
          text-transform: capitalize; backdrop-filter: blur(6px);
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        .proj-body { padding: 1.15rem 1.25rem 1rem; display: flex; flex-direction: column; flex: 1; }
        .proj-title { font-size: 0.975rem; font-weight: 700; margin-bottom: 0.45rem; color: var(--text-primary, #f1f1f1); line-height: 1.35; }
        .proj-desc { font-size: 0.835rem; color: var(--text-secondary); line-height: 1.72; flex: 1; margin-bottom: 0.85rem; }

        .tech-row { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.85rem; }
        .tech-tag { font-size: 0.72rem; padding: 2px 9px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); font-weight: 500; }
        .tech-tag-more { font-size: 0.72rem; padding: 2px 9px; border-radius: 6px; background: transparent; border: 1px dashed rgba(255,255,255,0.15); color: var(--text-muted, #666); }

        .feat-list { list-style: none; padding: 0; margin: 0 0 0.85rem; }
        .feat-list li { display: flex; gap: 7px; font-size: 0.775rem; color: var(--text-muted, #888); margin-bottom: 4px; line-height: 1.55; }
        .feat-arrow { color: var(--primary-light, #a78bfa); flex-shrink: 0; margin-top: 1px; }

        .proj-links { display: flex; gap: 0.75rem; padding-top: 0.85rem; border-top: 1px solid var(--border); margin-top: auto; }
        .proj-link {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.8rem; font-weight: 500;
          color: var(--text-muted, #888); text-decoration: none;
          padding: 4px 10px; border-radius: 8px;
          border: 1px solid transparent;
          transition: color 0.18s, background 0.18s, border-color 0.18s;
        }
        .proj-link:hover { color: var(--text-primary, #f1f1f1); background: rgba(255,255,255,0.06); border-color: var(--border); }
        .proj-link.live { color: var(--secondary, #34d399); }
        .proj-link.live:hover { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.25); }

        .empty-state { text-align: center; padding: 5rem 0; color: var(--text-muted); font-size: 0.9rem; }
      `}</style>

      <section className="section" style={{ background: 'var(--bg-primary)', backgroundImage: 'var(--grad-hero)' }}>
        <div className="container">

          {/* Header */}
          <div className="section-header">
            <div className="tag">Portfolio</div>
            <h1 className="h-section">My <span className="gradient-text">Projects</span></h1>
            <p>A showcase of what I've built — from web apps to full-stack systems.</p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`pf-btn${filter === f ? ' active' : ''}`}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
              <div style={{ width: 36, height: 36, border: '2.5px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}

          {/* Grid */}
          {!loading && projects.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div key={filter} variants={stagger} initial="hidden" animate="show"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem', alignItems: 'stretch' }}
              >
                {projects.map(p => {
                  const sc = STATUS_META[p.status] ?? STATUS_META.archived
                  return (
                    <motion.article key={p.id} variants={fadeUp} className="proj-card" onClick={() => setSelected(p)}>

                      {/* Thumbnail */}
                      <div className="proj-thumb">
                        {p.screenshots?.[0]?.image_url
                          ? <img src={p.screenshots[0].image_url} alt={p.title} className="proj-thumb-img" />
                          : <div className="proj-thumb-placeholder"><FiGithub size={44} style={{ color: 'rgba(255,255,255,0.12)' }} /></div>
                        }
                        {/* hover overlay hint */}
                        <div className="proj-hover-hint"><span>View Details</span></div>
                        {/* status pill */}
                        <div className="status-pill" style={{ background: sc.bg, color: sc.text }}>
                          <span className="status-dot" style={{ background: sc.dot }} />
                          {p.status.replace('_', ' ')}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="proj-body">
                        <h2 className="proj-title">{p.title}</h2>
                        <p className="proj-desc">{p.short_description || (p.description?.slice(0, 120) + '…')}</p>

                        <div className="tech-row">
                          {(p.tech_stack ?? []).slice(0, 4).map(t => <span key={t} className="tech-tag">{t}</span>)}
                          {p.tech_stack?.length > 4 && <span className="tech-tag-more">+{p.tech_stack.length - 4} more</span>}
                        </div>

                        {p.features?.length > 0 && (
                          <ul className="feat-list">
                            {p.features.slice(0, 3).map((f, i) => (
                              <li key={i}><span className="feat-arrow">▸</span>{f}</li>
                            ))}
                          </ul>
                        )}

                        <div className="proj-links" onClick={e => e.stopPropagation()}>
                          {p.github_url && (
                            <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="proj-link">
                              <FiGithub size={13} /> Code
                            </a>
                          )}
                          {p.live_url && (
                            <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="proj-link live">
                              <FiExternalLink size={13} /> Live Demo
                            </a>
                          )}
                          {!p.github_url && !p.live_url && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Links coming soon</span>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && projects.length === 0 && <div className="empty-state">No projects found for this filter.</div>}
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}