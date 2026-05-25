(function () {
  const { firstText, pickLongestText, buildPayload, respondScrape } =
    globalThis.__jtScrapeHelpers || {}

  function scrapeWellfound() {
    const role = firstText([
      'h1',
      '[data-test="JobTitle"]',
      '.job-title',
      'header h2',
    ])

    const company = firstText([
      '[data-test="StartupLink"]',
      'a[href*="/company/"]',
      '.company-name a',
      '.styles_companyName__',
      'header a[href*="company"]',
    ])

    const jobDescription = pickLongestText([
      '[data-test="JobDescription"]',
      '.job-description',
      '[class*="JobDescription"]',
      'section[class*="description"]',
      'main',
    ])

    if (!role && !company && jobDescription.length < 80) {
      throw new Error(
        'Could not read this Wellfound page. Open a single job listing page, then try again.'
      )
    }

    return buildPayload({
      role,
      company,
      jobDescription,
      postLink: window.location.href.split('?')[0],
      platform: 'Wellfound',
    })
  }

  respondScrape(scrapeWellfound)
})()
