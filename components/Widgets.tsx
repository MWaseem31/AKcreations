'use client';
import { useState } from 'react';

const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export default function Widgets() {
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [log, setLog] = useState<{ me: boolean; t: string }[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    setStatus(r.ok ? 'Message sent. We will reply by email.' : 'Please fill in every field.');
    if (r.ok) setF({ name: '', email: '', message: '' });
  }
  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim() || busy) return;
    const next = [...log, { me: true, t: q }];
    setLog(next); setQ(''); setBusy(true);
    try {
      const messages = next.map((m) => ({ role: m.me ? 'user' : 'assistant', content: m.t }));
      const r = await (await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) })).json();
      setLog((l) => [...l, { me: false, t: r.reply }]);
    } catch {
      setLog((l) => [...l, { me: false, t: 'Sorry, something went wrong. Please use the contact form.' }]);
    }
    setBusy(false);
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={send} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-800">Contact us</h2>
        <input className={input} placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={input} type="email" placeholder="Your email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <textarea className={input} rows={4} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
        <button className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Send message</button>
        {status && <p className="text-sm text-gray-500">{status}</p>}
      </form>
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Chat assistant</h2>
        <div className="mb-3 max-h-56 space-y-2 overflow-y-auto">
          {log.length === 0 && <p className="text-sm text-gray-400">Ask about lessons, designs or clay art.</p>}
          {log.map((m, i) => (
            <p key={i} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.me ? 'ml-auto bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'}`}>{m.t}</p>
          ))}
          {busy && <p className="max-w-[85%] rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-400">Typing...</p>}
        </div>
        <form onSubmit={ask} className="flex gap-2">
          <input className={input} placeholder="Type your question" value={q} onChange={(e) => setQ(e.target.value)} />
          <button disabled={busy} className="rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">Ask</button>
        </form>
      </div>
    </div>
  );
}
