import { NextResponse } from 'next/server';
// Call from cron-job.org: GET /api/cron/etsy?key=CRON_SECRET (also keeps the free app awake)
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get('key') !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // TODO: Etsy sync (OAuth token refresh, fetch listings and receipts) goes here.
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
