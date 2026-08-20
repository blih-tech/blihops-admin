import { apiFetch } from '@/lib/api';

export const TALENT_PROFILE_VISIBILITIES = ['HIDDEN', 'VISIBLE'] as const;
export type TalentProfileVisibility =
  (typeof TALENT_PROFILE_VISIBILITIES)[number];

export const TALENT_ACCOUNT_STATUSES = [
  'PENDING_INVITATION',
  'ACTIVE',
  'DEACTIVATED',
] as const;
export type TalentAccountStatus = (typeof TALENT_ACCOUNT_STATUSES)[number];

export type TalentProfileListItem = {
  id: string;
  fullName: string;
  primaryRole: string;
  seniority: string;
  englishLevel: string;
  visibility: TalentProfileVisibility;
  accountStatus: TalentAccountStatus;
  clientMonthlyRateEur: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TalentProfileListMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TalentProfileListResponse = {
  items: TalentProfileListItem[];
  meta: TalentProfileListMeta;
};

export type TalentProfileListParams = {
  visibility?: TalentProfileVisibility;
  accountStatus?: TalentAccountStatus;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type TalentProfileDetail = TalentProfileListItem & {
  workEmail: string;
  phone: string;
  country: string;
  city: string;
  profilePhotoKey: string;
  professionalHeadline: string;
  shortBio: string;
  techStack: string[];
  secondarySkills: string[];
  yearsExperience: number;
  portfolioUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeFileKey: string;
  assessmentSummary: string;
  internalNotes: string;
  applicationId: string;
};

export type TalentProfileDetailResponse = {
  data: TalentProfileDetail;
};

export type UpdateTalentProfilePayload = Partial<{
  seniority: string;
  englishLevel: string;
  clientMonthlyRateEur: string;
  assessmentSummary: string;
  internalNotes: string;
}>;

const BASE_PATH = '/api/v1/admin/talent-profiles';

export function listTalentProfiles(
  params: TalentProfileListParams = {},
): Promise<TalentProfileListResponse> {
  const search = new URLSearchParams();
  if (params.visibility !== undefined)
    search.set('visibility', params.visibility);
  if (params.accountStatus !== undefined)
    search.set('accountStatus', params.accountStatus);
  if (params.q !== undefined && params.q.length > 0) search.set('q', params.q);
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined)
    search.set('pageSize', String(params.pageSize));
  const query = search.toString();
  return apiFetch<TalentProfileListResponse>(
    `${BASE_PATH}${query.length > 0 ? `?${query}` : ''}`,
  );
}

export function getTalentProfile(
  id: string,
): Promise<TalentProfileDetailResponse> {
  return apiFetch<TalentProfileDetailResponse>(`${BASE_PATH}/${id}`);
}

export function updateTalentProfile(
  id: string,
  payload: UpdateTalentProfilePayload,
): Promise<TalentProfileDetailResponse> {
  return apiFetch<TalentProfileDetailResponse>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function showTalentProfile(
  id: string,
): Promise<TalentProfileDetailResponse> {
  return apiFetch<TalentProfileDetailResponse>(`${BASE_PATH}/${id}/show`, {
    method: 'POST',
  });
}

export function hideTalentProfile(
  id: string,
): Promise<TalentProfileDetailResponse> {
  return apiFetch<TalentProfileDetailResponse>(`${BASE_PATH}/${id}/hide`, {
    method: 'POST',
  });
}

export function deactivateTalent(
  id: string,
): Promise<TalentProfileDetailResponse> {
  return apiFetch<TalentProfileDetailResponse>(
    `${BASE_PATH}/${id}/deactivate`,
    { method: 'POST' },
  );
}

export function reactivateTalent(
  id: string,
): Promise<TalentProfileDetailResponse> {
  return apiFetch<TalentProfileDetailResponse>(
    `${BASE_PATH}/${id}/reactivate`,
    { method: 'POST' },
  );
}

export function resendTalentInvitation(
  id: string,
): Promise<{ data: { talentAccountId: string; expiresAt: string } }> {
  return apiFetch<{ data: { talentAccountId: string; expiresAt: string } }>(
    `${BASE_PATH}/${id}/invitation`,
    { method: 'POST' },
  );
}
