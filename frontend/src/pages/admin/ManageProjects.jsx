import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiPlus, FiX, FiGithub, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getProjects, createProject, updateProject, deleteProject, uploadScreenshots } from '../../services/api'

const STATUS_OPTIONS = ['completed', 'in_progress', 'planned', 'archived']
const empty = { title: '', description: '', short_description: '', tech_stack: '', features: '', github_url: '', live_url: '', status: 'completed', is_featured: false, order: 0 }

export default function ManageProjects() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [screenshots, setScreenshots] = useState([])
  const [loading, setLoading] = useState(false)

  const load = () => getProjects().then(r => setItems(r.data.results || r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setEditing(null); setScreenshots([]); setModal(true) }
  const openEdit = p => {
    setForm({ title: p.title, description: p.description, short_description: p.short_description || '', tech_stack: (p.tech_stack || []).join(', '), features: (p.features || []).join('\n'), github_url: p.github_url || '', live_url: p.live_url || '', status: p.status, is_featured: p.is_featured, order: p.order })
    setEditing(p.id); setScreenshots([]); setModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    const payload = {
      ...form,
      tech_stack: form.tech_stack.split(',').map(t => t.trim()).filter(Boolean),
      features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
    }
    try {
      let projectId = editing
      if (editing) { await updateProject(editing, payload) }
      else { const r = await createProject(payload); projectId = r.data.id }
      if (screenshots.length > 0 && projectId) {
        const fd = new FormData()
        screenshots.forEach(f => fd.append('images', f))
        await uploadScreenshots(projectId, fd)
      }
      toast.success(editing ? 'Project updated!' : 'Project added!'); setModal(false); load()
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message || 'Failed to save project.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this project?')) return
    try { await deleteProject(id); toast.success('Project deleted!'); load() }
    catch (err) {
      const msg = err.response?.status === 403 ? 'Permission denied.' : err.response?.data?.detail || err.message || 'Failed to delete.'
      toast.error(msg)
    }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>Projects</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>{items.length} projects</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><FiPlus /> Add Project</button>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th><th>Tech Stack</th><th>Status</th><th>Featured</th><th>Links</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.title}</div>
                  <div className="text-xs truncate max-w-48" style={{ color: 'var(--text-muted)' }}>{p.short_description || p.description?.slice(0, 60)}</div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {(p.tech_stack || []).slice(0, 3).map(t => <span key={t} className="tag-tech">{t}</span>)}
                    {p.tech_stack?.length > 3 && <span className="tag-tech">+{p.tech_stack.length - 3}</span>}
                  </div>
                </td>
                <td><span className={`status-badge badge-${p.status}`}>{p.status.replace('_', ' ')}</span></td>
                <td><span style={{ color: p.is_featured ? '#10b981' : 'var(--text-muted)' }}>{p.is_featured ? 'Yes' : 'No'}</span></td>
                <td>
                  <div className="flex gap-2">
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><FiGithub size={14} /></a>}
                    {p.live_url && <a href={p.live_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)' }}><FiExternalLink size={14} /></a>}
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--primary-light)' }}><FiEdit2 size={13} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><FiTrash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>No projects yet.</div>}
      </div>

      {modal && (
        <div className="modal-overlay">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{editing ? 'Edit' : 'Add'} Project</h2>
              <button onClick={() => setModal(false)} style={{ color: 'var(--text-muted)' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div><label className="form-label">Project Title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required /></div>
              <div><label className="form-label">Short Description</label>
                <input className="form-input" value={form.short_description} onChange={e => set('short_description', e.target.value)} /></div>
              <div><label className="form-label">Full Description *</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} required /></div>
              <div><label className="form-label">Tech Stack (comma separated)</label>
                <input className="form-input" value={form.tech_stack} onChange={e => set('tech_stack', e.target.value)} placeholder="React, Django, PostgreSQL" /></div>
              <div><label className="form-label">Features (one per line)</label>
                <textarea className="form-input" rows={3} value={form.features} onChange={e => set('features', e.target.value)} placeholder="User authentication&#10;Real-time updates" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">GitHub URL</label>
                  <input type="url" className="form-input" value={form.github_url} onChange={e => set('github_url', e.target.value)} /></div>
                <div><label className="form-label">Live URL</label>
                  <input type="url" className="form-input" value={form.live_url} onChange={e => set('live_url', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select></div>
                <div><label className="form-label">Order</label>
                  <input type="number" className="form-input" value={form.order} onChange={e => set('order', +e.target.value)} /></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-purple-500" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Featured Project</span>
              </label>
              <div><label className="form-label">Screenshots (upload images)</label>
                <input type="file" accept="image/*" multiple className="form-input"
                  onChange={e => setScreenshots(Array.from(e.target.files))} /></div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
