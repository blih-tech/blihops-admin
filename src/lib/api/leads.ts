import { apiFetch } from '@/lib/api';

export type LeadType = 'CONTACT' | 'PILOT' | 'CALL';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';

export type LeadListItem = {
  id: string;
  type: LeadType;
  status: LeadStatus;
  fullName: string;
  workEmail: string;
  company: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type LeadListResponse = {
  items: LeadListItem[];
  meta: LeadListMeta;
};

export type LeadListParams = {
  type?: LeadType;
  status?: LeadStatus;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type LeadDetail = LeadListItem & {
  calBookingUid: string | null;
  details: Record<string, unknown>;
};

export type LeadDetailResponse = {
  data: LeadDetail;
};

export function listLeads(
  params: LeadListParams = {},
): Promise<LeadListResponse> {
  const search = new URLSearchParams();
  if (params.type !== undefined) search.set('type', params.type);
  if (params.status !== undefined) search.set('status', params.status);
  if (params.q !== undefined && params.q.length > 0) search.set('q', params.q);
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined) {
    search.set('pageSize', String(params.pageSize));
  }
  const query = search.toString();
  return apiFetch<LeadListResponse>(
    `/api/v1/leads/admin${query.length > 0 ? `?${query}` : ''}`,
  );
}

export function getLead(id: string): Promise<LeadDetailResponse> {
  return apiFetch<LeadDetailResponse>(`/api/v1/leads/admin/${id}`);
}

export function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<LeadDetailResponse> {
  return apiFetch<LeadDetailResponse>(`/api/v1/leads/admin/${id}`, {
    method: 'PATCH',
    body: { status },
  });
}

export function deleteLead(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/leads/admin/${id}`, {
    method: 'DELETE',
    responseType: 'none',
  });
}
