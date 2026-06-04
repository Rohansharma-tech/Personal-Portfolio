import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { login as loginApi } from '../services/api'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { data } = await loginApi(credentials)
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        set({ isAuthenticated: true, user: { username: credentials.username } })
        return data
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ isAuthenticated: false, user: null })
      },
    }),
    { name: 'auth-store' }
  )
)

export default useAuthStore
