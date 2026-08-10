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

export type CategoryPayload = {
  name: string;
};

export type CategoryResponse = {
  data: Category;
};

export async function listCategories(): Promise<CategoriesResponse> {
  return apiFetch<CategoriesResponse>(CATEGORIES_PATH);
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<CategoryResponse> {
  return apiFetch<CategoryResponse>(CATEGORIES_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateCategory(
  id: string,
  payload: CategoryPayload,
): Promise<CategoryResponse> {
  return apiFetch<CategoryResponse>(`${CATEGORIES_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`${CATEGORIES_PATH}/${id}`, {
    method: 'DELETE',
    responseType: 'none',
  });
}
