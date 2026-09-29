'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const label = 'mb-1 block text-sm font-medium text-gray-700';

type Props = { initial: { contactEmail: string; etsyUrl: string; teachingUrl: string }; smtpReady: boolean };

export default function SettingsForm({ initial, smtpReady }: Props) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('Saving...');
    const r = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setF({ contactEmail: d.contactEmail, etsyUrl: d.etsyUrl, teachingUrl: d.teachingUrl }); setMsg('Saved.'); router.refresh(); }
    else setMsg(d.error || 'Could not save.');
    setBusy(false);
  }

  async function test() {
    setBusy(true); setMsg('Sending test email...');
    const r = await fetch('/api/admin/settings', { method: 'POST' });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? `Test email sent to ${f.contactEmail}. Check your inbox (and spam).` : d.error || 'Could not send.');
    setBusy(false);
  }

  return (
    <form id="settings" onSubmit={save} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Contact email &amp; profile links</h2>
        <p className="text-sm text-gray-500">Messages from the website contact form are emailed to this address (and still saved below).</p>
      </div>
      <div>
        <label className={label}>Email that receives messages</label>
        <input className={input} type="email" placeholder="you@yourdomain.com" value={f.contactEmail} onChange={(e) => setF({ ...f, contactEmail: e.target.value })} />
        {!smtpReady && <p className="mt-1 text-xs text-amber-600">Email sending is not set up on the server yet: add SMTP_HOST, SMTP_USER and SMTP_PASS. Messages are still saved here.</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={label}>Etsy profile link</label>
          <input className={input} placeholder="https://www.etsy.com/shop/YourShop" value={f.etsyUrl} onChange={(e) => setF({ ...f, etsyUrl: e.target.value })} />
        </div>
        <div>
          <label className={label}>Teaching app profile link</label>
          <input className={input} placeholder="https://..." value={f.teachingUrl} onChange={(e) => setF({ ...f, teachingUrl: e.target.value })} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">Save</button>
        <button type="button" onClick={test} disabled={busy || !f.contactEmail} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Send test email</button>
        {msg && <span className="text-sm text-gray-500">{msg}</span>}
      </div>
      <p className="text-xs text-gray-400">Tip: save first, then send the test. Leave a link empty to hide its button on the website.</p>
    </form>
  );
}
