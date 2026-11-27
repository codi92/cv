// Builds the CV PDFs exactly as the browser's "Print / Save as PDF" would: Chromium, the page's own @media print
// rules and @page margins, one PDF per language (the page shows one language at a time, chosen in localStorage).
//   node tools/make-resume-json.js && node tools/make-pdf.js   -> cv.pdf (English), cv.ro.pdf, cv.ru.pdf
// For AI / ATS parsers each PDF is a tagged PDF (headings, lists, reading order) with bookmarks, document
// metadata (title, author, subject, keywords, language) and resume.json (JSON Resume) attached.
// Only local files are loaded: analytics and web fonts are blocked (the print CSS uses Segoe UI / Arial).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { PDFDocument, PDFName } = require('pdf-lib');

const root = path.resolve(__dirname, '..');
const OUT = { en: 'cv.pdf', ro: 'cv.ro.pdf', ru: 'cv.ru.pdf' };
const cv = JSON.parse(fs.readFileSync(path.join(root, 'cv.json'), 'utf8'));
const resumePath = path.join(root, 'resume.json');
const resume = fs.existsSync(resumePath) ? fs.readFileSync(resumePath) : null;
const keywords = [cv.jobTitle, ...(cv.knowsAbout || [])]
  .concat((cv.usedApplication || []).map((u) => u.split(':')[0]))
  .join(', ').split(/,\s*/).filter(Boolean);

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
    const info = await page.evaluate((l) => {
      const c = document.querySelector('.container.lang-' + l);
      const h1 = c && c.querySelector('h1');
      const name = h1 ? Array.from(h1.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim() : '';
      const title = c && c.querySelector('.headline') ? c.querySelector('.headline').textContent.trim() : '';
      return { shown: !!c && getComputedStyle(c).display !== 'none', name, title };
    }, lang);
    if (!info.shown) throw new Error(lang + ': the language container is not visible');
    if (errors.length) throw new Error(lang + ': page errors: ' + errors.join('; '));
    const raw = await page.pdf({ format: 'A4', preferCSSPageSize: true, tagged: true, outline: true });
    await page.close();

    const doc = await PDFDocument.load(raw, { updateMetadata: false });
    doc.setTitle(info.name + ' – ' + info.title, { showInWindowTitleBar: true });
    doc.setAuthor(cv.name);
    doc.setSubject('CV / Resume – ' + info.title);
    doc.setKeywords(keywords);
    doc.setCreator('codi92.github.io/cv (Chromium print CSS)');
    doc.setLanguage({ en: 'en', ro: 'ro', ru: 'ru' }[lang]);
    doc.setCreationDate(new Date());
    doc.setModificationDate(new Date());
    if (resume) {
      await doc.attach(resume, 'resume.json', {
        mimeType: 'application/json',
        description: 'Machine-readable CV (JSON Resume format)',
        creationDate: new Date(),
        modificationDate: new Date(),
      });
    }
    // open with the bookmarks panel visible
    doc.catalog.set(PDFName.of('PageMode'), PDFName.of('UseOutlines'));
    fs.writeFileSync(path.join(root, file), await doc.save());
    console.log('wrote', file, '-', info.name, '/', info.title);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
