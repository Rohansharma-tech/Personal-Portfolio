import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiPlus, FiX, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getCertifications, createCertification, updateCertification, deleteCertification } from '../../services/api'

const empty = { title: '', issuer: '', issue_date: '', expiry_date: '', credential_id: '', verification_url: '', category: '', certificate_image: null, certificate_pdf: null }

export default function ManageCertifications() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => getCertifications().then(r => setItems(r.data.results || r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true) }
  const openEdit = c => {
    setForm({ title: c.title, issuer: c.issuer, issue_date: c.issue_date, expiry_date: c.expiry_date || '', credential_id: c.credential_id || '', verification_url: c.verification_url || '', category: c.category || '', certificate_image: null, certificate_pdf: null })
    setEditing(c.id); setModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v) })
    try {
      editing ? await updateCertification(editing, fd) : await createCertification(fd)
      toast.success(editing ? 'Updated!' : 'Added!'); setModal(false); load()
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message || 'Failed to save.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this certification?')) return
    try { await deleteCertification(id); toast.success('Deleted!'); load() }
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
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>Certifications</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>{items.length} certifications</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><FiPlus /> Add Certificate</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(cert => (
          <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
            {cert.certificate_image_url && (
              <div className="h-36 overflow-hidden">
                <img src={cert.certificate_image_url} alt={cert.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              {cert.category && <span className="tech-badge mb-2 inline-block">{cert.category}</span>}
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{cert.title}</h3>
              <p className="text-xs mb-1" style={{ color: 'var(--primary-light)' }}>{cert.issuer}</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{new Date(cert.issue_date).toLocaleDateString()}</p>
              <div className="flex gap-2">
                {cert.verification_url && (
                  <a href={cert.verification_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs" style={{ color: 'var(--secondary)' }}>
                    <FiExternalLink className="inline mr-1" />Verify
                  </a>
                )}
                <button onClick={() => openEdit(cert)} className="p-1.5 rounded-lg ml-auto" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--primary-light)' }}><FiEdit2 size={13} /></button>
                <button onClick={() => handleDelete(cert.id)} className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><FiTrash2 size={13} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 card"><p style={{ color: 'var(--text-muted)' }}>No certifications yet.</p></div>
      )}

      {modal && (
        <div className="modal-overlay">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{editing ? 'Edit' : 'Add'} Certification</h2>
              <button onClick={() => setModal(false)} style={{ color: 'var(--text-muted)' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div><label className="form-label">Certificate Title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required /></div>
              <div><label className="form-label">Issuing Organization *</label>
                <input className="form-input" value={form.issuer} onChange={e => set('issuer', e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Issue Date *</label>
                  <input type="date" className="form-input" value={form.issue_date} onChange={e => set('issue_date', e.target.value)} required /></div>
                <div><label className="form-label">Expiry Date</label>
                  <input type="date" className="form-input" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} /></div>
              </div>
              <div><label className="form-label">Credential ID</label>
                <input className="form-input" value={form.credential_id} onChange={e => set('credential_id', e.target.value)} /></div>
              <div><label className="form-label">Category (e.g. Cloud, Web Dev)</label>
                <input className="form-input" value={form.category} onChange={e => set('category', e.target.value)} /></div>
              <div><label className="form-label">Verification URL</label>
                <input type="url" className="form-input" value={form.verification_url} onChange={e => set('verification_url', e.target.value)} /></div>
              <div><label className="form-label">Certificate Image</label>
                <input type="file" accept="image/*" className="form-input" onChange={e => set('certificate_image', e.target.files[0])} /></div>
              <div><label className="form-label">Certificate PDF</label>
                <input type="file" accept="application/pdf" className="form-input" onChange={e => set('certificate_pdf', e.target.files[0])} /></div>
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
