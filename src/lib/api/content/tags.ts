import { apiFetch } from '@/lib/api';

const TAGS_PATH = '/api/v1/content/admin/tags';

export type Tag = {
  id: string;
  name: string;
};

export type TagsResponse = {
  items: Tag[];
  meta: Record<string, never>;
};

export type TagPayload = {
  name: string;
};

export type TagResponse = {
  data: Tag;
};

export async function listTags(): Promise<TagsResponse> {
  return apiFetch<TagsResponse>(TAGS_PATH);
}

export async function createTag(payload: TagPayload): Promise<TagResponse> {
  return apiFetch<TagResponse>(TAGS_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateTag(
  id: string,
  payload: TagPayload,
): Promise<TagResponse> {
  return apiFetch<TagResponse>(`${TAGS_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteTag(id: string): Promise<void> {
  return apiFetch<void>(`${TAGS_PATH}/${id}`, {
    method: 'DELETE',
    responseType: 'none',
  });
}
