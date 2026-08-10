import { apiFetch } from '@/lib/api';

const CASE_STUDIES_PATH = '/api/v1/content/admin/case-studies';

export type CaseStudyMedia = {
  type: 'image' | 'video';
  url: string;
  alt?: string;
};

export type CaseStudyCategory = {
  id: string;
  name: string;
} | null;

export type CaseStudyTag = {
  id: string;
  name: string;
};

export type CaseStudyLocaleContent = {
  title: string;
  slug: string;
  summary: string;
  body: {
    challenge: string;
    approach: string;
    outcome: string;
  };
};

export type CaseStudyContent = {
  en?: CaseStudyLocaleContent;
  de?: CaseStudyLocaleContent;
};

export type CaseStudy = {
  id: string;
  client: string;
  category: CaseStudyCategory;
  media: CaseStudyMedia;
  status: 'DRAFT' | 'PUBLISHED';
  tags: CaseStudyTag[];
  content: CaseStudyContent;
  createdAt: string;
  updatedAt: string;
};

export type CaseStudyListItem = {
  id: string;
  slugs: { en: string; de: string };
  titles: { en: string; de: string };
  summaries: { en: string; de: string };
  client: string;
  category: CaseStudyCategory;
  media: CaseStudyMedia;
  tags: CaseStudyTag[];
  status?: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
};

export type CaseStudiesMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CaseStudiesResponse = {
  items: CaseStudyListItem[];
  meta: CaseStudiesMeta;
};

export type ListCaseStudiesParams = {
  page?: number;
  pageSize?: number;
  status?: 'DRAFT' | 'PUBLISHED';
  categoryId?: string;
};

export type CreateCaseStudyPayload = {
  client: string;
  categoryId?: string | null;
  media?: CaseStudyMedia;
  tags?: string[];
  content?: {
    en?: Partial<CaseStudyLocaleContent>;
    de?: Partial<CaseStudyLocaleContent>;
  };
};

export type UpdateCaseStudyPayload =
  | {
      client?: string;
      categoryId?: string | null;
      media?: CaseStudyMedia;
      tags?: string[];
    }
  | {
      locale: 'en' | 'de';
      content: Partial<CaseStudyLocaleContent>;
    };

export type CaseStudyResponse = {
  data: CaseStudy;
};

export async function getCaseStudy(id: string): Promise<CaseStudyResponse> {
  return apiFetch<CaseStudyResponse>(`${CASE_STUDIES_PATH}/${id}`);
}

export async function listCaseStudies(
  params: ListCaseStudiesParams = {},
): Promise<CaseStudiesResponse> {
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
  return apiFetch<CaseStudiesResponse>(
    `${CASE_STUDIES_PATH}${queryString ? `?${queryString}` : ''}`,
  );
}

export async function createCaseStudy(
  payload: CreateCaseStudyPayload,
): Promise<CaseStudyResponse> {
  return apiFetch<CaseStudyResponse>(CASE_STUDIES_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateCaseStudy(
  id: string,
  payload: UpdateCaseStudyPayload,
): Promise<CaseStudyResponse> {
  return apiFetch<CaseStudyResponse>(`${CASE_STUDIES_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function publishCaseStudy(id: string): Promise<CaseStudyResponse> {
  return apiFetch<CaseStudyResponse>(`${CASE_STUDIES_PATH}/${id}/publish`, {
    method: 'POST',
  });
}
