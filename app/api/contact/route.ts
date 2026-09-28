import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) return NextResponse.json({ error: 'Fill all fields' }, { status: 400 });
  await prisma.inquiry.create({ data: { name: String(name).slice(0, 100), email: String(email).slice(0, 200), message: String(message).slice(0, 3000) } });
  if (process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'onboarding@resend.dev', to: process.env.DEVELOPER_EMAIL, subject: `New inquiry from ${name}`, text: `${email}\n\n${message}` }),
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
