import { CONFIG } from './config.js'
import {
  getStoredUser,
  clearStoredUser,
  login,
  createJob,
  summarizeJd,
} from './lib/api.js'

const loginSection = document.getElementById('login-section')
const appSection = document.getElementById('app-section')
const messageEl = document.getElementById('message')
const userLabel = document.getElementById('user-label')
const jobForm = document.getElementById('job-form')
const siteChips = document.getElementById('site-chips')

let jdSummary = null

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function showMessage(text, type = 'info') {
  messageEl.textContent = text
  messageEl.className = `alert alert-${type}`
  messageEl.classList.remove('hidden')
}

function hideMessage() {
  messageEl.classList.add('hidden')
}

function setLoading(btn, loading, label) {
  if (!btn) return
  btn.disabled = loading
  if (loading) {
    btn.dataset.prevLabel = btn.textContent
    btn.textContent = label
  } else {
    btn.textContent = btn.dataset.prevLabel || btn.textContent
  }
}

function getSiteId(url) {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    const host = parsed.hostname
    for (const site of CONFIG.SUPPORTED_SITES) {
      if (site.id === 'company') continue
      if (site.hostPattern.test(host)) return site.id
    }
    if (!/^(localhost|127\.0\.0\.1)$/.test(host)) return 'company'
  } catch {
    /* ignore */
  }
  return null
}

async function updateSiteChipHighlight() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const siteId = tab?.url ? getSiteId(tab.url) : null
  siteChips.querySelectorAll('.chip').forEach((chip) => {
    const name = chip.textContent.toLowerCase()
    const match =
      (siteId === 'linkedin' && name === 'linkedin') ||
      (siteId === 'indeed' && name === 'indeed') ||
      (siteId === 'wellfound' && name === 'wellfound') ||
      (siteId === 'company' && name === 'company site')
    chip.classList.toggle('active', match)
  })
}

function showApp(user) {
  loginSection.classList.add('hidden')
  appSection.classList.remove('hidden')
  userLabel.textContent = user.name || user.email
  document.getElementById('open-vault').href = `${CONFIG.APP_BASE_URL}/vault`
  updateSiteChipHighlight()
}

function showLogin() {
  appSection.classList.add('hidden')
  loginSection.classList.remove('hidden')
}

function scrapeCompanySiteFromPage() {
  function textOf(el) {
    return el?.innerText?.trim() || el?.textContent?.trim() || ''
  }

  function firstText(selectors, root = document) {
    for (const sel of selectors) {
      const value = textOf(root.querySelector(sel))
      if (value) return value
    }
    return ''
  }

  function metaContent(selectors) {
    for (const sel of selectors) {
      const value = document.querySelector(sel)?.getAttribute('content')?.trim()
      if (value) return value
    }
    return ''
  }

  function pickLongestText(selectors) {
    let best = ''
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        const value = textOf(el)
        if (value.length > best.length) best = value
      })
    }
    return best
  }

  function cleanTitle(title) {
    return title
      .replace(/\s*\|\s*(careers?|jobs?|greenhouse|lever|workday).*$/i, '')
      .replace(/\s*-\s*(careers?|jobs?).*$/i, '')
      .replace(/\s+at\s+.+$/i, '')
      .trim()
  }

  const role =
    firstText([
      '[data-automation-id="jobPostingHeader"] h1',
      '[data-testid*="job-title" i]',
      '[class*="job-title" i]',
      '[class*="jobTitle" i]',
      'main h1',
      'article h1',
      'h1',
    ]) ||
    cleanTitle(metaContent(['meta[property="og:title"]', 'meta[name="twitter:title"]']) || document.title)

  const company =
    metaContent(['meta[property="og:site_name"]', 'meta[name="application-name"]']) ||
    firstText([
      '[class*="company-name" i]',
      '[class*="companyName" i]',
      '[data-testid*="company" i]',
      'header [href*="/company"]',
    ]) ||
    window.location.hostname.replace(/^www\./, '').split('.')[0]

  const description = pickLongestText([
    '[data-automation-id="jobPostingDescription"]',
    '[data-testid*="job-description" i]',
    '[class*="job-description" i]',
    '[class*="jobDescription" i]',
    '[class*="description" i]',
    '[id*="description" i]',
    'article',
    'main',
  ])

  if (!role && description.length < 80) {
    throw new Error('Could not find a job title or description on this company careers page.')
  }

  return {
    role,
    company,
    platform: 'Company Site',
    status: 'Bookmarked',
    salary: '',
    postLink: window.location.href,
    jobDescription: description,
    resumeUsed: '',
    resumeText: '',
  }
}

async function scrapeCompanySite(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: scrapeCompanySiteFromPage,
  })
  return result?.result
}

const SITE_SCRAPE_FILES = {
  linkedin: ['content/shared.js', 'content/linkedin.js'],
  indeed: ['content/shared.js', 'content/indeed.js'],
  wellfound: ['content/shared.js', 'content/wellfound.js'],
}

async function scrapeViaContentScript(tabId, siteId) {
  let response

  try {
    response = await chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_JOB' })
  } catch {
    response = null
  }

  if (!response?.ok && SITE_SCRAPE_FILES[siteId]) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: SITE_SCRAPE_FILES[siteId],
    })
    response = await chrome.tabs.sendMessage(tabId, { type: 'SCRAPE_JOB' })
  }

  if (response?.ok) return response.data
  throw new Error(
    response?.message ||
      'Could not read this page. Open a single job posting, wait for it to load, then try again.'
  )
}

async function scrapeActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id || !tab.url) {
    throw new Error('No active tab found.')
  }

  const siteId = getSiteId(tab.url)
  if (!siteId) {
    throw new Error(
      'This page cannot be scraped. Open an http/https job page, then click Import from page.'
    )
  }

  if (siteId !== 'company') {
    return scrapeViaContentScript(tab.id, siteId)
  }

  try {
    const data = await scrapeCompanySite(tab.id)
    if (!data) throw new Error('No data returned.')
    return data
  } catch (err) {
    throw new Error(
      err.message ||
        'Could not read this careers page. Open a single job page and try again, or fill the form manually.'
    )
  }
}

function fillForm(data) {
  document.getElementById('role').value = data.role || ''
  document.getElementById('company').value = data.company || ''
  document.getElementById('platform').value = data.platform || 'Other'
  document.getElementById('status').value = data.status || 'Bookmarked'
  document.getElementById('postLink').value = data.postLink || ''
  document.getElementById('jobDescription').value = data.jobDescription || ''
  jdSummary = null
}

function getFormPayload() {
  const role = document.getElementById('role').value.trim()
  const company = document.getElementById('company').value.trim()
  const platform = document.getElementById('platform').value
  const status = document.getElementById('status').value
  const postLink = document.getElementById('postLink').value.trim()
  const jobDescription = document.getElementById('jobDescription').value.trim()

  if (!role || !company) {
    throw new Error('Role and company are required.')
  }

  const dateApplied = new Date(`${todayISO()}T12:00:00`).toISOString()

  return {
    role,
    company,
    platform,
    status,
    salary: '',
    dateApplied,
    postLink,
    jobDescription,
    resumeUsed: '',
    resumeText: '',
    ...(jdSummary ? { aiData: { jdSummary } } : {}),
  }
}

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const btn = document.getElementById('login-btn')
  hideMessage()
  if (!email || !password) {
    showMessage('Email and password are required.', 'error')
    return
  }
  setLoading(btn, true, 'Signing in…')
  try {
    const user = await login(email, password)
    showApp(user)
    showMessage('Signed in. Open a job page and tap Import from page.', 'success')
  } catch (err) {
    showMessage(err.message || 'Login failed.', 'error')
  } finally {
    setLoading(btn, false)
  }
})

document.getElementById('logout-btn').addEventListener('click', async () => {
  await clearStoredUser()
  jdSummary = null
  showLogin()
  hideMessage()
})

document.getElementById('import-btn').addEventListener('click', async () => {
  const btn = document.getElementById('import-btn')
  hideMessage()
  setLoading(btn, true, 'Importing…')
  try {
    const data = await scrapeActiveTab()
    fillForm(data)
    showMessage(`Imported from ${data.platform}. Review and save.`, 'success')
  } catch (err) {
    showMessage(err.message, 'error')
  } finally {
    setLoading(btn, false)
  }
})

document.getElementById('ai-btn').addEventListener('click', async () => {
  const btn = document.getElementById('ai-btn')
  const text = document.getElementById('jobDescription').value.trim()
  hideMessage()
  if (text.length < 50) {
    showMessage('Need at least 50 characters of job description for AI.', 'error')
    return
  }
  setLoading(btn, true, '…')
  try {
    const result = await summarizeJd(text)
    document.getElementById('jobDescription').value = result.formattedDescription
    jdSummary = result.jdSummary
    showMessage('Job description structured with AI.', 'success')
  } catch (err) {
    showMessage(err.message || 'AI summarize failed.', 'error')
  } finally {
    setLoading(btn, false)
    btn.textContent = '✨ AI'
  }
})

document.getElementById('jobDescription').addEventListener('input', () => {
  jdSummary = null
})

jobForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const btn = document.getElementById('save-btn')
  hideMessage()
  setLoading(btn, true, 'Saving…')
  try {
    const payload = getFormPayload()
    const job = await createJob(payload)
    showMessage(`Saved: ${job.role} at ${job.company}`, 'success')
    jobForm.reset()
    jdSummary = null
  } catch (err) {
    showMessage(err.message || 'Save failed.', 'error')
  } finally {
    setLoading(btn, false)
  }
})

async function init() {
  const user = await getStoredUser()
  if (user?.token) {
    showApp(user)
  } else {
    showLogin()
  }
}

init()
