import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'ak_admin';
export const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Session signing key. Set AUTH_SECRET; if missing, derive one from the admin credentials
// (so changing the password also invalidates existing sessions).
function signingKey() {
  return (
    process.env.AUTH_SECRET ||
    crypto.createHash('sha256').update(`ak|${process.env.ADMIN_USERNAME}|${process.env.ADMIN_PASSWORD}`).digest('hex')
  );
}

function sign(exp: string) {
  return crypto.createHmac('sha256', signingKey()).update(exp).digest('hex');
}

/** Constant-time string comparison (hashes first so lengths never leak). */
export function safeEqual(a: string, b: string) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

export function checkCredentials(username: string, password: string) {
  if (!adminConfigured()) return false;
  const u = safeEqual(username, process.env.ADMIN_USERNAME!);
  const p = safeEqual(password, process.env.ADMIN_PASSWORD!);
  return u && p;
}

export function createSessionToken() {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${exp}.${sign(exp)}`;
}

function validToken(token?: string) {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, sign(exp));
}

export async function isAdmin() {
  return validToken(cookies().get(COOKIE_NAME)?.value);
}
