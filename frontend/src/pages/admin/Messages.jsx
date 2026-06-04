import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrash2, FiMail, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getMessages, markMessageRead, deleteMessage } from '../../services/api'

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const load = () => getMessages().then(r => setMessages(r.data.results || r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const handleRead = async id => {
    try { await markMessageRead(id); load() }
    catch { toast.error('Failed to mark as read.') }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this message?')) return
    try { await deleteMessage(id); toast.success('Deleted!'); load(); if (selected?.id === id) setSelected(null) }
    catch { toast.error('Failed to delete.') }
  }

  const filtered = filter === 'unread' ? messages.filter(m => !m.is_read)
    : filter === 'read' ? messages.filter(m => m.is_read)
    : messages

  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>Messages</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            {messages.length} total · <span style={{ color: unreadCount > 0 ? '#ef4444' : 'var(--text-muted)' }}>{unreadCount} unread</span>
          </p>
        </div>
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
              style={{
                background: filter === f ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message List */}
        <div className="flex flex-col gap-3">
          {filtered.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => { setSelected(msg); if (!msg.is_read) handleRead(msg.id) }}
              className="card p-4 cursor-pointer transition-all"
              style={{ borderColor: selected?.id === msg.id ? 'var(--primary)' : msg.is_read ? 'var(--border)' : 'rgba(239,68,68,0.4)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white"
                    style={{ background: 'var(--gradient-primary)' }}>
                    {msg.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{msg.name}</span>
                      {!msg.is_read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />}
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{msg.subject || msg.message}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    {!msg.is_read && (
                      <button onClick={e => { e.stopPropagation(); handleRead(msg.id) }}
                        className="p-1 rounded" style={{ color: '#10b981' }}><FiCheck size={13} /></button>
                    )}
                    <button onClick={e => { e.stopPropagation(); handleDelete(msg.id) }}
                      className="p-1 rounded" style={{ color: '#ef4444' }}><FiTrash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 card" style={{ color: 'var(--text-muted)' }}>No messages here.</div>
          )}
        </div>

        {/* Message Detail */}
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 h-fit">
            <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                style={{ background: 'var(--gradient-primary)' }}>
                {selected.name[0].toUpperCase()}
              </div>
              <div>
                <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</div>
                <a href={`mailto:${selected.email}`} className="text-sm flex items-center gap-1"
                  style={{ color: 'var(--secondary)' }}>
                  <FiMail size={12} /> {selected.email}
                </a>
              </div>
            </div>
            {selected.subject && (
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{selected.subject}</h3>
            )}
            <p className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.message}</p>
            <div className="mt-5 pt-5 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(selected.created_at).toLocaleString()}
              </span>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message'}`}
                className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <FiMail /> Reply
              </a>
            </div>
          </motion.div>
        ) : (
          <div className="card p-6 flex items-center justify-center" style={{ color: 'var(--text-muted)', minHeight: '200px' }}>
            Select a message to read
          </div>
        )}
      </div>
    </div>
  )
}
