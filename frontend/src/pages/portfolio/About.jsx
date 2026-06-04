import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { getProfile, getSkills } from '../../services/api'

const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

const CAT_COLORS = {
  frontend: '#06b6d4', backend: '#7c3aed', database: '#10b981',
  devops: '#f59e0b', tools: '#94a3b8', language: '#f472b6', mobile: '#818cf8',
}
const CAT_LABELS = {
  language: 'Programming Languages', frontend: 'Frontend', backend: 'Backend',
  database: 'Database', devops: 'DevOps', tools: 'Tools & Others', mobile: 'Mobile',
}

function SkillBar({ skill, animate }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{skill.name}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: CAT_COLORS[skill.category] || 'var(--primary-light)' }}>{skill.percentage}%</span>
      </div>
      <div className="skill-bar-track">
        <motion.div
          className="skill-bar-fill"
          style={{ background: `linear-gradient(90deg,${CAT_COLORS[skill.category] || '#7c3aed'},#06b6d4)` }}
          initial={{ width: 0 }}
          animate={{ width: animate ? `${skill.percentage}%` : 0 }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}

export default function About() {
  const [profile, setProfile] = useState(null)
  const [skills,  setSkills]  = useState([])
  const [animate, setAnimate] = useState(false)
  const skillsRef = useRef(null)

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
    getSkills().then(r => setSkills(r.data.results ?? r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!skillsRef.current || skills.length === 0) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimate(true) }, { threshold: 0.15 })
    obs.observe(skillsRef.current)
    return () => obs.disconnect()
  }, [skills])

  const grouped = skills.reduce((acc, s) => { (acc[s.category] = acc[s.category] || []).push(s); return acc }, {})

  const infoItems = [
    { label: 'Location',   value: profile?.location || 'India' },
    { label: 'Email',      value: profile?.email    || '—' },
    { label: 'Experience', value: `${profile?.years_of_experience || 1}+ Years` },
    { label: 'Status',     value: 'Open to Work', highlight: true },
  ]

  return (
    <div className="page-offset">
      {/* ── About Header ──────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-primary)', backgroundImage: 'var(--grad-hero)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(2rem,5vw,4rem)', alignItems: 'start' }}>
            {/* Text */}
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp}>
                <div className="tag" style={{ display: 'inline-flex', marginBottom: '1rem' }}>About Me</div>
              </motion.div>
              <motion.h1 variants={fadeUp} className="h-section" style={{ marginBottom: '1rem' }}>
                Passionate Developer &amp; <span className="gradient-text">Problem Solver</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-body" style={{ marginBottom: '1.5rem' }}>
                {profile?.bio || 'I am a passionate full-stack developer who loves building clean, efficient, and beautiful web applications.'}
              </motion.p>
              {profile?.career_objective && (
                <motion.div variants={fadeUp} className="card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    Career Objective
                  </h3>
                  <p className="text-body" style={{ fontSize: '0.9rem' }}>{profile.career_objective}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Info cards */}
            <motion.div variants={stagger} initial="hidden" animate="show"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {infoItems.map(item => (
                <motion.div key={item.label} variants={fadeUp} className="card"
                  style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: item.highlight ? '#10b981' : 'var(--text-primary)' }}>
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Skills ────────────────────────────────────────────────────── */}
      <section className="section-alt" ref={skillsRef}>
        <div className="container">
          <div className="section-header">
            <div className="tag">Skills</div>
            <h2 className="h-section">My <span className="gradient-text">Technical Skills</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.25rem' }}>
            {Object.entries(grouped).map(([cat, catSkills]) => (
              <motion.div key={cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4 }}
                className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: CAT_COLORS[cat] || 'var(--primary-light)', marginBottom: '1.25rem' }}>
                  {CAT_LABELS[cat] || cat}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {catSkills.map(s => <SkillBar key={s.id} skill={s} animate={animate} />)}
                </div>
              </motion.div>
            ))}
          </div>

          {skills.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>Skills coming soon.</p>
          )}
        </div>
      </section>
    </div>
  )
}
