import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiGithub, FiLinkedin, FiMail, FiDownload, FiArrowRight, FiExternalLink, FiCode } from 'react-icons/fi'
import { SiLeetcode } from 'react-icons/si'
import { getProfile, getProjects, getSkills } from '../../services/api'

const fadeUp   = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }
const stagger  = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

export default function Home() {
  const [profile,  setProfile]  = useState(null)
  const [projects, setProjects] = useState([])
  const [skills,   setSkills]   = useState([])

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
    getProjects({ featured: 'true' }).then(r => setProjects((r.data.results ?? r.data).slice(0, 3))).catch(() => {})
    getSkills().then(r => setSkills((r.data.results ?? r.data).slice(0, 14))).catch(() => {})
  }, [])

  const socials = [
    { icon: FiGithub,   href: profile?.github_url,   label: 'GitHub' },
    { icon: FiLinkedin, href: profile?.linkedin_url,  label: 'LinkedIn' },
    { icon: SiLeetcode, href: profile?.leetcode_url,  label: 'LeetCode' },
    { icon: FiMail,     href: `mailto:${profile?.email}`, label: 'Email' },
  ].filter(s => s.href && s.href !== 'mailto:' && s.href !== 'mailto:undefined')

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero">
        {/* Decorative blobs */}
        <div className="hero-blob" style={{ width: 600, height: 600, top: '-10%', right: '-8%', background: 'radial-gradient(circle,#7c3aed,transparent)' }} />
        <div className="hero-blob" style={{ width: 400, height: 400, bottom: '5%',  left: '-6%',  background: 'radial-gradient(circle,#06b6d4,transparent)', animationDelay: '2s' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'center' }}>

            {/* Text side */}
            <motion.div variants={stagger} initial="hidden" animate="show" style={{ maxWidth: 620 }}>
              <motion.span variants={fadeUp} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 18px', borderRadius: 99,
                background: 'rgba(16,185,129,0.12)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.28)',
                fontSize: '.78rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'glow-pulse 2s infinite' }} />
                Available for Work
              </motion.span>

              <motion.h1 variants={fadeUp} className="h-display" style={{ marginBottom: '1rem' }}>
                Hi, I'm{' '}
                <span className="gradient-text">{profile?.name || 'Your Name'}</span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {profile?.title || 'Full Stack Developer'}
              </motion.p>

              <motion.p variants={fadeUp} className="text-body" style={{ marginBottom: '2rem', maxWidth: 520 }}>
                {profile?.bio || 'Passionate developer building modern web applications with elegant design and clean code.'}
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
                <Link to="/projects" className="btn btn-primary">View My Work <FiArrowRight /></Link>
                {profile?.resume_url
                  ? <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><FiDownload /> Resume</a>
                  : <Link to="/contact" className="btn btn-outline"><FiMail /> Contact Me</Link>
                }
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.625rem' }}>
                {socials.map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="btn-icon" aria-label={label} title={label}
                    style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <Icon size={19} />
                  </a>
                ))}
              </motion.div>
            </motion.div>

            {/* Avatar side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{ flexShrink: 0 }}
              className="hero-avatar-wrap"
            >
              <div className="float" style={{ position: 'relative' }}>
                <div className="glow-pulse" style={{
                  width: 'clamp(220px,28vw,300px)', height: 'clamp(220px,28vw,300px)',
                  borderRadius: '50%', overflow: 'hidden',
                  border: '3px solid var(--primary)',
                }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCode size={72} style={{ color: 'rgba(255,255,255,0.7)' }} />
                      </div>
                  }
                </div>
                {/* Floating chips */}
                <div style={{ position: 'absolute', top: -14, right: -14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 14px', backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
                  <span className="gradient-text" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{profile?.years_of_experience || 1}+ Years Exp</span>
                </div>
                <div style={{ position: 'absolute', bottom: -14, left: -14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 14px', backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.9rem' }}>{projects.length || 10}+ Projects</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <style>{`@media(max-width:767px){.hero-avatar-wrap{display:none}div[style*="grid-template-columns: 1fr auto"]{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── Tech Stack ──────────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <section className="section-alt">
          <div className="container">
            <div className="section-header">
              <div className="tag">Tech Stack</div>
              <h2 className="h-section">Technologies I Work With</h2>
            </div>
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}
            >
              {skills.map(s => (
                <motion.span key={s.id} variants={fadeUp}
                  className="card"
                  style={{ padding: '8px 18px', fontSize: '0.875rem', fontWeight: 500, cursor: 'default', borderRadius: 99 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  {s.name}
                </motion.span>
              ))}
            </motion.div>
            <div style={{ textAlign: 'center' }}>
              <Link to="/about" className="btn btn-outline">View All Skills <FiArrowRight /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Projects ────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div className="tag">Featured Work</div>
              <h2 className="h-section">Recent Projects</h2>
              <p>A selection of what I've built recently.</p>
            </div>
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}
            >
              {projects.map(p => (
                <motion.div key={p.id} variants={fadeUp} className="card card-hover"
                  style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {p.screenshots?.[0]?.image_url && (
                    <div style={{ height: 180, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={p.screenshots[0].image_url} alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    </div>
                  )}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{p.title}</h3>
                      <span className={`status-badge badge-${p.status}`}>{p.status.replace('_', ' ')}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '0.875rem', flex: 1 }}>
                      {p.short_description || p.description?.slice(0, 110) + '…'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
                      {(p.tech_stack ?? []).slice(0, 3).map(t => <span key={t} className="tag-tech">{t}</span>)}
                      {p.tech_stack?.length > 3 && <span className="tag-tech">+{p.tech_stack.length - 3}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--text-muted)', transition: 'color .2s' }} onMouseEnter={e=>e.currentTarget.style.color='var(--primary-light)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}><FiGithub size={14}/> Code</a>}
                      {p.live_url && <a href={p.live_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--secondary)' }}><FiExternalLink size={14}/> Live</a>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div style={{ textAlign: 'center' }}>
              <Link to="/projects" className="btn btn-primary">All Projects <FiArrowRight /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="section-alt">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grad-border"
            style={{ textAlign: 'center', padding: 'clamp(2.5rem,6vw,4rem) clamp(1.5rem,5vw,3rem)' }}
          >
            <h2 className="h-section" style={{ marginBottom: '1rem' }}>Let's Build Something Amazing</h2>
            <p className="text-body" style={{ maxWidth: 520, margin: '0 auto 2rem' }}>
              Open to new opportunities, freelance projects, and exciting collaborations.
            </p>
            <Link to="/contact" className="btn btn-primary"><FiMail /> Get In Touch <FiArrowRight /></Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
