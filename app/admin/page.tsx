import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import AdminForm from '@/components/AdminForm';
export const dynamic = 'force-dynamic';

export default async function Admin() {
  if (!(await isAdmin())) redirect('/api/auth/signin?callbackUrl=/admin');
  const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } });
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  return (
    <main>
      <h1>Admin</h1>
      <h2>Add something new</h2>
      <AdminForm items={items} />
      <h2>Recent messages</h2>
      {inquiries.length === 0 && <p>No messages yet.</p>}
      {inquiries.map((q) => <p key={q.id}><b>{q.name}</b>: {q.message}</p>)}
    </main>
  );
}
