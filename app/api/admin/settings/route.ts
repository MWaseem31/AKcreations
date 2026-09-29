import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { getSettings, getRecipient } from '@/lib/settings';
import { cleanUrl, isEmail, normalizeCv } from '@/lib/cv';
import { sendMail, mailConfigured } from '@/lib/mailer';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ...(await getSettings()), smtpReady: mailConfigured() });
}

// Partial update: only the fields present in the body are changed.
export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const data: { contactEmail?: string | null; etsyUrl?: string | null; teachingUrl?: string | null; cv?: Prisma.InputJsonValue } = {};

  if ('contactEmail' in b) {
    const e = String(b.contactEmail ?? '').trim();
    if (e && !isEmail(e)) return NextResponse.json({ error: 'That email address does not look valid.' }, { status: 400 });
    data.contactEmail = e || null;
  }
  for (const k of ['etsyUrl', 'teachingUrl'] as const) {
    if (k in b) {
      const u = cleanUrl(b[k]);
      if (u === null) return NextResponse.json({ error: `Invalid link for ${k === 'etsyUrl' ? 'Etsy' : 'teaching app'}.` }, { status: 400 });
      data[k] = u || null;
    }
  }
  if ('cv' in b) data.cv = normalizeCv(b.cv) as unknown as Prisma.InputJsonValue;

  await prisma.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  return NextResponse.json({ ok: true, ...(await getSettings()) });
}

// Sends a test email to the saved address so the admin can confirm SMTP works.
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const to = await getRecipient();
  if (!to) return NextResponse.json({ error: 'Save a contact email first.' }, { status: 400 });
  if (!mailConfigured()) return NextResponse.json({ error: 'SMTP is not set up on the server yet (SMTP_HOST, SMTP_USER, SMTP_PASS).' }, { status: 500 });
  try {
    await sendMail({ to, subject: 'AK Creations test email', text: 'It works! Contact-form messages will arrive at this address.' });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('test email failed', e);
    return NextResponse.json({ error: `Could not send: ${e?.code || e?.message || 'unknown error'}` }, { status: 502 });
  }
}
