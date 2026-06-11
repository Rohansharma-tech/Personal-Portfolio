import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiExternalLink, FiCalendar, FiAward, FiX } from 'react-icons/fi'
import { getCertifications } from '../../services/api'
import { usePageSEO } from '../../hooks/usePageSEO'

const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

export default function Certifications() {
  usePageSEO({
    title: 'Certifications',
    description: 'Professional certifications and credentials earned by Rohan Sharma in Cloud, Web Development, Backend Engineering, and more.',
  })

  const [certs,   setCerts]   = useState([])
  const [preview, setPreview] = useState(null)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    getCertifications().then(r => { const d = r.data?.results ?? r.data; setCerts(Array.isArray(d) ? d : []) }).catch(() => {})
  }, [])

  const categories = ['all', ...new Set(certs.map(c => c.category).filter(Boolean))]
  const filtered   = filter === 'all' ? certs : certs.filter(c => c.category === filter)

  return (
    <div className="page-offset">
      <section className="section" style={{ background: 'var(--bg-primary)', backgroundImage: 'var(--grad-hero)' }}>
        <div className="container">
          <div className="section-header">
            <div className="tag">Certifications</div>
            <h1 className="h-section">My <span className="gradient-text">Certifications</span></h1>
            <p>Professional credentials and course completions.</p>
          </div>

          {/* Category filters */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className="btn btn-sm"
                  style={{
                    background:    filter === cat ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
                    color:         filter === cat ? '#fff' : 'var(--text-secondary)',
                    border:        `1px solid ${filter === cat ? 'transparent' : 'var(--border)'}`,
                    textTransform: 'capitalize',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div key={filter}
              variants={stagger} initial="hidden" animate="show"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.25rem', alignItems: 'stretch' }}
            >
              {filtered.map(cert => (
                <motion.article key={cert.id} variants={fadeUp}
                  className="card card-hover"
                  style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: cert.certificate_image_url ? 'pointer' : 'default' }}
                  onClick={() => cert.certificate_image_url && setPreview(cert)}
                >
                  {/* Image */}
                  {cert.certificate_image_url
                    ? <div style={{ height: 160, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                        <img src={cert.certificate_image_url} alt={cert.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .3s', fontSize: '0.84rem', fontWeight: 600, color: 'white', opacity: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; e.currentTarget.style.opacity = '1' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = '0' }}>
                          Click to Preview
                        </div>
                      </div>
                    : <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.08)', flexShrink: 0 }}>
                        <FiAward size={36} style={{ color: 'var(--primary-light)' }} />
                      </div>
                  }

                  {/* Content */}
                  <div style={{ padding: '1.1rem 1.1rem 1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {cert.category && <span className="tag-tech" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>{cert.category}</span>}
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{cert.title}</h3>
                    <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 6 }}>{cert.issuer}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: cert.credential_id ? 4 : 0 }}>
                      <FiCalendar size={12} />
                      {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                    {cert.credential_id && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 0 }}>ID: {cert.credential_id}</p>
                    )}

                    {/* Footer links */}
                    {(cert.verification_url || cert.certificate_pdf_url) && (
                      <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
                        {cert.verification_url && (
                          <a href={cert.verification_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>
                            <FiExternalLink size={12} /> Verify
                          </a>
                        )}
                        {cert.certificate_pdf_url && (
                          <a href={cert.certificate_pdf_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-light)' }}>
                            <FiExternalLink size={12} /> PDF
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '5rem 0' }}>No certifications yet.</p>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {preview && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ position: 'relative', maxWidth: 680, width: '100%' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreview(null)}
                style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>
                <FiX size={24} />
              </button>
              <img src={preview.certificate_image_url} alt={preview.title}
                style={{ width: '100%', borderRadius: 16, border: '1px solid var(--border)', display: 'block' }} />
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{preview.title}</h3>
                <p style={{ color: 'var(--primary-light)', marginTop: 4 }}>{preview.issuer}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
