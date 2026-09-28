import { NextResponse } from 'next/server';
import { COOKIE_NAME, SESSION_SECONDS, adminConfigured, checkCredentials, createSessionToken } from '@/lib/auth';

// Simple in-memory brute-force guard: 5 failed attempts per IP per 15 minutes.
const fails = new Map<string, { n: number; until: number }>();
const WINDOW = 15 * 60 * 1000;

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: 'Admin login is not configured on the server.' }, { status: 500 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const rec = fails.get(ip);
  if (rec && rec.until > Date.now() && rec.n >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? '');
  const password = String(body.password ?? '');

  if (!checkCredentials(username, password)) {
    const n = rec && rec.until > Date.now() ? rec.n + 1 : 1;
    fails.set(ip, { n, until: Date.now() + WINDOW });
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return res;
}
