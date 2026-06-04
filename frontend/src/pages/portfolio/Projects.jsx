import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGithub, FiExternalLink, FiFilter } from 'react-icons/fi'
import { getProjects } from '../../services/api'

const STATUS_FILTERS = ['all', 'completed', 'in_progress', 'planned', 'archived']
const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = filter !== 'all' ? { status: filter } : {}
    getProjects(params)
      .then(r => { setProjects(r.data.results ?? r.data); setLoading(false) })
      .catch(()  => setLoading(false))
  }, [filter])

  return (
    <div className="page-offset">
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
              <button key={f} onClick={() => setFilter(f)}
                className="btn btn-sm"
                style={{
                  background:   filter === f ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
                  color:        filter === f ? '#fff' : 'var(--text-secondary)',
                  border:       `1px solid ${filter === f ? 'transparent' : 'var(--border)'}`,
                  textTransform: 'capitalize',
                }}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
              <div style={{ width: 40, height: 40, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <AnimatePresence mode="wait">
              <motion.div key={filter}
                variants={stagger} initial="hidden" animate="show"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem', alignItems: 'stretch' }}
              >
                {projects.map(p => (
                  <motion.article key={p.id} variants={fadeUp}
                    className="card card-hover"
                    style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: 192, overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative', flexShrink: 0 }}>
                      {p.screenshots?.[0]?.image_url
                        ? <img src={p.screenshots[0].image_url} alt={p.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s ease' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                        : <div style={{ width: '100%', height: '100%', background: 'var(--grad-primary)', opacity: 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiGithub size={48} style={{ color: 'white', opacity: 0.4 }} />
                          </div>
                      }
                      <div style={{ position: 'absolute', top: 12, right: 12 }}>
                        <span className={`status-badge badge-${p.status}`}>{p.status.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '1.25rem 1.25rem 1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{p.title}</h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, marginBottom: '0.875rem' }}>
                        {p.short_description || p.description?.slice(0, 120) + '…'}
                      </p>

                      {/* Tech */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
                        {(p.tech_stack ?? []).slice(0, 4).map(t => <span key={t} className="tag-tech">{t}</span>)}
                        {p.tech_stack?.length > 4 && <span className="tag-tech">+{p.tech_stack.length - 4}</span>}
                      </div>

                      {/* Features */}
                      {p.features?.length > 0 && (
                        <ul style={{ marginBottom: '0.875rem', paddingLeft: 0, listStyle: 'none' }}>
                          {p.features.slice(0, 3).map((f, i) => (
                            <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                              <span style={{ color: 'var(--primary-light)', flexShrink: 0 }}>▸</span> {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Links */}
                      <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                        {p.github_url && (
                          <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 500, color: 'var(--text-muted)', transition: 'color .2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          ><FiGithub size={14}/> Code</a>
                        )}
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 500, color: 'var(--secondary)' }}
                          ><FiExternalLink size={14}/> Live Demo</a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && projects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              No projects found for this filter.
            </div>
          )}
        </div>
      </section>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
