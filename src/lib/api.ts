export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  credentials?: RequestCredentials;
};

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backoffMs = (attempt: number) => Math.min(200 * 2 ** attempt, 2_000);

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    credentials = 'include',
  } = options;

  const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const url = path.startsWith('http') ? path : `${baseURL}${path}`;

  const perform = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, {
        method,
        headers: {
          ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  let attempt = 0;

  for (;;) {
    let response: Response;
    try {
      response = await perform();
    } catch {
      if (attempt < retries) {
        attempt += 1;
        await sleep(backoffMs(attempt));
        continue;
      }
      throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed');
    }

    if (response.ok) {
      return (await response.json()) as T;
    }

    const payload = await response.json().catch(() => null);

    if (
      response.status < 500 &&
      response.status !== 408 &&
      response.status !== 429
    ) {
      throw new ApiError(
        response.status,
        payload?.error?.code ?? 'REQUEST_FAILED',
        payload?.error?.message ?? `Request failed (${response.status})`,
      );
    }

    if (attempt < retries) {
      attempt += 1;
      await sleep(backoffMs(attempt));
      continue;
    }

    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'SERVER_ERROR',
      payload?.error?.message ?? `Request failed (${response.status})`,
    );
  }
}
