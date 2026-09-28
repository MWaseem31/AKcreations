import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { isAdmin } from '@/lib/auth';
// The CLOUDINARY_URL env var configures the SDK automatically

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const file = (await req.formData()).get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const url: string = await new Promise((res, rej) =>
    cloudinary.uploader.upload_stream({ folder: 'noor', resource_type: 'image' }, (e, r) => (e ? rej(e) : res(r!.secure_url))).end(buf));
  return NextResponse.json({ url });
}
