import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiBriefcase, FiAward, FiStar, FiBook, FiMessageSquare, FiMail } from 'react-icons/fi'
import { getDashboardStats, getMessages } from '../../services/api'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data)).catch(() => {})
    getMessages().then(r => setMessages((r.data.results || r.data).slice(0, 5))).catch(() => {})
  }, [])

  const statCards = stats ? [
    { icon: FiBriefcase, label: 'Projects', value: stats.total_projects, color: '#7c3aed', link: '/admin/projects' },
    { icon: FiAward, label: 'Certifications', value: stats.total_certifications, color: '#06b6d4', link: '/admin/certifications' },
    { icon: FiStar, label: 'Skills', value: stats.total_skills, color: '#f59e0b', link: '/admin/skills' },
    { icon: FiBook, label: 'Education', value: stats.total_education, color: '#10b981', link: '/admin/education' },
    { icon: FiMessageSquare, label: 'Messages', value: stats.total_messages, color: '#f472b6', link: '/admin/messages' },
    { icon: FiMail, label: 'Unread', value: stats.unread_messages, color: '#ef4444', link: '/admin/messages' },
  ] : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>
          Dashboard
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Overview of your portfolio content</p>
      </div>

      {/* Stats Grid */}
      <motion.div initial="hidden" animate="show" variants={stagger}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, link }) => (
          <motion.div key={label} variants={fadeUp}>
            <Link to={link} className="card p-5 flex items-center gap-4 block hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Messages */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Recent Messages</h2>
          <Link to="/admin/messages" className="text-sm" style={{ color: 'var(--primary-light)' }}>View all</Link>
        </div>
        {messages.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No messages yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map(msg => (
              <div key={msg.id} className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                  {msg.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{msg.name}</span>
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{msg.message}</p>
                </div>
                <div className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {new Date(msg.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
