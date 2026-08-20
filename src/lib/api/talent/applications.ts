import { apiFetch } from '@/lib/api';

export const TALENT_APPLICATION_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'SCREENING',
  'TECHNICAL_ASSESSMENT',
  'ENGLISH_ASSESSMENT',
  'REMOTE_READINESS_ASSESSMENT',
  'APPROVED',
  'COMPLETION_REQUESTED',
  'COMPLETION_SUBMITTED',
  'PROFILE_CREATED',
  'REJECTED',
  'ARCHIVED',
] as const;

export type TalentApplicationStatus =
  (typeof TALENT_APPLICATION_STATUSES)[number];

export type TalentApplicationListItem = {
  id: string;
  status: TalentApplicationStatus;
  fullName: string;
  workEmail: string;
  phone: string;
  country: string;
  city: string;
  primaryRole: string;
  yearsExperience: number;
  createdAt: string;
  updatedAt: string;
};

export type TalentApplicationListMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TalentApplicationListResponse = {
  items: TalentApplicationListItem[];
  meta: TalentApplicationListMeta;
};

export type TalentApplicationListParams = {
  status?: TalentApplicationStatus;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type TalentApplicationDetail = TalentApplicationListItem & {
  techStack: string[];
  secondarySkills: string[];
  portfolioUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeFileKey: string;
  completionPhotoKey: string | null;
  completionShortBio: string | null;
  completionProfessionalHeadline: string | null;
  completionSubmittedAt: string | null;
  internalNotes: string;
  talentProfileId: string | null;
};

export type TalentApplicationDetailResponse = {
  data: TalentApplicationDetail;
};

export type TalentApplicationCreatedResponse = {
  data: {
    id: string;
    status: TalentApplicationStatus;
  };
};

export type CreateTalentProfileFromApplicationPayload = {
  seniority: string;
  englishLevel: string;
  clientMonthlyRateEur: string;
  assessmentSummary: string;
  internalNotes: string;
};

const BASE_PATH = '/api/v1/admin/talent-applications';

export function listTalentApplications(
  params: TalentApplicationListParams = {},
): Promise<TalentApplicationListResponse> {
  const search = new URLSearchParams();
  if (params.status !== undefined) search.set('status', params.status);
  if (params.q !== undefined && params.q.length > 0) search.set('q', params.q);
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined) {
    search.set('pageSize', String(params.pageSize));
  }
  const query = search.toString();
  return apiFetch<TalentApplicationListResponse>(
    `${BASE_PATH}${query.length > 0 ? `?${query}` : ''}`,
  );
}

export function getTalentApplication(
  id: string,
): Promise<TalentApplicationDetailResponse> {
  return apiFetch<TalentApplicationDetailResponse>(`${BASE_PATH}/${id}`);
}

export function updateTalentApplicationStatus(
  id: string,
  status: TalentApplicationStatus,
): Promise<TalentApplicationDetailResponse> {
  return apiFetch<TalentApplicationDetailResponse>(
    `${BASE_PATH}/${id}/status`,
    {
      method: 'PATCH',
      body: { status },
    },
  );
}

export function updateTalentApplicationNotes(
  id: string,
  internalNotes: string,
): Promise<TalentApplicationDetailResponse> {
  return apiFetch<TalentApplicationDetailResponse>(`${BASE_PATH}/${id}/notes`, {
    method: 'PATCH',
    body: { internalNotes },
  });
}

export function sendTalentCompletionRequest(
  id: string,
): Promise<{ data: { applicationId: string; expiresAt: string } }> {
  return apiFetch<{ data: { applicationId: string; expiresAt: string } }>(
    `${BASE_PATH}/${id}/completion-request`,
    { method: 'POST' },
  );
}

export function createTalentProfileFromApplication(
  id: string,
  payload: CreateTalentProfileFromApplicationPayload,
): Promise<{ data: { id: string } }> {
  return apiFetch<{ data: { id: string } }>(
    `${BASE_PATH}/${id}/create-profile`,
    {
      method: 'POST',
      body: payload,
    },
  );
}
