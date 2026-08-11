'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ClapperboardIcon, VideoOffIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dots } from '@/components/shared/Dots';
import { ErrorState } from '@/components/shared/ErrorState';
import { VideoUpload } from '@/components/sections/content/services-hero/video-upload';
import { CoverUpload } from '@/components/sections/content/services-hero/cover-upload';
import {
  getServicesHero,
  saveServicesHero,
  type ServicesHeroResponse,
} from '@/lib/api/content/services-hero';
import { restoreSnapshot, takeSnapshot } from '@/lib/query/optimistic';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  servicesHeroFormSchema,
  type ServicesHeroFormValues,
} from '@/lib/validators/services-hero';

const SERVICES_HERO_KEY = ['content', 'services-hero'] as const;

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ServicesHeroForm() {
  const queryClient = useQueryClient();
  const { data, error, isPending, refetch } = useQuery({
    queryKey: SERVICES_HERO_KEY,
    queryFn: getServicesHero,
  });

  const hero = data?.data ?? null;

  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ServicesHeroFormValues>({
    resolver: zodResolver(servicesHeroFormSchema),
    values: {
      videoUrl: hero?.videoUrl ?? '',
      coverUrl: hero?.coverUrl ?? '',
      altLabel: hero?.altLabel ?? '',
    },
  });

  const videoUrl = useWatch({ control: form.control, name: 'videoUrl' });
  const coverUrl = useWatch({ control: form.control, name: 'coverUrl' });
  const altLabel = useWatch({ control: form.control, name: 'altLabel' });

  const saveMutation = useMutation({
    mutationFn: saveServicesHero,
    onMutate: async (payload) => {
      const previous = takeSnapshot<ServicesHeroResponse>(
        queryClient,
        SERVICES_HERO_KEY,
      );
      queryClient.setQueryData<ServicesHeroResponse>(SERVICES_HERO_KEY, {
        data: {
          id: hero?.id ?? 'global',
          ...payload,
          lastUpdatedAt: new Date().toISOString(),
        },
      });
      return { previous };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICES_HERO_KEY });
      toastSuccess(hero ? 'Hero media updated' : 'Hero media published');
    },
    onError: (err, _payload, context) => {
      if (context) {
        restoreSnapshot(queryClient, SERVICES_HERO_KEY, context.previous);
      }
      toastError('Failed to save hero media', err.message);
    },
  });

  const isReady = servicesHeroFormSchema.safeParse({
    videoUrl,
    coverUrl,
    altLabel,
  }).success;
  const isDirty = form.formState.isDirty;
  const canSubmit =
    isReady && isDirty && !isUploading && !saveMutation.isPending;

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-56 rounded-md" />
          <Skeleton className="mt-2 h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="aspect-video w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Services Hero
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Video and cover shown at the top of the What We Offer page.
          </p>
        </div>
        <ErrorState
          title="Failed to load hero media"
          message={error?.message}
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Services Hero
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Video and cover shown at the top of the What We Offer page.
        </p>
      </div>

      {!hero && (
        <Alert className="rounded-md">
          <VideoOffIcon />
          <AlertTitle>No hero video is set</AlertTitle>
          <AlertDescription>
            Visitors won&rsquo;t see any hero media on the What We Offer page
            until you publish one. Upload a video and cover image below, then
            hit &ldquo;Publish hero&rdquo; to go live.
          </AlertDescription>
        </Alert>
      )}

      {hero ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-md border border-border bg-card"
        >
          <video
            src={hero.videoUrl}
            poster={hero.coverUrl}
            controls
            preload="metadata"
            className="aspect-video w-full object-cover"
          />
        </motion.div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <ClapperboardIcon className="size-6" />
          </div>
          <p className="font-heading text-base font-semibold text-foreground">
            Set up your hero video
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            A short video with a cover image makes the services page come alive.
            Upload yours below — it goes live when you publish.
          </p>
        </div>
      )}

      <form
        onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        className="flex flex-col gap-5 rounded-md border border-border bg-card p-5"
      >
        <div className="space-y-2">
          <Label htmlFor="hero-video">Hero video</Label>
          <VideoUpload
            value={videoUrl}
            onChange={(url) => {
              form.setValue('videoUrl', url ?? '', { shouldValidate: true });
            }}
            onUploadingChange={setIsUploading}
            disabled={saveMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-cover">Cover image</Label>
          <CoverUpload
            value={coverUrl}
            onChange={(url) => {
              form.setValue('coverUrl', url ?? '', { shouldValidate: true });
            }}
            onUploadingChange={setIsUploading}
            disabled={saveMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-alt">Alt label</Label>
          <Input
            id="hero-alt"
            placeholder="e.g. BlihOps managed outsourcing team at work"
            maxLength={160}
            aria-invalid={Boolean(form.formState.errors.altLabel)}
            {...form.register('altLabel')}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Accessible label describing the hero media.
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {altLabel?.length ?? 0}/160
            </p>
          </div>
          {form.formState.errors.altLabel && (
            <p className="text-xs text-destructive">
              {form.formState.errors.altLabel.message}
            </p>
          )}
        </div>

        {hero && (
          <p className="text-xs text-muted-foreground">
            Last updated {formatUpdatedAt(hero.lastUpdatedAt)}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              form.reset({
                videoUrl: hero?.videoUrl ?? '',
                coverUrl: hero?.coverUrl ?? '',
                altLabel: hero?.altLabel ?? '',
              })
            }
            disabled={saveMutation.isPending || isUploading || !isDirty}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {saveMutation.isPending ? (
              <Dots dots={3} />
            ) : hero ? (
              'Save changes'
            ) : (
              'Publish hero'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
