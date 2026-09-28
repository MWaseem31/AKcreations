'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const input = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export default function AdminForm({ items }: { items: any[] }) {
  const router = useRouter();
  const [f, setF] = useState({ category: 'clay', title: '', description: '', price: '' });
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg('Saving...');
    let imageUrl = '';
    if (file) {
      const fd = new FormData(); fd.append('file', file);
      const u = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!u.ok) return setMsg('Image upload failed.');
      imageUrl = (await u.json()).url;
    }
    const r = await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, imageUrl }) });
    setMsg(r.ok ? 'Published.' : 'Could not save.');
    if (r.ok) { setF({ ...f, title: '', description: '', price: '' }); setFile(null); router.refresh(); }
  }
  async function del(id: number) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/items?id=${id}`, { method: 'DELETE' }); router.refresh();
  }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-800">Add something new</h2>
        <select className={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          <option value="quran">Quran lesson</option><option value="clothing">Clothing design</option><option value="clay">Clay art</option>
        </select>
        <input className={input} placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <textarea className={input} rows={3} placeholder="Description (for lessons: schedule and details)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <input className={input} type="number" placeholder="Price (Rs)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <input className={input} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Publish</button>
        {msg && <span className="ml-3 text-sm text-gray-500">{msg}</span>}
      </form>
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Published items</h2>
        {items.length === 0 && <p className="text-sm text-gray-400">Nothing published yet.</p>}
        <ul className="divide-y divide-gray-100">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3">
              {i.imageUrl ? <img src={i.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-gray-100" />}
              <div className="flex-1"><p className="text-sm font-medium text-gray-800">{i.title}</p><p className="text-xs text-gray-500">{i.category}</p></div>
              <button onClick={() => del(i.id)} className="rounded-lg bg-error-50 px-3 py-1.5 text-xs font-medium text-error-600 hover:bg-error-100">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
