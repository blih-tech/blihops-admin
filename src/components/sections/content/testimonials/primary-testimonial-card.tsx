import { QuoteMark } from '@/components/sections/content/testimonials/quote-mark';
import type { Testimonial } from '@/lib/api/content/testimonials';

type PrimaryTestimonialCardProps = {
  testimonial: Testimonial;
};

export function PrimaryTestimonialCard({
  testimonial,
}: PrimaryTestimonialCardProps) {
  return (
    <article className="relative flex flex-col border border-foreground bg-foreground text-background">
      <div className="flex items-center justify-between border-b border-background/20 px-5 py-3.5">
        <QuoteMark className="text-background/50" />
        <span className="rounded-full border border-background/25 bg-background/15 px-2.5 py-1 font-sans text-[10px] font-medium tracking-wider text-background uppercase">
          Primary
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center px-5 py-6">
        <div className="flex gap-4">
          <div className="w-0.5 shrink-0 self-stretch rounded-full bg-background/40" />
          <p className="font-sans text-sm leading-relaxed text-background md:text-[15px]">
            {testimonial.quote}
          </p>
        </div>
      </div>

      <div className="border-t border-background/20 px-5 py-4">
        <p className="font-sans text-sm text-background/70">
          <span className="font-medium text-background">
            {testimonial.name}
          </span>
          <span className="mx-1.5">·</span>
          {testimonial.role}, {testimonial.company}
        </p>
      </div>
    </article>
  );
}
