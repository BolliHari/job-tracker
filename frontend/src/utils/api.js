import axios from 'axios'

export const API_BASE_URL = 'http://localhost:5000/api'
export const APP_BASE_URL = 'http://localhost:5173'

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
