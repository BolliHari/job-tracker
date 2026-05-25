// Change API_BASE_URL when you deploy (e.g. https://api.yourdomain.com/api)
export const CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',
  APP_BASE_URL: 'http://localhost:5173',
  SUPPORTED_SITES: [
    { id: 'linkedin', name: 'LinkedIn', hostPattern: /linkedin\.com/i },
    { id: 'indeed', name: 'Indeed', hostPattern: /indeed\.com/i },
    { id: 'wellfound', name: 'Wellfound', hostPattern: /wellfound\.com/i },
    { id: 'company', name: 'Company Site', hostPattern: /./ },
  ],
}
