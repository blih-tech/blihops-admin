import { apiFetch } from '@/lib/api';

const INSIGHTS_PATH = '/api/v1/content/admin/insights';

export type InsightMedia = {
  type: 'image' | 'video';
  url: string;
  alt?: string;
};

export type InsightCategory = {
  id: string;
  name: string;
} | null;

export type InsightTag = {
  id: string;
  name: string;
};

export type InsightSection = {
  section: string;
  content: string;
};

export type InsightLocaleContent = {
  title: string;
  slug: string;
  excerpt: string;
  body: InsightSection[];
};

export type InsightContent = {
  en?: InsightLocaleContent;
  de?: InsightLocaleContent;
};

export type Insight = {
  id: string;
  author: string;
  readTimeMinutes: number;
  category: InsightCategory;
  media: InsightMedia;
  status: 'DRAFT' | 'PUBLISHED';
  tags: InsightTag[];
  content: InsightContent;
  createdAt: string;
  updatedAt: string;
};

export type InsightListItem = {
  id: string;
  slugs: { en: string; de: string };
  titles: { en: string; de: string };
  excerpts: { en: string; de: string };
  bodyComplete: { en: boolean; de: boolean };
  author: string;
  readTimeMinutes: number;
  category: InsightCategory;
  media: InsightMedia;
  tags: InsightTag[];
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
};

export type InsightsMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type InsightsResponse = {
  items: InsightListItem[];
  meta: InsightsMeta;
};

export type ListInsightsParams = {
  page?: number;
  pageSize?: number;
  status?: 'DRAFT' | 'PUBLISHED';
  categoryId?: string;
};

export type CreateInsightPayload = {
  author: string;
  readTimeMinutes?: number;
  categoryId?: string | null;
  media?: InsightMedia;
  tags?: string[];
  content?: {
    en?: Partial<InsightLocaleContent>;
    de?: Partial<InsightLocaleContent>;
  };
};

export type UpdateInsightPayload =
  | {
      author?: string;
      readTimeMinutes?: number;
      categoryId?: string | null;
      media?: InsightMedia | null;
      tags?: string[];
    }
  | {
      locale: 'en' | 'de';
      content: Partial<InsightLocaleContent>;
    };

export type InsightResponse = {
  data: Insight;
};

export async function getInsight(id: string): Promise<InsightResponse> {
  return apiFetch<InsightResponse>(`${INSIGHTS_PATH}/${id}`);
}

export async function listInsights(
  params: ListInsightsParams = {},
): Promise<InsightsResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.pageSize !== undefined) {
    query.set('pageSize', String(params.pageSize));
  }
  if (params.status !== undefined) query.set('status', params.status);
  if (params.categoryId !== undefined) {
    query.set('categoryId', params.categoryId);
  }
  const queryString = query.toString();
  return apiFetch<InsightsResponse>(
    `${INSIGHTS_PATH}${queryString ? `?${queryString}` : ''}`,
  );
}

export async function createInsight(
  payload: CreateInsightPayload,
): Promise<InsightResponse> {
  return apiFetch<InsightResponse>(INSIGHTS_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateInsight(
  id: string,
  payload: UpdateInsightPayload,
): Promise<InsightResponse> {
  return apiFetch<InsightResponse>(`${INSIGHTS_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function publishInsight(id: string): Promise<InsightResponse> {
  return apiFetch<InsightResponse>(`${INSIGHTS_PATH}/${id}/publish`, {
    method: 'POST',
  });
}

export async function deleteInsight(id: string): Promise<void> {
  return apiFetch<void>(`${INSIGHTS_PATH}/${id}`, {
    method: 'DELETE',
    responseType: 'none',
  });
}
