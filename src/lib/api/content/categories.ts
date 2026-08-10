import { apiFetch } from '@/lib/api';

const CATEGORIES_PATH = '/api/v1/content/admin/categories';

export type Category = {
  id: string;
  name: string;
};

export type CategoriesResponse = {
  items: Category[];
  meta: Record<string, never>;
};

export async function listCategories(): Promise<CategoriesResponse> {
  return apiFetch<CategoriesResponse>(CATEGORIES_PATH);
}
