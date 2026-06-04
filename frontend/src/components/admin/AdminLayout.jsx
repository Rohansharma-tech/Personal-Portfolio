import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHome, FiUser, FiBriefcase, FiAward, FiBook,
  FiStar, FiMessageSquare, FiLogOut, FiMenu, FiX, FiCode
} from 'react-icons/fi'
import useAuthStore from '../../store/authStore'

const sidebarLinks = [
  { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: FiUser, label: 'Profile', path: '/admin/profile' },
  { icon: FiBriefcase, label: 'Projects', path: '/admin/projects' },
  { icon: FiAward, label: 'Certifications', path: '/admin/certifications' },
  { icon: FiBook, label: 'Education', path: '/admin/education' },
  { icon: FiStar, label: 'Skills', path: '/admin/skills' },
  { icon: FiMessageSquare, label: 'Messages', path: '/admin/messages' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <FiCode className="text-white" />
          </div>
          <div>
            <div className="font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>Admin</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Portfolio CMS</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 flex flex-col gap-1">
          {sidebarLinks.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: active ? 'white' : 'var(--text-secondary)',
                  background: active ? 'var(--gradient-primary)' : 'transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(124,58,237,0.1)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link to="/" target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm mb-2 transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <FiHome size={18} /> View Portfolio
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
            style={{ color: '#ef4444' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="gradient-text font-bold" style={{ fontFamily: 'Space Grotesk' }}>Admin</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: 'var(--text-primary)' }}>
          {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content pt-14 md:pt-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 md:p-8"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
