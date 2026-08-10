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

export async function listTags(): Promise<TagsResponse> {
  return apiFetch<TagsResponse>(TAGS_PATH);
}
