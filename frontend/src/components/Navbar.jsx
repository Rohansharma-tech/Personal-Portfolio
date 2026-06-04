import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'

const navLinks = [
  { label: 'Home',           path: '/' },
  { label: 'About',          path: '/about' },
  { label: 'Projects',       path: '/projects' },
  { label: 'Education',      path: '/education' },
  { label: 'Certifications', path: '/certifications' },
  { label: 'Contact',        path: '/contact' },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <header className={`nav-root ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">⚡</div>
          <span className="gradient-text">Portfolio</span>
        </Link>

        {/* Desktop links */}
        <nav className="nav-links" style={{ display: 'none' }} aria-label="Main navigation"
          ref={el => { if (el) el.style.display = 'flex' }}
        >
          {navLinks.map(l => (
            <Link key={l.path} to={l.path}
              className={`nav-link ${location.pathname === l.path ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA — desktop */}
        <div className="hidden-mobile" style={{ flexShrink: 0 }}>
          <Link to="/contact" className="btn btn-primary btn-sm">Hire Me</Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="btn-icon show-mobile"
          aria-label="Toggle menu"
          style={{ marginLeft: 'auto' }}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(7,9,15,0.96)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div className="container" style={{ padding: '1rem var(--container-px)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map(l => (
                <Link key={l.path} to={l.path}
                  className={`nav-link ${location.pathname === l.path ? 'active' : ''}`}
                  style={{ padding: '12px 16px' }}
                >
                  {l.label}
                </Link>
              ))}
              <div style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                <Link to="/contact" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Hire Me
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(min-width:768px) { .show-mobile{display:none!important} }
        @media(max-width:767px) { .hidden-mobile{display:none!important} .nav-links{display:none!important} }
      `}</style>
    </header>
  )
}
