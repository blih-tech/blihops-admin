'use client';

import { useQuery } from '@tanstack/react-query';
import { LayersIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  fadeUpItem,
  staggerContainer,
} from '@/components/shared/motion-variants';
import { listServices } from '@/lib/api/content/services';

import { ServiceCard } from './service-card';

const SERVICES_KEY = ['content', 'services', 'admin'] as const;

export function ServicesList() {
  const reduceMotion = useReducedMotion();
  const { data, error, isPending, refetch } = useQuery({
    queryKey: SERVICES_KEY,
    queryFn: listServices,
  });

  const items = data?.items ?? [];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Services
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Service offerings shown on the website. Content is bilingual and goes
          live as soon as it is saved.
        </p>
      </div>

      {isPending ? (
        <ServicesSkeleton />
      ) : error ? (
        <ErrorState
          title="Failed to load services"
          message={error?.message}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<LayersIcon className="size-6" />}
          title="No services yet"
          description="Add your first service to showcase your offerings on the website."
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2"
          variants={staggerContainer}
          initial={reduceMotion ? 'show' : 'hidden'}
          animate="show"
        >
          {items.map((service) => (
            <motion.div
              key={service.id}
              variants={fadeUpItem}
              className="h-full"
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function ServicesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border border-border bg-background p-4 sm:p-5"
        >
          <Skeleton className="aspect-video w-full rounded-md" />
          <Skeleton className="mt-4 h-3 w-1/3 rounded-md" />
          <Skeleton className="mt-3 h-6 w-2/3 rounded-md" />
          <Skeleton className="mt-3 h-4 w-full rounded-md" />
          <Skeleton className="mt-6 h-5 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}
