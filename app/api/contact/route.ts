import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRecipient } from '@/lib/settings';
import { sendMail, mailConfigured } from '@/lib/mailer';
import { isEmail } from '@/lib/cv';

export const runtime = 'nodejs'; // nodemailer needs Node APIs

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? '').trim().slice(0, 100);
  const email = String(b.email ?? '').trim().slice(0, 200);
  const message = String(b.message ?? '').trim().slice(0, 3000);
  if (!name || !email || !message) return NextResponse.json({ error: 'Fill all fields' }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 });

  // 1) Always keep a copy in the dashboard
  await prisma.inquiry.create({ data: { name, email, message } });

  // 2) Email it to the admin's chosen address (never fails the visitor's request)
  try {
    const to = await getRecipient();
    if (to && mailConfigured()) {
      await sendMail({
        to,
        replyTo: email, // hitting "Reply" answers the visitor
        subject: `New message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });
    }
  } catch (e) {
    console.error('contact email failed', e);
  }
  return NextResponse.json({ ok: true });
}
