import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ENDPOINT = 'https://gen.pollinations.ai/v1/chat/completions';

// Used only if the AI is unavailable (no key set, rate-limited, network error...)
const RULES: [RegExp, string][] = [
  [/quran|lesson|class|teach/i, 'Quran lessons are audio-only. See the Quran section for schedule and price, or leave a message below to book.'],
  [/cloth|dress|design|stitch|embroider/i, 'We take custom clothing commissions. Send the details through the contact form.'],
  [/clay|art|handmade/i, 'Our clay pieces are handmade. Browse the gallery or request a custom piece via the contact form.'],
  [/price|cost|pay/i, 'Prices are listed on each item. Custom work is quoted after you send a request.'],
  [/ship|deliver/i, 'Physical items are shipped after payment. Delivery time depends on your location.'],
];
const fallback = (text: string) => RULES.find(([r]) => r.test(text))?.[1] ?? 'Thanks! Please use the contact form and we will reply by email.';

// Per-IP limit so nobody can drain the API key: 15 messages per minute.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 15;
}

async function catalog() {
  try {
    const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });
    if (!items.length) return 'No items are published yet.';
    return items.map((i) => `- [${i.category}] ${i.title}${i.price != null ? ` (Rs ${i.price})` : ''}: ${i.description.slice(0, 160)}`).join('\n');
  } catch { return 'Catalog unavailable.'; }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // Accept either { messages: [{role, content}] } or legacy { text }
  let msgs: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(body.messages)
    ? body.messages
        .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
        .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    : [];
  if (!msgs.length && body.text) msgs = [{ role: 'user', content: String(body.text).slice(0, 1000) }];
  msgs = msgs.slice(-10);
  const last = msgs[msgs.length - 1];
  if (!last || last.role !== 'user') return NextResponse.json({ reply: 'Please type a question.' }, { status: 400 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (limited(ip)) return NextResponse.json({ reply: 'You are sending messages too fast. Please wait a moment.' }, { status: 429 });

  const key = process.env.POLLINATIONS_API_KEY;
  if (!key) return NextResponse.json({ reply: fallback(last.content) });

  const system = `You are the friendly assistant on the website of AK Creations, a small business offering:
1. Quran teaching (audio-only lessons),
2. Clothing design (custom designs and patterns),
3. Handmade colorful clay art.
Customers order or book by sending a message through the contact form on the website; custom work is quoted after a request. Prices are in Pakistani Rupees (Rs).
Answer briefly (2-4 sentences), politely, in the same language the customer uses. Only talk about AK Creations; if you do not know something (exact prices, dates, delivery times), say so and point them to the contact form. Never invent prices or policies.

Currently published items:
${await catalog()}`;

  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.POLLINATIONS_MODEL || 'deepseek',
        messages: [{ role: 'system', content: system }, ...msgs],
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!r.ok) throw new Error(`Pollinations ${r.status}`);
    const data = await r.json();
    let reply: string = data?.choices?.[0]?.message?.content || '';
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (!reply) throw new Error('Empty reply');
    return NextResponse.json({ reply });
  } catch (e) {
    console.error('chat error', e);
    return NextResponse.json({ reply: fallback(last.content) });
  }
}
