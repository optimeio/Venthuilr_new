import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const mimeType = file.type || '';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are permitted' }, { status: 400 });
    }

    // Determine extension
    let ext = '.jpg';
    if (mimeType === 'image/png') ext = '.png';
    else if (mimeType === 'image/webp') ext = '.webp';
    else if (mimeType === 'image/gif') ext = '.gif';
    else if (mimeType === 'image/avif') ext = '.avif';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `prod-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: relativeUrl, success: true }, { status: 201 });
  } catch (err) {
    console.error('Image Upload Error:', err);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
