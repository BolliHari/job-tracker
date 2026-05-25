(function () {
  const { firstText, pickLongestText, buildPayload, respondScrape } =
    globalThis.__jtScrapeHelpers || {}

  function scrapeLinkedIn() {
    const role = firstText([
      'h1.job-details-jobs-unified-top-card__job-title',
      'h1.t-24',
      'h1',
      '.jobs-unified-top-card__job-title',
    ])

    const company = firstText([
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
      '.jobs-unified-top-card__company-name a',
    ])

    const jobDescription = pickLongestText([
      '#job-details',
      '.jobs-description__content',
      '.jobs-box__html-content',
      'article.jobs-description__container',
      '[class*="jobs-description"]',
    ])

    if (!role && !company && !jobDescription) {
      throw new Error(
        'Could not read this LinkedIn page. Open a single job posting (jobs/view/…), then try again.'
      )
    }

    return buildPayload({
      role,
      company,
      jobDescription,
      postLink: window.location.href.split('?')[0],
      platform: 'LinkedIn',
    })
  }

  respondScrape(scrapeLinkedIn)
})()
