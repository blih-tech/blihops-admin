import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: {
          code: 'UPLOAD_NOT_CONFIGURED',
          message: 'Blob storage is not configured',
        },
      },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error: {
          code: 'UPLOAD_NO_FILE',
          message: 'No file provided',
        },
      },
      { status: 400 },
    );
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: {
          code: 'UPLOAD_INVALID_TYPE',
          message: 'Only JPEG, PNG, WEBP, or SVG images are allowed',
        },
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: {
          code: 'UPLOAD_TOO_LARGE',
          message: 'Image must be 5 MB or smaller',
        },
      },
      { status: 400 },
    );
  }

  const blob = await put(`logos/${file.name}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
