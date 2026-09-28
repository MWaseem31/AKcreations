import { NextResponse } from 'next/server';
const RULES: [RegExp, string][] = [
  [/quran|lesson|class|teach/i, 'Quran lessons are audio-only. See the Quran section for schedule and price, or leave a message below to book.'],
  [/cloth|dress|design|stitch|embroider/i, 'We take custom clothing commissions. Send the details through the contact form.'],
  [/clay|art|handmade/i, 'Our clay pieces are handmade. Browse the gallery or request a custom piece via the contact form.'],
  [/price|cost|pay/i, 'Prices are listed on each item. Custom work is quoted after you send a request.'],
  [/ship|deliver/i, 'Physical items are shipped after payment. Delivery time depends on your location.'],
];
export async function POST(req: Request) {
  const { text } = await req.json();
  const hit = RULES.find(([r]) => r.test(String(text)));
  return NextResponse.json({ reply: hit ? hit[1] : 'Thanks! Please use the contact form and we will reply by email.' });
}
