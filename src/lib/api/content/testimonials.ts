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

export async function listTestimonials(): Promise<TestimonialsResponse> {
  return apiFetch<TestimonialsResponse>(TESTIMONIALS_PATH);
}
