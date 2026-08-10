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

export async function listFaqs(): Promise<FaqsResponse> {
  return apiFetch<FaqsResponse>(FAQS_PATH);
}
