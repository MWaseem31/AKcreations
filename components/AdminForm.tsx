'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const box = { display: 'block', width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' as const };
  return (
    <>
      <form onSubmit={save}>
        <select style={box} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          <option value="quran">Quran lesson</option><option value="clothing">Clothing design</option><option value="clay">Clay art</option>
        </select>
        <input style={box} placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <textarea style={box} rows={3} placeholder="Description (for lessons: schedule and details)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <input style={box} type="number" placeholder="Price (Rs)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <input style={box} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit">Publish</button> <span>{msg}</span>
      </form>
      <h2>Published items</h2>
      {items.map((i) => <p key={i.id}>{i.title} ({i.category}) <button onClick={() => del(i.id)}>Delete</button></p>)}
    </>
  );
}
