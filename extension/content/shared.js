function textOf(el) {
  return el?.innerText?.trim() || el?.textContent?.trim() || ''
}

function firstText(selectors, root = document) {
  for (const sel of selectors) {
    const el = root.querySelector(sel)
    const t = textOf(el)
    if (t) return t
  }
  return ''
}

function firstAttr(selectors, attr, root = document) {
  for (const sel of selectors) {
    const el = root.querySelector(sel)
    const v = el?.getAttribute?.(attr)
    if (v) return v.trim()
  }
  return ''
}

function pickLongestText(selectors, root = document) {
  let best = ''
  for (const sel of selectors) {
    root.querySelectorAll(sel).forEach((el) => {
      const t = textOf(el)
      if (t.length > best.length) best = t
    })
  }
  return best
}

function buildPayload({ role, company, jobDescription, postLink, platform }) {
  return {
    role: role || '',
    company: company || '',
    platform: platform || 'Other',
    status: 'Bookmarked',
    salary: '',
    postLink: postLink || window.location.href,
    jobDescription: jobDescription || '',
    resumeUsed: '',
    resumeText: '',
  }
}

function respondScrape(getData) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'SCRAPE_JOB') return
    try {
      const data = getData()
      sendResponse({
        ok: true,
        supported: true,
        data,
      })
    } catch (err) {
      sendResponse({
        ok: false,
        supported: true,
        message: err.message || 'Scrape failed',
      })
    }
    return true
  })
}

// eslint-disable-next-line no-undef
if (typeof globalThis !== 'undefined') {
  globalThis.__jtScrapeHelpers = {
    textOf,
    firstText,
    firstAttr,
    pickLongestText,
    buildPayload,
    respondScrape,
  }
}
