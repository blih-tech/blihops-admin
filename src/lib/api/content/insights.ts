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
  author: string;
  readTimeMinutes: number;
  category: InsightCategory;
  media: InsightMedia;
  tags: InsightTag[];
  status?: 'DRAFT' | 'PUBLISHED';
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
