# Job Tracker — Chrome Extension

Side panel extension to save jobs from **LinkedIn**, **Indeed**, **Wellfound**, and company career pages into your Job Tracker vault.

## Features

- **Side panel (right)** — click the extension icon to open the panel
- **Import from page** — scrapes role, company, description, and link from supported job pages
- **AI summarize** — structures the job description via `POST /api/ai/summarize-jd`
- **Save to vault** — `POST /api/jobs` with your JWT
- **localhost** API by default (change when deployed)

## Prerequisites

1. Backend running: `cd backend && npm run dev` → `http://localhost:5000`
2. Frontend optional (vault link): `cd frontend && npm run dev` → `http://localhost:5173`
3. Job Tracker account (same login as the web app)

## Install (unpacked)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this `extension/` folder
4. Pin **Job Tracker** in the toolbar
5. Click the icon → side panel opens on the **right**

## Supported sites (scraping)

| Site         | Open this page type                                      |
|--------------|-----------------------------------------------------------|
| LinkedIn     | Single job: `linkedin.com/jobs/view/…`                    |
| Indeed       | Job detail: `indeed.com/viewjob` (or similar)             |
| Wellfound    | Single job listing on `wellfound.com/jobs/…`              |
| Company Site | A single job posting on a company careers page            |

Scraping reads public HTML on the page. LinkedIn, Indeed, and Wellfound use site-specific selectors. Other career pages use a generic scraper that looks for `h1`, company metadata, and the longest job-description-like section. If a site changes layout or the page is a job list instead of a single posting, edit fields manually.

## Deploy later

Edit `extension/config.js`:

```js
export const CONFIG = {
  API_BASE_URL: 'https://your-api.com/api',
  APP_BASE_URL: 'https://your-app.com',
}
```

Reload the extension in `chrome://extensions`.

## Config

| File            | Purpose                          |
|-----------------|----------------------------------|
| `config.js`     | API + app URLs                   |
| `manifest.json` | Permissions + content scripts    |
| `sidepanel.js`  | Login, import, AI, save          |
| `content/*.js`  | Per-site scrapers                |
