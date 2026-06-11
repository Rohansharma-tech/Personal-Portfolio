import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiCalendar, FiAward } from 'react-icons/fi'
import { getEducation } from '../../services/api'
import { usePageSEO } from '../../hooks/usePageSEO'

export default function Education() {
  usePageSEO({
    title: 'Education',
    description: 'Rohan Sharma’s educational background — B.Tech in Computer Science & Engineering. Academic journey, institutions, and qualifications.',
  })

  const [education, setEducation] = useState([])

  useEffect(() => {
    getEducation().then(r => { const d = r.data?.results ?? r.data; setEducation(Array.isArray(d) ? d : []) }).catch(() => {})
  }, [])

  return (
    <div className="page-offset">
      <section className="section" style={{ background: 'var(--bg-primary)', backgroundImage: 'var(--grad-hero)' }}>
        <div className="container">
          <div className="section-header">
            <div className="tag">Education</div>
            <h1 className="h-section">Academic <span className="gradient-text">Journey</span></h1>
            <p>My educational background and qualifications.</p>
          </div>

          {/* Timeline */}
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <div className="timeline">
              {education.map((edu, i) => (
                <motion.div key={edu.id}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="timeline-item"
                >
                  <div className="timeline-dot" />

                  <div className="card" style={{ padding: '1.5rem' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{edu.degree}</h3>
                        <p style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{edu.institution}</p>
                      </div>
                      {edu.is_current && (
                        <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16,185,129,0.13)', color: '#10b981', border: '1px solid rgba(16,185,129,0.28)', flexShrink: 0 }}>
                          Currently Studying
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: edu.description ? '0.875rem' : 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        <FiCalendar size={13} /> {edu.start_year} — {edu.end_year || 'Present'}
                      </span>
                      {edu.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                          <FiMapPin size={13} /> {edu.location}
                        </span>
                      )}
                      {edu.cgpa && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 600, color: 'var(--secondary)' }}>
                          <FiAward size={13} /> CGPA: {edu.cgpa}
                        </span>
                      )}
                      {edu.percentage && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 600, color: 'var(--secondary)' }}>
                          <FiAward size={13} /> {edu.percentage}%
                        </span>
                      )}
                    </div>

                    {edu.description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{edu.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {education.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '5rem 0' }}>Education records coming soon.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
