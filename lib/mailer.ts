import nodemailer from 'nodemailer';

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transport() {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 / 2525 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Fail fast instead of hanging the request if the port is blocked
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export async function sendMail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!mailConfigured()) throw new Error('SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS).');
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  await transport().sendMail({
    from: `"AK Creations" <${from}>`,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject.replace(/[\r\n]+/g, ' ').slice(0, 200),
    text: opts.text,
  });
}
