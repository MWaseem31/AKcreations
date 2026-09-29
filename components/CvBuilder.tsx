'use client';
import { useState } from 'react';
import { lines, type Cv } from '@/lib/cv';

const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const label = 'mb-1 block text-sm font-medium text-gray-700';

/* ------------------------------ PDF generation ------------------------------ */
// Layout follows the reference CV: big "CV" mark + name/contact block on top,
// then green hatched section bars with italic serif text underneath.
async function buildPdf(cv: Cv) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const CW = W - M * 2;
  let y = M;

  const ensure = (need: number) => {
    if (y + need > H - M) { doc.addPage(); y = M; }
  };
  const font = (style: 'normal' | 'italic' | 'bold' | 'bolditalic', size: number) => {
    doc.setFont('times', style); doc.setFontSize(size);
  };
  const wrap = (text: string, width: number) => doc.splitTextToSize(text, width) as string[];
  doc.setTextColor(0, 0, 0);

  /* ---- header ---- */
  doc.setFont('helvetica', 'bold'); doc.setFontSize(72);
  doc.setTextColor(96, 48, 120); doc.text('CV', M + 3, 92 + 3); // shadow
  doc.setTextColor(140, 198, 63); doc.text('CV', M, 92);
  doc.setTextColor(0, 0, 0);

  const hx = M + 140;
  const hw = W - M - hx;
  let hy = 58;
  font('bolditalic', 24);
  for (const l of wrap(cv.fullName || 'Your Name', hw)) { doc.text(l, hx, hy); hy += 27; }
  if (cv.title) { font('italic', 13); for (const l of wrap(cv.title, hw)) { doc.text(l, hx, hy); hy += 16; } }
  hy += 2;
  const contact: [string, string][] = [];
  if (cv.address) contact.push(['', cv.address]);
  if (cv.email) contact.push(['E-mail:', cv.email]);
  if (cv.phone) contact.push(['Cell:', cv.phone]);
  if (cv.website) contact.push(['Web:', cv.website]);
  font('bolditalic', 11);
  for (const [k, v] of contact) {
    if (k) {
      doc.text(k, hx, hy);
      const vx = hx + 50;
      const ls = wrap(v, W - M - vx);
      ls.forEach((l, i) => doc.text(l, vx, hy + i * 14));
      hy += ls.length * 14;
    } else {
      const ls = wrap(v, hw);
      ls.forEach((l, i) => doc.text(l, hx, hy + i * 14));
      hy += ls.length * 14;
    }
  }
  y = Math.max(hy, 108) + 12;

  /* ---- section bar ---- */
  const bar = (title: string) => {
    ensure(50);
    const h = 21;
    doc.setFillColor(184, 222, 104);
    doc.rect(M, y, CW, h, 'F');
    doc.setLineWidth(0.5);
    let k = 0;
    for (let i = -h; i < CW; i += 3, k++) {
      const x0 = M + i, y0 = y + h;
      const t0 = Math.max(0, M - x0), t1 = Math.min(h, M + CW - x0);
      if (t1 <= t0) continue;
      if (k % 2) doc.setDrawColor(112, 190, 150); else doc.setDrawColor(132, 186, 62);
      doc.line(x0 + t0, y0 - t0, x0 + t1, y0 - t1);
    }
    doc.setTextColor(0, 0, 0);
    font('bolditalic', 13);
    doc.text(title.toUpperCase() + ':', M + 6, y + 15);
    y += h + 13;
  };

  const LH = 15;
  const paragraph = (text: string) => {
    font('italic', 12);
    for (const l of wrap(text, CW - 8)) { ensure(LH); doc.text(l, M + 4, y); y += LH; }
    y += 10;
  };

  // Bulleted list. "Title :: details" prints a bold title and the details on the next line.
  const bullets = (items: string[], split: boolean) => {
    const tx = M + 26;
    for (const raw of items) {
      const [head, ...rest] = split ? raw.split('::') : [raw];
      const detail = rest.join('::').trim();
      const h = head.trim();
      font(split && detail ? 'bolditalic' : 'italic', 12);
      const hl = wrap(h, CW - 26);
      ensure(LH * hl.length + (detail ? LH : 0));
      doc.text('\u2022', M + 8, y);
      hl.forEach((l) => { doc.text(l, tx, y); y += LH; });
      if (detail) {
        font('italic', 12);
        for (const l of wrap(detail, CW - 60)) { ensure(LH); doc.text(l, M + 60, y); y += LH; }
      }
    }
    y += 10;
  };

  const personal = (items: string[]) => {
    const pairs = items.map((s) => {
      const i = s.indexOf(':');
      return i > 0 ? { k: s.slice(0, i).trim(), v: s.slice(i + 1).trim() } : { k: '', v: s };
    });
    font('italic', 12);
    const kw = Math.min(160, Math.max(0, ...pairs.map((p) => doc.getTextWidth(p.k))));
    for (const p of pairs) {
      font('italic', 12);
      if (!p.k) { bullets([p.v], false); y -= 10; continue; }
      const vx = M + 26 + kw + 22;
      const vl = wrap(p.v, W - M - vx);
      ensure(LH * vl.length);
      doc.text('\u2022', M + 8, y);
      doc.text(p.k, M + 26, y);
      doc.text(':', M + 26 + kw + 8, y);
      vl.forEach((l, i) => doc.text(l, vx, y + i * LH));
      y += LH * vl.length;
    }
    y += 10;
  };

  /* ---- sections (empty ones are skipped) ---- */
  if (cv.objective.trim()) { bar('Objective'); paragraph(cv.objective.trim()); }
  if (lines(cv.personal).length) { bar('Personal Information'); personal(lines(cv.personal)); }
  if (lines(cv.qualifications).length) { bar('Qualification'); bullets(lines(cv.qualifications), false); }
  if (lines(cv.skills).length) { bar('Skills'); bullets(lines(cv.skills), true); }
  if (lines(cv.experience).length) { bar('Experience'); bullets(lines(cv.experience), true); }
  if (lines(cv.hobbies).length) { bar('Hobbies'); bullets(lines(cv.hobbies), false); }
  if (lines(cv.languages).length) { bar('Languages'); bullets(lines(cv.languages), false); }

  const base = (cv.fullName || 'CV').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'CV';
  doc.save(`${base}-CV.pdf`);
}

/* ---------------------------------- UI ---------------------------------- */
type Props = { initial: Cv; contactEmail: string };

export default function CvBuilder({ initial, contactEmail }: Props) {
  const [f, setF] = useState<Cv>(initial);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Cv) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    setBusy(true); setMsg('Saving...');
    const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cv: f }) });
    setMsg(r.ok ? 'CV saved.' : 'Could not save.');
    setBusy(false);
  }
  async function download() {
    setBusy(true); setMsg('Creating PDF...');
    try { await buildPdf(f); setMsg('PDF downloaded.'); }
    catch (e) { console.error(e); setMsg('Could not create the PDF.'); }
    setBusy(false);
  }

  return (
    <div id="cv" className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">CV</h2>
        <p className="text-sm text-gray-500">Fill in your details, save, and download a ready-made PDF. Empty sections are left out.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div><label className={label}>Full name</label><input className={input} value={f.fullName} onChange={set('fullName')} /></div>
        <div><label className={label}>Job title (optional)</label><input className={input} placeholder="e.g. Quran teacher and designer" value={f.title} onChange={set('title')} /></div>
        <div>
          <div className="flex items-center justify-between">
            <label className={label}>CV email</label>
            {contactEmail && <button type="button" onClick={() => setF({ ...f, email: contactEmail })} className="mb-1 text-xs text-brand-500 hover:underline">Use contact email</button>}
          </div>
          <input className={input} type="email" value={f.email} onChange={set('email')} />
        </div>
        <div><label className={label}>Phone / cell</label><input className={input} value={f.phone} onChange={set('phone')} /></div>
        <div><label className={label}>Address</label><input className={input} value={f.address} onChange={set('address')} /></div>
        <div><label className={label}>Website / other contact</label><input className={input} value={f.website} onChange={set('website')} /></div>
      </div>

      <div><label className={label}>Objective</label><textarea className={input} rows={3} placeholder="A short statement about what you are looking for" value={f.objective} onChange={set('objective')} /></div>

      <div className="grid gap-4 md:grid-cols-2">
        <div><label className={label}>Personal information</label><textarea className={input} rows={6} placeholder={'One per line, like:\nFather\'s Name: ...\nDate of Birth: ...\nNationality: ...\nMarital status: ...'} value={f.personal} onChange={set('personal')} /></div>
        <div><label className={label}>Qualifications</label><textarea className={input} rows={6} placeholder={'One per line, like:\nMatriculation from ...\nIntermediate from ...'} value={f.qualifications} onChange={set('qualifications')} /></div>
        <div><label className={label}>Skills</label><textarea className={input} rows={6} placeholder={'One per line. Use :: to add details on a second line:\n1 Year Diploma in IT :: From ... Institute'} value={f.skills} onChange={set('skills')} /></div>
        <div><label className={label}>Experience</label><textarea className={input} rows={6} placeholder={'One per line, same format:\n4 Years Experience :: as Sales Man at ...'} value={f.experience} onChange={set('experience')} /></div>
        <div><label className={label}>Hobbies</label><textarea className={input} rows={4} placeholder={'One per line'} value={f.hobbies} onChange={set('hobbies')} /></div>
        <div><label className={label}>Languages</label><textarea className={input} rows={4} placeholder={'One per line, like:\nUrdu\nEnglish'} value={f.languages} onChange={set('languages')} /></div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">Save CV</button>
        <button type="button" onClick={download} disabled={busy} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">Download PDF</button>
        {msg && <span className="text-sm text-gray-500">{msg}</span>}
      </div>
      <p className="text-xs text-gray-400">The PDF uses standard fonts, so Latin letters only (Urdu or Arabic script will not display correctly in it).</p>
    </div>
  );
}
