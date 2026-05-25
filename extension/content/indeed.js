(function () {
  const { firstText, pickLongestText, buildPayload, respondScrape } =
    globalThis.__jtScrapeHelpers || {}

  function scrapeIndeed() {
    const role = firstText([
      'h1[data-testid="jobsearch-JobInfoHeader-title"]',
      '.jobsearch-JobInfoHeader-title',
      'h1.jobsearch-JobInfoHeader-title',
      'h1',
    ])

    const company = firstText([
      '[data-testid="inlineHeader-companyName"]',
      '[data-testid="jobsearch-CompanyInfoContainer"] a',
      '.jobsearch-CompanyInfoWithoutHeaderImage a',
      '[data-company-name="true"]',
    ])

    const jobDescription = pickLongestText([
      '#jobDescriptionText',
      '[id*="jobDescriptionText"]',
      '.jobsearch-jobDescriptionText',
      '#job-content',
    ])

    if (!role && !company && !jobDescription) {
      throw new Error(
        'Could not read this Indeed page. Open a job detail view (viewjob), then try again.'
      )
    }

    return buildPayload({
      role,
      company,
      jobDescription,
      postLink: window.location.href.split('?')[0],
      platform: 'Indeed',
    })
  }

  respondScrape(scrapeIndeed)
})()
