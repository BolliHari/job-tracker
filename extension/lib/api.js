import { CONFIG } from '../config.js'

const USER_KEY = 'user'

export async function getStoredUser() {
  const { [USER_KEY]: user } = await chrome.storage.local.get(USER_KEY)
  return user || null
}

export async function setStoredUser(user) {
  await chrome.storage.local.set({ [USER_KEY]: user })
}

export async function clearStoredUser() {
  await chrome.storage.local.remove(USER_KEY)
}

async function apiFetch(path, options = {}) {
  const user = await getStoredUser()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`
  }

  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`)
  }
  return data
}

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const user = {
    token: data.token,
    name: data.name,
    email: data.email,
  }
  await setStoredUser(user)
  return user
}

export async function createJob(job) {
  return apiFetch('/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  })
}

export async function summarizeJd(jobDescription) {
  return apiFetch('/ai/summarize-jd', {
    method: 'POST',
    body: JSON.stringify({ jobDescription }),
  })
}

export async function checkHealth() {
  return apiFetch('/health')
}
