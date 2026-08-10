import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

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

  const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
  const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json(
      {
        error: {
          code: 'UPLOAD_INVALID_TYPE',
          message:
            'Only JPEG, PNG, WEBP, SVG images or MP4, WEBM videos are allowed',
        },
      },
      { status: 400 },
    );
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error: {
          code: 'UPLOAD_TOO_LARGE',
          message: `File must be ${isVideo ? 50 : 5} MB or smaller`,
        },
      },
      { status: 400 },
    );
  }

  const blob = await put(`uploads/${file.name}`, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
