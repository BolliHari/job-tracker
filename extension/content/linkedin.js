(function () {
  const { firstText, pickLongestText, buildPayload, respondScrape } =
    globalThis.__jtScrapeHelpers || {}

  function getLinkedInJobId() {
    try {
      const url = new URL(window.location.href)
      const fromQuery = url.searchParams.get('currentJobId')
      if (fromQuery && /^\d+$/.test(fromQuery)) return fromQuery
      const viewMatch = url.pathname.match(/\/jobs\/view\/(\d+)/)
      if (viewMatch) return viewMatch[1]
    } catch {
      /* ignore */
    }
    return null
  }

  function getLinkedInPostLink() {
    const jobId = getLinkedInJobId()
    if (jobId) {
      return `https://www.linkedin.com/jobs/view/${jobId}/`
    }
    return window.location.href
  }

  function isBadLinkedInTitle(text) {
    if (!text || text.length < 2) return true
    if (/\|\s*linkedin\s*$/i.test(text)) return true
    if (/top job picks|jobs recommended|job search|sign in/i.test(text)) return true
    if (/^linkedin$/i.test(text.trim())) return true
    return false
  }

  function isBadLinkedInCompany(text) {
    if (!text) return true
    const t = text.trim().toLowerCase()
    if (t === 'linkedin' || t === 'indeed' || t === 'wellfound') return true
    if (t.length < 2) return true
    return false
  }

  function getLinkedInDetailsRoot() {
    const selectors = [
      '.jobs-search__job-details--container',
      '.jobs-search__job-details',
      '.jobs-details__main-content',
      '.jobs-details',
      '#job-details',
      '[data-job-id]',
      'main section.jobs-box--fade-in',
    ]

    for (const sel of selectors) {
      const el = document.querySelector(sel)
      if (!el) continue
      const hasJobContent = el.querySelector(
        '[class*="job-details"], [class*="jobs-unified-top-card"], [class*="jobs-description"], h1, h2'
      )
      if (hasJobContent) return el
    }

    const jobId = getLinkedInJobId()
    if (jobId) {
      const activeCard = document.querySelector(
        `.jobs-search-results__list-item--active, [data-job-id="${jobId}"], a[href*="/jobs/view/${jobId}"]`
      )
      const cardRoot =
        activeCard?.closest('.jobs-search-results__list-item')?.parentElement?.parentElement
      const details = cardRoot?.parentElement?.querySelector?.('.jobs-search__job-details')
      if (details) return details
    }

    return document.querySelector('.jobs-search__job-details') || document.body
  }

  function pickRole(root) {
    const candidates = [
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      'h1.t-24',
      'h2.t-24',
      '[class*="job-details-jobs-unified-top-card"] h1',
      '[class*="job-details-jobs-unified-top-card"] h2',
      '.jobs-details h1',
      '.jobs-details h2',
    ]

    for (const sel of candidates) {
      const t = firstText([sel], root)
      if (t && !isBadLinkedInTitle(t)) return t
    }

    const ogTitle =
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''
    const cleanedOg = ogTitle
      .replace(/\s*\|\s*linkedin.*$/i, '')
      .replace(/\s*-\s*linkedin.*$/i, '')
      .trim()
    if (cleanedOg && !isBadLinkedInTitle(cleanedOg)) return cleanedOg

    return ''
  }

  function pickCompany(root) {
    const candidates = [
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
      'a[href*="/company/"]',
      '[class*="top-card"] a[href*="/company/"]',
    ]

    for (const sel of candidates) {
      const t = firstText([sel], root)
      if (t && !isBadLinkedInCompany(t)) return t
    }

    return ''
  }

  function pickDescription(root) {
    const description = pickLongestText(
      [
        '.jobs-description-content__text',
        '.jobs-description__content',
        '.jobs-box__html-content',
        '#job-details .jobs-box__html-content',
        'article.jobs-description__container',
        '[class*="jobs-description__content"]',
        '.jobs-description',
      ],
      root
    )

    if (description.length < 80) return description

    const lower = description.toLowerCase()
    const looksLikeProfile =
      (lower.includes('followers') || lower.includes('connections')) &&
      (lower.includes('message') || lower.includes('follow'))

    if (looksLikeProfile) {
      const scoped = pickLongestText(
        ['.jobs-description-content__text', '.jobs-box__html-content'],
        root
      )
      return scoped.length >= 80 ? scoped : description
    }

    return description
  }

  function scrapeLinkedIn() {
    const root = getLinkedInDetailsRoot()
    const role = pickRole(root)
    const company = pickCompany(root)
    const jobDescription = pickDescription(root)
    const postLink = getLinkedInPostLink()

    if (!role && !company && jobDescription.length < 80) {
      const jobId = getLinkedInJobId()
      const hint = jobId
        ? 'Wait for the job panel to finish loading on the right, then try again.'
        : 'Open a single job posting (jobs/view/…), then try again.'
      throw new Error(`Could not read this LinkedIn page. ${hint}`)
    }

    return buildPayload({
      role,
      company,
      jobDescription,
      postLink,
      platform: 'LinkedIn',
    })
  }

  respondScrape(scrapeLinkedIn)
})()
