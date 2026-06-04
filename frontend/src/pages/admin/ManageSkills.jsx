import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiPlus, FiX, FiLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getSkills, createSkill, updateSkill, deleteSkill } from '../../services/api'

const CATEGORIES = [
  { value: 'language', label: 'Programming Language' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'devops', label: 'DevOps' },
  { value: 'tools', label: 'Tools & Others' },
  { value: 'mobile', label: 'Mobile' },
]

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

const empty = { name: '', category: 'backend', percentage: 80, order: 0, icon_url: '' }

export default function ManageSkills() {
  const [skills, setSkills] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => getSkills().then(r => setSkills(r.data.results || r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true) }
  const openEdit = (s) => {
    setForm({ name: s.name, category: s.category, percentage: s.percentage, order: s.order, icon_url: s.icon_url || '' })
    setEditing(s.id)
    setModal(true)
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      editing ? await updateSkill(editing, form) : await createSkill(form)
      toast.success(editing ? 'Skill updated!' : 'Skill added!')
      setModal(false)
      load()
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message || 'Failed to save.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this skill?')) return
    try {
      await deleteSkill(id)
      toast.success('Skill deleted!')
      load()
    } catch (err) {
      const msg = err.response?.status === 403
        ? 'Permission denied. Please log in again.'
        : err.response?.data?.detail || err.message || 'Failed to delete.'
      toast.error(msg)
    }
  }

  const grouped = skills.reduce((a, s) => {
    ;(a[s.category] = a[s.category] || []).push(s)
    return a
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>Skills</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            {skills.length} skills across {Object.keys(grouped).length} categories
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary"><FiPlus /> Add Skill</button>
      </div>

      {Object.entries(grouped).map(([cat, catSkills]) => (
        <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-4">
          <h3 className="font-bold mb-4 capitalize" style={{ color: 'var(--primary-light)' }}>
            {CATEGORY_LABELS[cat] || cat}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {catSkills.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {s.icon_url && (
                      <img src={s.icon_url} alt={s.name} className="w-4 h-4 object-contain flex-shrink-0"
                        onError={e => { e.target.style.display = 'none' }} />
                    )}
                    <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.percentage}%</div>
                  {/* Skill bar */}
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill" style={{ width: `${s.percentage}%` }} />
                  </div>
                </div>
                <div className="flex gap-1 ml-3 flex-shrink-0">
                  <button onClick={() => openEdit(s)} title="Edit"
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--primary-light)', background: 'rgba(124,58,237,0.1)' }}>
                    <FiEdit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} title="Delete"
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {skills.length === 0 && (
        <div className="text-center py-20 card">
          <p style={{ color: 'var(--text-muted)' }}>No skills yet. Add your first skill!</p>
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Edit' : 'Add'} Skill
              </h2>
              <button onClick={() => setModal(false)} style={{ color: 'var(--text-muted)' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="form-label">Skill Name *</label>
                <input className="form-input" value={form.name}
                  onChange={e => set('name', e.target.value)} required
                  placeholder="e.g. Python, React, PostgreSQL" />
              </div>

              <div>
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Icon URL <span style={{ color: 'var(--text-muted)' }}>(optional — devicons/simple-icons)</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input className="form-input flex-1" value={form.icon_url}
                    onChange={e => set('icon_url', e.target.value)}
                    placeholder="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" />
                  {form.icon_url && (
                    <img src={form.icon_url} alt="preview" className="w-8 h-8 object-contain flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 2 }}
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Proficiency: <strong style={{ color: 'var(--primary-light)' }}>{form.percentage}%</strong></label>
                <input type="range" min="0" max="100" value={form.percentage}
                  onChange={e => set('percentage', +e.target.value)}
                  className="w-full accent-purple-500 mt-1" />
                <div className="skill-bar-track mt-2">
                  <div className="skill-bar-fill" style={{ width: `${form.percentage}%` }} />
                </div>
              </div>

              <div>
                <label className="form-label">Display Order</label>
                <input type="number" className="form-input" value={form.order}
                  onChange={e => set('order', +e.target.value)} min="0" />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
