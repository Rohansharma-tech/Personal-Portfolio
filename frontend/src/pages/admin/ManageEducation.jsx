import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiPlus, FiX, FiBookOpen } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getEducation, createEducation, updateEducation, deleteEducation } from '../../services/api'

const empty = {
  degree: '',
  institution: '',
  location: '',
  cgpa: '',
  percentage: '',
  start_year: new Date().getFullYear(),
  end_year: '',
  is_current: false,
  description: '',
  order: 0,
}

export default function ManageEducation() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => getEducation().then(r => setItems(r.data.results || r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true) }
  const openEdit = (edu) => {
    setForm({
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location || '',
      cgpa: edu.cgpa ?? '',
      percentage: edu.percentage ?? '',
      start_year: edu.start_year,
      end_year: edu.end_year ?? '',
      is_current: edu.is_current,
      description: edu.description || '',
      order: edu.order || 0,
    })
    setEditing(edu.id)
    setModal(true)
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleIsCurrentToggle = (checked) => {
    setForm(p => ({ ...p, is_current: checked, end_year: checked ? '' : p.end_year }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      cgpa: form.cgpa !== '' ? parseFloat(form.cgpa) : null,
      percentage: form.percentage !== '' ? parseFloat(form.percentage) : null,
      start_year: parseInt(form.start_year),
      end_year: form.is_current || form.end_year === '' ? null : parseInt(form.end_year),
    }
    try {
      editing ? await updateEducation(editing, payload) : await createEducation(payload)
      toast.success(editing ? 'Education updated!' : 'Education added!')
      setModal(false)
      load()
    } catch (err) {
      const msg = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message || 'Failed to save.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this education record?')) return
    try {
      await deleteEducation(id)
      toast.success('Education record deleted!')
      load()
    } catch (err) {
      const msg = err.response?.status === 403
        ? 'Permission denied. Please log in again.'
        : err.response?.data?.detail || err.message || 'Failed to delete.'
      toast.error(msg)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>Education</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>{items.length} education records</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><FiPlus /> Add Education</button>
      </div>

      <div className="flex flex-col gap-4">
        {items.map(edu => (
          <motion.div key={edu.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="card p-6 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{edu.degree}</h3>
                {edu.is_current && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Current</span>
                )}
              </div>
              <p className="font-medium mb-1" style={{ color: 'var(--primary-light)' }}>{edu.institution}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {edu.start_year} – {edu.is_current ? 'Present' : (edu.end_year || 'Present')}
                {edu.location && ` · ${edu.location}`}
                {edu.cgpa && ` · CGPA: ${edu.cgpa}`}
                {edu.percentage && ` · ${edu.percentage}%`}
              </p>
              {edu.description && (
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{edu.description}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => openEdit(edu)}
                title="Edit"
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--primary-light)' }}
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(edu.id)}
                title="Delete"
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 card">
          <FiBookOpen size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No education records yet. Add your first one!</p>
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Edit' : 'Add'} Education
              </h2>
              <button onClick={() => setModal(false)} style={{ color: 'var(--text-muted)' }}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="form-label">Degree / Qualification *</label>
                <input className="form-input" value={form.degree}
                  onChange={e => set('degree', e.target.value)} required
                  placeholder="B.Tech Information Technology" />
              </div>

              <div>
                <label className="form-label">Institution *</label>
                <input className="form-input" value={form.institution}
                  onChange={e => set('institution', e.target.value)} required
                  placeholder="University / College Name" />
              </div>

              <div>
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="City, State" />
              </div>

              {/* Currently Studying toggle ABOVE the year fields */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <input type="checkbox" checked={form.is_current}
                  onChange={e => handleIsCurrentToggle(e.target.checked)}
                  className="w-4 h-4 accent-purple-500" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Currently Studying Here
                </span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Year *</label>
                  <input type="number" className="form-input" value={form.start_year}
                    onChange={e => set('start_year', e.target.value)} required
                    min="1900" max={new Date().getFullYear() + 5} />
                </div>
                <div>
                  <label className="form-label">
                    End Year {form.is_current && <span style={{ color: 'var(--text-muted)' }}>(– disabled while current)</span>}
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.is_current ? '' : form.end_year}
                    onChange={e => set('end_year', e.target.value)}
                    disabled={form.is_current}
                    placeholder={form.is_current ? 'Present' : 'e.g. 2024'}
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    style={form.is_current ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">CGPA</label>
                  <input type="number" step="0.01" min="0" max="10" className="form-input"
                    value={form.cgpa} onChange={e => set('cgpa', e.target.value)}
                    placeholder="e.g. 8.5" />
                </div>
                <div>
                  <label className="form-label">Percentage (%)</label>
                  <input type="number" step="0.01" min="0" max="100" className="form-input"
                    value={form.percentage} onChange={e => set('percentage', e.target.value)}
                    placeholder="e.g. 85.5" />
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Key highlights, achievements, coursework..." />
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
