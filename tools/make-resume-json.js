// cv.json (schema.org Person, the source) -> resume.json in the JSON Resume format (https://jsonresume.org/schema),
// the structure AI / ATS resume tools read. Dates ISO 8601 (YYYY-MM); "Present" = no endDate.
//   node tools/make-resume-json.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cv = JSON.parse(fs.readFileSync(path.join(root, 'cv.json'), 'utf8'));

const end = (d) => (d && !/present/i.test(d) ? { endDate: d } : {});
const list = (s) => String(s || '').replace(/\.$/, '').split(/,\s*(?![^()]*\))/).map((x) => x.trim()).filter(Boolean);
const network = (u) => {
  const m = u.match(/(linkedin|github|facebook|t\.me|viber)/i);
  const names = { linkedin: 'LinkedIn', github: 'GitHub', facebook: 'Facebook', 't.me': 'Telegram', viber: 'Viber' };
  const user = u.replace(/\/+$/, '').split(/[/=]/).pop();
  return { network: m ? names[m[1].toLowerCase()] : u, username: user, url: u };
};

const resume = {
  $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
  basics: {
    name: cv.name,
    label: cv.jobTitle,
    image: 'https://codi92.github.io/cv/profile.png',
    email: cv.email,
    phone: cv.telephone,
    url: 'https://codi92.github.io/cv/',
    summary: cv.description,
    location: { city: cv.address.addressLocality, countryCode: 'MD', region: cv.address.addressCountry },
    profiles: (cv.sameAs || []).filter((u) => /^https?:/.test(u)).map(network),
  },
  work: cv.hasOccupation.map((o) => ({
    name: o.hiringOrganization.name,
    position: o.name,
    location: o.location,
    startDate: o.startDate,
    ...end(o.endDate),
    highlights: o.responsibilities,
  })),
  projects: (cv.workExample || []).map((p) => ({
    name: p.name,
    description: p.description,
    ...(p.url ? { url: p.url } : {}),
    roles: [p.role],
    startDate: p.startDate,
    ...end(p.endDate),
    highlights: p.timeline || ['capabilities', 'pdf endpoint', 'quality', 'opportunities']
      .filter((k) => p[k]).map((k) => k[0].toUpperCase() + k.slice(1) + ': ' + p[k]),
    keywords: p.tools || list(p.technologies),
  })),
  education: (cv.alumniOf || []).map((e) => {
    const m = String(e.description).match(/^(.*?)\s*\((\d{4})\)$/) || [];
    return { institution: e.name, area: m[1] || e.description, studyType: 'Vocational', ...(m[2] ? { endDate: m[2] } : {}) };
  }),
  certificates: (cv.hasCredential || []).map((c) => ({ name: c.name, issuer: c.issuer, date: c.date })),
  skills: [
    ...cv.skills.map((s) => {
      const m = s.match(/^(.*?)\s*\((.*)\)\s*$/);
      return m ? { name: m[1], keywords: list(m[2]) } : { name: s };
    }),
    ...(cv.usedApplication || []).map((u) => {
      const i = u.indexOf(':');
      return { name: u.slice(0, i).trim(), level: 'Tools', keywords: list(u.slice(i + 1)) };
    }),
  ],
  languages: (cv.knowsLanguage || []).map((l) => ({ language: l.name, fluency: l.proficiencyLevel })),
  interests: (cv.knowsAbout || []).map((k) => ({ name: k })),
  meta: { canonical: 'https://codi92.github.io/cv/resume.json', version: cv.version, lastModified: cv.lastUpdated },
};

fs.writeFileSync(path.join(root, 'resume.json'), JSON.stringify(resume, null, 2) + '\n');
console.log('wrote resume.json:', resume.work.length, 'jobs,', resume.projects.length, 'projects,', resume.skills.length, 'skills');
