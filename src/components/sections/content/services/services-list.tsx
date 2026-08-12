'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LayersIcon, PlusIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  fadeUpItem,
  staggerContainer,
} from '@/components/shared/motion-variants';
import {
  createService,
  listServices,
  type Service,
  type ServiceLocaleContent,
  type ServicesResponse,
} from '@/lib/api/content/services';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';
import type { ServiceFormValues } from '@/lib/validators/services';

import { ServiceCard } from './service-card';
import { ServiceFormDialog } from './service-form-dialog';

const SERVICES_KEY = ['content', 'services', 'admin'] as const;

export function ServicesList() {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const [formOpen, setFormOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, error, isPending, refetch } = useQuery({
    queryKey: SERVICES_KEY,
    queryFn: listServices,
  });

  const items = data?.items ?? [];
  const nextDisplayOrder =
    items.length > 0
      ? Math.max(...items.map((service) => service.displayOrder)) + 1
      : 0;

  const createMutation = useMutation({
    mutationFn: (values: ServiceFormValues) =>
      createService(buildCreatePayload(values)),
    onMutate: async (values) => {
      const previous = takeSnapshot<ServicesResponse>(
        queryClient,
        SERVICES_KEY,
      );
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempService: Service = {
        id: tempId,
        icon: values.icon,
        imageUrl: values.imageUrl,
        alt: values.alt,
        displayOrder: values.displayOrder,
        content: {
          en: toServiceLocaleContent(values.en),
          de: toServiceLocaleContent(values.de),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<ServicesResponse>(SERVICES_KEY, (old) =>
        old
          ? { ...old, items: [...old.items, tempService] }
          : { items: [tempService], meta: {} },
      );
      setPendingId(tempId);
      setFormOpen(false);
      return { previous, tempId };
    },
    onSuccess: (result, _values, context) => {
      queryClient.setQueryData<ServicesResponse>(SERVICES_KEY, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((item) =>
                item.id === context.tempId ? result.data : item,
              ),
            }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
      toastSuccess('Service created');
      setFormOpen(false);
    },
    onError: (err, _values, context) => {
      if (context) {
        restoreSnapshot(queryClient, SERVICES_KEY, context.previous);
      }
      setFormOpen(true);
      toastError('Failed to create service', err.message);
    },
    onSettled: () => {
      setPendingId(null);
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Services
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Service offerings shown on the website. Content is bilingual and
            goes live as soon as it is saved.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Add service
        </Button>
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
          action={
            <Button onClick={() => setFormOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              Add service
            </Button>
          }
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
              <ServiceCard
                service={service}
                isPending={service.id === pendingId}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        nextDisplayOrder={nextDisplayOrder}
        isSaving={createMutation.isPending}
        onSave={(values) => createMutation.mutate(values)}
      />
    </div>
  );
}

function buildCreatePayload(values: ServiceFormValues) {
  return {
    icon: values.icon,
    imageUrl: values.imageUrl,
    alt: values.alt,
    displayOrder: values.displayOrder,
    content: {
      en: toServiceLocaleContent(values.en),
      de: toServiceLocaleContent(values.de),
    },
  };
}

function toServiceLocaleContent(
  locale: ServiceFormValues['en'],
): ServiceLocaleContent {
  return {
    slug: locale.slug,
    title: locale.title,
    subtitle: locale.subtitle,
    shortDescription: locale.shortDescription,
    details: locale.details,
    tag: locale.tag,
    body: locale.body,
    features: locale.features.map((feature) => feature.value),
    whoThisIsFor: locale.whoThisIsFor,
  };
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
