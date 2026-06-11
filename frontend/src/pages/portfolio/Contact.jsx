import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiSend, FiGithub, FiLinkedin, FiClock, FiShield } from 'react-icons/fi'
import { SiLeetcode } from 'react-icons/si'
import toast from 'react-hot-toast'
import { sendContact, getProfile } from '../../services/api'
import { usePageSEO } from '../../hooks/usePageSEO'

const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

// ── Cooldown countdown hook ────────────────────────────────────────────────
function useCooldown() {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const timerRef = useRef(null)

  const start = (seconds) => {
    setSecondsLeft(seconds)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const isLocked = secondsLeft > 0
  const label = secondsLeft >= 60
    ? `${Math.ceil(secondsLeft / 60)}m ${secondsLeft % 60}s`
    : `${secondsLeft}s`

  return { isLocked, secondsLeft, label, start }
}

export default function Contact() {
  usePageSEO({
    title: 'Contact',
    description: 'Get in touch with Rohan Sharma. Available for freelance work, collaborations, and full-time opportunities. Based in India.',
  })

  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const { isLocked, label, start } = useCooldown()

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (isLocked) return
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields.'); return }
    setLoading(true)
    try {
      await sendContact(form)
      toast.success("Message sent! I'll get back to you soon.")
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      const res = err?.response
      if (res?.status === 429) {
        // Server told us exactly how long to wait
        const retryAfter = res?.data?.retry_after ?? res?.data?.detail?.retry_after ?? 60
        start(retryAfter)
        toast.error(res?.data?.message ?? res?.data?.detail?.message ?? 'Too many requests. Please wait.', { duration: 5000 })
      } else {
        toast.error('Failed to send. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    { icon: FiMail,   label: 'Email',    value: profile?.email    || 'your@email.com',   href: profile?.email    ? `mailto:${profile.email}` : null },
    { icon: FiPhone,  label: 'Phone',    value: profile?.phone    || '+91 00000 00000',  href: profile?.phone    ? `tel:${profile.phone.replace(/\s+/g, '')}` : null },
    { icon: FiMapPin, label: 'Location', value: profile?.location || 'India',            href: null },
  ]
  const socials = [
    { icon: FiGithub,   href: profile?.github_url,   label: 'GitHub' },
    { icon: FiLinkedin, href: profile?.linkedin_url,  label: 'LinkedIn' },
    { icon: SiLeetcode, href: profile?.leetcode_url,  label: 'LeetCode' },
    { icon: FiMail,     href: profile?.email ? `mailto:${profile.email}` : null, label: 'Email' },
  ].filter(s => s.href)

  const submitDisabled = loading || isLocked

  return (
    <div className="page-offset">
      <section className="section" style={{ background: 'var(--bg-primary)', backgroundImage: 'var(--grad-hero)' }}>
        <div className="container">
          <div className="section-header">
            <div className="tag">Contact</div>
            <h1 className="h-section">Let's <span className="gradient-text">Connect</span></h1>
            <p>Have a project in mind or just want to say hi? I'd love to hear from you.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2rem', maxWidth: 980, margin: '0 auto', alignItems: 'start' }}>
            {/* Left: Info + social */}
            <motion.div variants={stagger} initial="hidden" animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <motion.div key={label} variants={fadeUp} className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem' }}>
                  <div className="btn-icon" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}>
                    <Icon size={19} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                    {href
                      ? <a href={href} style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', transition: 'color .2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>{value}</a>
                      : <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{value}</span>
                    }
                  </div>
                </motion.div>
              ))}

              <motion.div variants={fadeUp} className="card" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: '1rem' }}>Find me on</p>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  {socials.map(({ icon: Icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="btn-icon" aria-label={label} title={label}>
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Rate limit info badge */}
              <motion.div variants={fadeUp} className="card"
                style={{ padding: '0.875rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiShield size={15} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  To prevent spam, submissions are limited to <strong style={{ color: 'var(--text-secondary)' }}>5 per hour</strong> per IP address.
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Form */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}>
              <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Send a Message</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }} className="contact-grid">
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input id="contact-name" name="name" value={form.name} onChange={handleChange}
                      className="form-input" placeholder="Your name" autoComplete="name" disabled={submitDisabled} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email" className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange}
                      className="form-input" placeholder="your@email.com" autoComplete="email" disabled={submitDisabled} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-subject" className="form-label">Subject</label>
                  <input id="contact-subject" name="subject" value={form.subject} onChange={handleChange}
                    className="form-input" placeholder="What's this about?" autoComplete="off" disabled={submitDisabled} />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">Message <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea id="contact-message" name="message" value={form.message} onChange={handleChange}
                    className="form-input" rows={5} placeholder="Tell me about your project or idea…" disabled={submitDisabled} />
                </div>

                {/* ── Rate-limit cooldown banner ── */}
                {isLocked && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.875rem 1.1rem',
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      borderRadius: 12,
                    }}>
                    <FiClock size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f59e0b', marginBottom: 2 }}>
                        Rate limit reached
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        You can send another message in <strong style={{ color: '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>{label}</strong>
                      </p>
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="btn btn-primary"
                  style={{ marginTop: '0.25rem', opacity: submitDisabled ? 0.6 : 1, cursor: submitDisabled ? 'not-allowed' : 'pointer' }}>
                  {loading
                    ? <span style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    : isLocked
                      ? <><FiClock size={15} /> Cooldown {label}</>
                      : <><FiSend size={15} /> Send Message</>
                  }
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media(max-width:540px) { .contact-grid { grid-template-columns: 1fr !important } }
        .form-input:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
