'use client';
import { useState } from 'react';

export default function Widgets() {
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [log, setLog] = useState<{ me: boolean; t: string }[]>([]);
  const [q, setQ] = useState('');

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    setStatus(r.ok ? 'Message sent. We will reply by email.' : 'Please fill in every field.');
    if (r.ok) setF({ name: '', email: '', message: '' });
  }
  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!q) return;
    setLog((l) => [...l, { me: true, t: q }]); setQ('');
    const r = await (await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: q }) })).json();
    setLog((l) => [...l, { me: false, t: r.reply }]);
  }
  const box = { display: 'block', width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' as const };
  return (
    <>
      <h2>Contact us</h2>
      <form onSubmit={send}>
        <input style={box} placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input style={box} type="email" placeholder="Your email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <textarea style={box} rows={4} placeholder="How can we help?" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
        <button type="submit">Send message</button> <span>{status}</span>
      </form>
      <h2>Quick questions</h2>
      <div>{log.map((m, i) => <p key={i} style={{ textAlign: m.me ? 'right' : 'left' }}><b>{m.me ? 'You' : 'Noor'}:</b> {m.t}</p>)}</div>
      <form onSubmit={ask}><input style={box} placeholder="Ask about lessons, designs or clay art" value={q} onChange={(e) => setQ(e.target.value)} /></form>
    </>
  );
}
