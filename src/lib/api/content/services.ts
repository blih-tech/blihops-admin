import { apiFetch } from '@/lib/api';

const SERVICES_PATH = '/api/v1/content/admin/services';

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

export async function listServices(): Promise<ServicesResponse> {
  return apiFetch<ServicesResponse>(SERVICES_PATH);
}
