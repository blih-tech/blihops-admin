import { apiFetch } from '@/lib/api';

const SERVICES_HERO_PATH = '/api/v1/content/admin/services-hero';

export type ServicesHero = {
  id: string;
  videoUrl: string;
  coverUrl: string;
  altLabel: string;
  lastUpdatedAt: string;
};

export type ServicesHeroResponse = {
  data: ServicesHero | null;
};

export type SaveServicesHeroPayload = {
  videoUrl: string;
  coverUrl: string;
  altLabel: string;
};

export async function getServicesHero(): Promise<ServicesHeroResponse> {
  return apiFetch<ServicesHeroResponse>(SERVICES_HERO_PATH);
}

export async function saveServicesHero(
  payload: SaveServicesHeroPayload,
): Promise<ServicesHeroResponse> {
  return apiFetch<ServicesHeroResponse>(SERVICES_HERO_PATH, {
    method: 'PUT',
    body: payload,
  });
}
