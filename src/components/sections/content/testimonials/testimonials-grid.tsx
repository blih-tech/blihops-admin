'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquareQuoteIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TestimonialCard } from '@/components/sections/content/testimonials/testimonial-card';
import { PrimaryTestimonialCard } from '@/components/sections/content/testimonials/primary-testimonial-card';
import { listTestimonials } from '@/lib/api/content/testimonials';

const TESTIMONIALS_KEY = ['content', 'testimonials'] as const;

export function TestimonialsGrid() {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: TESTIMONIALS_KEY,
    queryFn: listTestimonials,
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Testimonials
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quotes shown on the home page. One testimonial is marked as primary
          and featured on the managed-outsourcing section.
        </p>
      </div>

      {isPending ? (
        <TestimonialsSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load testimonials"
          message={error?.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuoteIcon className="size-6" />}
          title="No testimonials yet"
          description="Add your first testimonial to show client quotes on the home page."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((testimonial) =>
            testimonial.isPrimary ? (
              <div key={testimonial.id} className="md:col-span-2">
                <PrimaryTestimonialCard testimonial={testimonial} />
              </div>
            ) : (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton className="h-48 md:col-span-2 rounded-none" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-48 rounded-none" />
      ))}
    </div>
  );
}
