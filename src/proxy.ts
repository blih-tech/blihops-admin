import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'blihops.session_token';
const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const SIGN_IN_PATH = '/auth/sign-in';

const redirectToSignIn = (request: NextRequest) => {
  const url = new URL(SIGN_IN_PATH, request.url);
  return NextResponse.redirect(url);
};

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token === undefined) {
    return redirectToSignIn(request);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/get-session`, {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      return redirectToSignIn(request);
    }

    const session = (await response.json()) as {
      user?: { role?: string };
    } | null;

    if (session?.user === undefined || session.user.role !== 'admin') {
      return redirectToSignIn(request);
    }

    return NextResponse.next();
  } catch {
    return redirectToSignIn(request);
  } finally {
    clearTimeout(timeout);
  }
}

export const config = {
  matcher: ['/'],
};
