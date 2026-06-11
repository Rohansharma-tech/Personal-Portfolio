import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiGithub, FiLinkedin, FiMail, FiArrowUp } from 'react-icons/fi'
import { SiLeetcode } from 'react-icons/si'
import { getProfile } from '../services/api'

export default function Footer() {
  const year = new Date().getFullYear()
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  const socials = [
    { icon: FiGithub,   href: profile?.github_url,   label: 'GitHub' },
    { icon: FiLinkedin, href: profile?.linkedin_url,  label: 'LinkedIn' },
    { icon: SiLeetcode, href: profile?.leetcode_url,  label: 'LeetCode' },
    { icon: FiMail,     href: profile?.email ? `mailto:${profile.email}` : null, label: 'Email' },
  ].filter(s => s.href && s.href !== 'mailto:undefined' && s.href !== 'mailto:')

  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ paddingBlock: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <div className="nav-logo-icon">⚡</div>
              <span className="gradient-text" style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem' }}>
                {profile?.name || 'Portfolio'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '220px' }}>
              {profile?.title || 'Full Stack Developer'} — building modern web experiences with passion and precision.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[['/', 'Home'], ['/about', 'About'], ['/projects', 'Projects'], ['/certifications', 'Certifications'], ['/contact', 'Contact']].map(([path, label]) => (
                <Link key={path} to={path}
                  style={{ color: 'var(--text-muted)', fontSize: '0.875rem', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Connect
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="btn-icon" aria-label={label} title={label}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
            © {year} {profile?.name || 'Rohan Sharma'} · Built with React &amp; Django ·{' '}
            <Link to="/admin/login" style={{ color: 'var(--text-muted)', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Admin
            </Link>
          </p>
          <button onClick={scrollTop} className="btn-icon" title="Back to top" aria-label="Back to top">
            <FiArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}
