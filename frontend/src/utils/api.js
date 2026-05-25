import axios from 'axios'

export const API_BASE_URL = "https://job-tracker-server-r4lr.onrender.com"
export const APP_BASE_URL = "https://job-tracker-u64j.vercel.app"

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
