import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'blihops.session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  const { token } = (await req.json().catch(() => ({}))) as { token?: unknown };

  if (typeof token !== 'string' || token.length === 0) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
