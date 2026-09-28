import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import AdminForm from '@/components/AdminForm';
export const dynamic = 'force-dynamic';

export default async function Admin() {
  if (!(await isAdmin())) redirect('/api/auth/signin?callbackUrl=/admin');
  const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } });
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  const count = (c: string) => items.filter((i) => i.category === c).length;
  const stats = [['Quran lessons', count('quran')], ['Clothing designs', count('clothing')], ['Clay pieces', count('clay')], ['Messages', inquiries.length]];
  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-white px-6 py-5 lg:w-60 lg:border-r lg:border-gray-200">
        <p className="text-xl font-bold text-brand-500">Noor Creations</p>
        <nav className="mt-4 flex gap-2 text-sm lg:flex-col">
          <span className="rounded-lg bg-brand-50 px-3 py-2 font-medium text-brand-500">Dashboard</span>
          <a href="/" className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100">View website</a>
          <a href="/api/auth/signout" className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100">Sign out</a>
        </nav>
      </aside>
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <h1 className="text-title-xs font-semibold text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(([label, n]) => (
            <div key={label as string} className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 text-title-sm font-bold text-gray-800">{n}</p>
            </div>
          ))}
        </div>
        <AdminForm items={items} />
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Recent messages</h2>
          {inquiries.length === 0 && <p className="text-sm text-gray-400">No messages yet.</p>}
          <ul className="divide-y divide-gray-100">
            {inquiries.map((q) => (
              <li key={q.id} className="py-3"><p className="text-sm font-medium text-gray-800">{q.name}</p><p className="text-sm text-gray-500">{q.message}</p></li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
