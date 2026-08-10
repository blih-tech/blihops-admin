import { apiFetch } from '@/lib/api';

const TESTIMONIALS_PATH = '/api/v1/content/admin/testimonials';

export type Testimonial = {
  id: string;
  avatarUrl: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  isPrimary: boolean;
};

export type TestimonialsResponse = {
  items: Testimonial[];
  meta: Record<string, never>;
};

export type CreateTestimonialPayload = {
  avatarUrl: string;
  name: string;
  role: string;
  company: string;
  quote: string;
};

export type UpdateTestimonialPayload = Partial<CreateTestimonialPayload> & {
  isPrimary?: true;
};

export type TestimonialResponse = {
  data: Testimonial;
};

export async function listTestimonials(): Promise<TestimonialsResponse> {
  return apiFetch<TestimonialsResponse>(TESTIMONIALS_PATH);
}

export async function createTestimonial(
  payload: CreateTestimonialPayload,
): Promise<TestimonialResponse> {
  return apiFetch<TestimonialResponse>(TESTIMONIALS_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateTestimonial(
  id: string,
  payload: UpdateTestimonialPayload,
): Promise<TestimonialResponse> {
  return apiFetch<TestimonialResponse>(`${TESTIMONIALS_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}
