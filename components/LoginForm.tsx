'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export default function LoginForm() {
  const router = useRouter();
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      if (r.ok) { router.push('/admin'); router.refresh(); return; }
      setErr((await r.json().catch(() => ({}))).error || 'Login failed.');
    } catch { setErr('Network error. Please try again.'); }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-gray-200 bg-white p-8">
      <div className="text-center">
        <p className="text-2xl font-bold text-brand-500">AK Creations</p>
        <p className="mt-1 text-sm text-gray-500">Admin login</p>
      </div>
      <input className={input} placeholder="Username" autoComplete="username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
      <input className={input} type="password" placeholder="Password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      {err && <p className="text-sm text-error-600">{err}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
        {busy ? 'Signing in...' : 'Sign in'}
      </button>
      <a href="/" className="block text-center text-sm text-gray-500 hover:text-gray-700">Back to website</a>
    </form>
  );
}
