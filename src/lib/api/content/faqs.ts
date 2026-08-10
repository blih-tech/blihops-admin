import { apiFetch } from '@/lib/api';

const FAQS_PATH = '/api/v1/content/admin/faqs';

export type FaqLocaleContent = {
  question: string;
  answer: string;
};

export type FaqContent = {
  en?: FaqLocaleContent;
  de?: FaqLocaleContent;
};

export type Faq = {
  id: string;
  isActive: boolean;
  displayOrder: number;
  content: FaqContent;
};

export type FaqsMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type FaqsResponse = {
  items: Faq[];
  meta: FaqsMeta;
};

export type CreateFaqPayload = {
  en: FaqLocaleContent;
  de: FaqLocaleContent;
  displayOrder: number;
};

export type UpdateFaqPayload = Partial<CreateFaqPayload> & {
  isActive?: boolean;
};

export type FaqResponse = {
  data: Faq;
};

export async function listFaqs(): Promise<FaqsResponse> {
  return apiFetch<FaqsResponse>(FAQS_PATH);
}

export async function createFaq(
  payload: CreateFaqPayload,
): Promise<FaqResponse> {
  return apiFetch<FaqResponse>(FAQS_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateFaq(
  id: string,
  payload: UpdateFaqPayload,
): Promise<FaqResponse> {
  return apiFetch<FaqResponse>(`${FAQS_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteFaq(id: string): Promise<void> {
  return apiFetch<void>(`${FAQS_PATH}/${id}`, {
    method: 'DELETE',
    responseType: 'none',
  });
}
