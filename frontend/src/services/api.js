import axios from 'axios'

// VITE_API_URL is the backend base (e.g. https://your-app.up.railway.app)
// /api is appended here so non-API routes stay flexible
const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh/`,
          { refresh }
        )
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login = (credentials) => api.post('/auth/login/', credentials)

// ─── Profile ─────────────────────────────────────────────────────────────────
export const getProfile = () => api.get('/profile/')
export const updateProfile = (data) => api.patch('/profile/update/', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

// ─── Skills ──────────────────────────────────────────────────────────────────
export const getSkills = () => api.get('/skills/')
export const createSkill = (data) => api.post('/skills/', data)
export const updateSkill = (id, data) => api.put(`/skills/${id}/`, data)
export const deleteSkill = (id) => api.delete(`/skills/${id}/`)

// ─── Education ───────────────────────────────────────────────────────────────
export const getEducation = () => api.get('/education/')
export const createEducation = (data) => api.post('/education/', data)
export const updateEducation = (id, data) => api.put(`/education/${id}/`, data)
export const deleteEducation = (id) => api.delete(`/education/${id}/`)

// ─── Certifications ──────────────────────────────────────────────────────────
export const getCertifications = () => api.get('/certifications/')
export const createCertification = (data) => api.post('/certifications/', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const updateCertification = (id, data) => api.patch(`/certifications/${id}/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
export const deleteCertification = (id) => api.delete(`/certifications/${id}/`)

// ─── Projects ────────────────────────────────────────────────────────────────
export const getProjects = (params) => api.get('/projects/', { params })
export const createProject = (data) => api.post('/projects/', data)
export const updateProject = (id, data) => api.patch(`/projects/${id}/`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}/`)
export const uploadScreenshots = (projectId, formData) =>
  api.post(`/projects/${projectId}/screenshots/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const deleteScreenshot = (projectId, screenshotId) =>
  api.delete(`/projects/${projectId}/screenshots/`, { data: { screenshot_id: screenshotId } })

// ─── Contact ─────────────────────────────────────────────────────────────────
export const sendContact = (data) => api.post('/contact/', data)
export const getMessages = () => api.get('/contact/messages/')
export const markMessageRead = (id) => api.patch(`/contact/messages/${id}/read/`)
export const deleteMessage = (id) => api.delete(`/contact/messages/${id}/`)

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats/')
