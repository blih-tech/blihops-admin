import { apiFetch } from '@/lib/api';

const SERVICES_PATH = '/api/v1/content/admin/services';

/**
 * Icon whitelist shared with the API schema and the web icon registry.
 * Keys are the contract — extending the whitelist means updating all three
 * (content model §4.10.1).
 */
export const serviceIcons = [
  'headset',
  'files',
  'code',
  'bot',
  'chart-column',
  'globe',
  'shield-check',
  'database',
  'users',
  'sparkles',
] as const;

export type ServiceIconKey = (typeof serviceIcons)[number];

export type ServiceLocaleContent = {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  details: string;
  tag: string;
  body: string;
  features: string[];
  whoThisIsFor: string;
};

export type ServiceContent = {
  en?: ServiceLocaleContent;
  de?: ServiceLocaleContent;
};

export type Service = {
  id: string;
  icon: string;
  imageUrl: string;
  alt: string;
  displayOrder: number;
  content: ServiceContent;
  createdAt: string;
  updatedAt: string;
};

export type ServicesResponse = {
  items: Service[];
  meta: Record<string, unknown>;
};

export type ServiceResponse = {
  data: Service;
};

export type CreateServicePayload = {
  icon: ServiceIconKey;
  imageUrl: string;
  alt: string;
  displayOrder?: number;
  content: {
    en: ServiceLocaleContent;
    de: ServiceLocaleContent;
  };
};

export async function listServices(): Promise<ServicesResponse> {
  return apiFetch<ServicesResponse>(SERVICES_PATH);
}

export async function createService(
  payload: CreateServicePayload,
): Promise<ServiceResponse> {
  return apiFetch<ServiceResponse>(SERVICES_PATH, {
    method: 'POST',
    body: payload,
  });
}
