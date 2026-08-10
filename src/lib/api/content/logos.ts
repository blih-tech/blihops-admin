import { apiFetch } from '@/lib/api';

const LOGOS_PATH = '/api/v1/content/admin/logos';

export type Logo = {
  id: string;
  imageUrl: string;
  alt: string;
};

export type LogosResponse = {
  items: Logo[];
  meta: Record<string, never>;
};

export type LogoResponse = {
  data: Logo;
};

export type CreateLogoPayload = {
  imageUrl: string;
  alt: string;
};

export type UpdateLogoPayload = Partial<CreateLogoPayload>;

export async function listLogos(): Promise<LogosResponse> {
  return apiFetch<LogosResponse>(LOGOS_PATH);
}

export async function createLogo(
  payload: CreateLogoPayload,
): Promise<LogoResponse> {
  return apiFetch<LogoResponse>(LOGOS_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateLogo(
  id: string,
  payload: UpdateLogoPayload,
): Promise<LogoResponse> {
  return apiFetch<LogoResponse>(`${LOGOS_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteLogo(id: string): Promise<void> {
  return apiFetch<void>(`${LOGOS_PATH}/${id}`, {
    method: 'DELETE',
    responseType: 'none',
  });
}
