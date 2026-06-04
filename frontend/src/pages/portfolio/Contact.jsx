import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiSend, FiGithub, FiLinkedin } from 'react-icons/fi'
import { SiLeetcode } from 'react-icons/si'
import toast from 'react-hot-toast'
import { sendContact, getProfile } from '../../services/api'

const fadeUp  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

export default function Contact() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields.'); return }
    setLoading(true)
    try {
      await sendContact(form)
      toast.success('Message sent! I\'ll get back to you soon.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch { toast.error('Failed to send. Please try again.') }
    finally { setLoading(false) }
  }

  const contactInfo = [
    { icon: FiMail,   label: 'Email',    value: profile?.email || 'your@email.com',    href: profile?.email ? `mailto:${profile.email}` : 'mailto:your@email.com' },
    { icon: FiPhone,  label: 'Phone',    value: profile?.phone || '+91 00000 00000',   href: profile?.phone ? `tel:${profile.phone.replace(/\s+/g, '')}` : 'tel:+910000000000' },
    { icon: FiMapPin, label: 'Location', value: profile?.location || 'India',              href: null },
  ]
  const socials = [
    { icon: FiGithub,   href: profile?.github_url || 'https://github.com',   label: 'GitHub' },
    { icon: FiLinkedin, href: profile?.linkedin_url || 'https://linkedin.com',  label: 'LinkedIn' },
    { icon: SiLeetcode, href: profile?.leetcode_url || 'https://leetcode.com',  label: 'LeetCode' },
    { icon: FiMail,     href: profile?.email ? `mailto:${profile.email}` : 'mailto:your@email.com', label: 'Email' },
  ]

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
            </motion.div>

            {/* Right: Form */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}>
              <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Send a Message</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div className="form-group">
                    <label className="form-label">Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="your@email.com" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange} className="form-input" placeholder="What's this about?" />
                </div>

                <div className="form-group">
                  <label className="form-label">Message <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    className="form-input" rows={5} placeholder="Tell me about your project or idea…" />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}>
                  {loading
                    ? <span style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    : <><FiSend /> Send Message</>
                  }
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:540px){form[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
