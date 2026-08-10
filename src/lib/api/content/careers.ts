import { apiFetch } from '@/lib/api';

const CAREERS_PATH = '/api/v1/content/admin/careers';

export type Career = {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  summary: string;
  overview: string[];
  responsibilities: string[];
  requirements: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CareerListItem = {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  summary: string;
  isActive: boolean;
  createdAt: string;
};

export type CareersMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CareersResponse = {
  items: CareerListItem[];
  meta: CareersMeta;
};

export type ListCareersParams = {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
};

export type CreateCareerPayload = {
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  summary: string;
  overview: string[];
  responsibilities: string[];
  requirements: string[];
};

export type UpdateCareerPayload = Partial<CreateCareerPayload> & {
  isActive?: boolean;
};

export type CareerResponse = {
  data: Career;
};

export async function getCareer(id: string): Promise<CareerResponse> {
  return apiFetch<CareerResponse>(`${CAREERS_PATH}/${id}`);
}

export async function listCareers(
  params: ListCareersParams = {},
): Promise<CareersResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.pageSize !== undefined) {
    query.set('pageSize', String(params.pageSize));
  }
  if (params.isActive !== undefined) {
    query.set('isActive', String(params.isActive));
  }
  const queryString = query.toString();
  return apiFetch<CareersResponse>(
    `${CAREERS_PATH}${queryString ? `?${queryString}` : ''}`,
  );
}

export async function createCareer(
  payload: CreateCareerPayload,
): Promise<CareerResponse> {
  return apiFetch<CareerResponse>(CAREERS_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateCareer(
  id: string,
  payload: UpdateCareerPayload,
): Promise<CareerResponse> {
  return apiFetch<CareerResponse>(`${CAREERS_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteCareer(id: string): Promise<void> {
  return apiFetch<void>(`${CAREERS_PATH}/${id}`, {
    method: 'DELETE',
    responseType: 'none',
  });
}
