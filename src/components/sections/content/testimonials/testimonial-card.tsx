import { QuoteMark } from '@/components/sections/content/testimonials/quote-mark';
import type { Testimonial } from '@/lib/api/content/testimonials';

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article className="flex flex-col border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <QuoteMark />
      </div>

      <div className="flex flex-1 flex-col justify-center px-5 py-6">
        <p className="font-sans text-sm leading-relaxed text-foreground md:text-[15px]">
          {testimonial.quote}
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob-storage avatar URLs; next/image adds no value at this size */}
        <img
          src={testimonial.avatarUrl}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-foreground">
            {testimonial.name}
          </p>
          <p className="truncate font-sans text-xs text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </article>
  );
}
