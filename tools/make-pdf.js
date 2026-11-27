// Builds the CV PDFs exactly as the browser's "Print / Save as PDF" would: Chromium, the page's own @media print
// rules and @page margins, one PDF per language (the page shows one language at a time, chosen in localStorage).
//   node tools/make-pdf.js            -> cv.pdf (English), cv.ro.pdf, cv.ru.pdf in the repo root
// Only local files are loaded: analytics and web fonts are blocked (the print CSS uses Segoe UI / Arial).
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const OUT = { en: 'cv.pdf', ro: 'cv.ro.pdf', ru: 'cv.ru.pdf' };

(async () => {
  const browser = await chromium.launch();
  for (const [lang, file] of Object.entries(OUT)) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/*', (r) => (r.request().url().startsWith('file:') ? r.continue() : r.abort()));
    await page.addInitScript((l) => localStorage.setItem('cv_active_lang', l), lang);
    await page.goto('file://' + path.join(root, 'index.html'), { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    const shown = await page.evaluate((l) => {
      const c = document.querySelector('.container.lang-' + l);
      return c && getComputedStyle(c).display !== 'none';
    }, lang);
    if (!shown) throw new Error(lang + ': the language container is not visible');
    if (errors.length) throw new Error(lang + ': page errors: ' + errors.join('; '));
    await page.pdf({ path: path.join(root, file), format: 'A4', preferCSSPageSize: true });
    console.log('wrote', file);
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
