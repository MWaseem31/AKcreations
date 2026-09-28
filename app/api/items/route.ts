import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json();
  if (!['quran', 'clothing', 'clay'].includes(b.category) || !b.title) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const item = await prisma.item.create({ data: { category: b.category, title: b.title, description: b.description || '', price: b.price ? Number(b.price) : null, imageUrl: b.imageUrl || null } });
  return NextResponse.json(item);
}
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
