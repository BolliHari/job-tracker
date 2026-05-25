import axios from 'axios'

// Must end with /api — backend routes are mounted at /api/auth, /api/jobs, etc.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const APP_BASE_URL =
  import.meta.env.VITE_APP_URL || 'http://localhost:5173'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('user')
    if (saved) {
      const user = JSON.parse(saved)
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`
      }
    }
  } catch {
    localStorage.removeItem('user')
  }
  return config
})
