import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiSave, FiUser, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getProfile, updateProfile } from '../../services/api'

export default function ManageProfile() {
  const [form, setForm] = useState({ name: '', title: '', bio: '', career_objective: '', email: '', phone: '', location: '', github_url: '', linkedin_url: '', leetcode_url: '', twitter_url: '', website_url: '', years_of_experience: 0 })
  const [avatarFile, setAvatarFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const avatarRef = useRef()
  const resumeRef = useRef()

  useEffect(() => {
    getProfile().then(r => {
      const d = r.data
      setProfile(d)
      setForm({ name: d.name || '', title: d.title || '', bio: d.bio || '', career_objective: d.career_objective || '', email: d.email || '', phone: d.phone || '', location: d.location || '', github_url: d.github_url || '', linkedin_url: d.linkedin_url || '', leetcode_url: d.leetcode_url || '', twitter_url: d.twitter_url || '', website_url: d.website_url || '', years_of_experience: d.years_of_experience || 0 })
    }).catch(() => {})
  }, [])

  const handleAvatarChange = e => {
    const f = e.target.files[0]
    if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) }
  }

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (avatarFile) fd.append('avatar', avatarFile)
    if (resumeFile) fd.append('resume', resumeFile)
    try {
      await updateProfile(fd)
      toast.success('Profile updated successfully!')
    } catch { toast.error('Failed to update profile.') }
    finally { setLoading(false) }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>Manage Profile</h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Update your personal information and social links</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar & Resume Column */}
          <div className="flex flex-col gap-4">
            <div className="card p-6 text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)', border: '3px solid var(--primary)' }}>
                {(avatarPreview || profile?.avatar_url) ? (
                  <img src={avatarPreview || profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <FiUser size={40} className="text-white" />
                )}
              </div>
              <button type="button" onClick={() => avatarRef.current.click()} className="btn-outline text-sm w-full">
                <FiUpload /> Change Photo
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Resume</h3>
              {profile?.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm block mb-3" style={{ color: 'var(--secondary)' }}>
                  Current resume ↗
                </a>
              )}
              <button type="button" onClick={() => resumeRef.current.click()} className="btn-outline text-sm w-full">
                <FiUpload /> {resumeFile ? resumeFile.name : 'Upload Resume (PDF)'}
              </button>
              <input ref={resumeRef} type="file" accept=".pdf" className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
            </div>
          </div>

          {/* Main Form Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Basic Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                <div><label className="form-label">Title / Role</label>
                  <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
                <div><label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                <div><label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                <div><label className="form-label">Location</label>
                  <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} /></div>
                <div><label className="form-label">Years of Experience</label>
                  <input type="number" className="form-input" value={form.years_of_experience} onChange={e => set('years_of_experience', +e.target.value)} /></div>
              </div>
              <div className="mt-4"><label className="form-label">Bio</label>
                <textarea className="form-input" rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} /></div>
              <div className="mt-4"><label className="form-label">Career Objective</label>
                <textarea className="form-input" rows={3} value={form.career_objective} onChange={e => set('career_objective', e.target.value)} /></div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Social Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['github_url', 'GitHub URL'], ['linkedin_url', 'LinkedIn URL'], ['leetcode_url', 'LeetCode URL'], ['twitter_url', 'Twitter URL'], ['website_url', 'Website URL']].map(([key, label]) => (
                  <div key={key}><label className="form-label">{label}</label>
                    <input type="url" className="form-input" value={form[key]} onChange={e => set(key, e.target.value)} placeholder="https://" /></div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary self-start">
              <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
