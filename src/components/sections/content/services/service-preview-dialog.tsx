'use client';

import { createElement, useState } from 'react';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Service, ServiceLocaleContent } from '@/lib/api/content/services';

import { getServiceIcon } from './service-icons';

const LOCALES = [
  { value: 'en', label: 'EN' },
  { value: 'de', label: 'DE' },
] as const;

type Locale = (typeof LOCALES)[number]['value'];

type ServicePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
};

export function ServicePreviewDialog({
  open,
  onOpenChange,
  service,
}: ServicePreviewDialogProps) {
  const [locale, setLocale] = useState<Locale>('en');

  const title =
    service?.content.en?.title ||
    service?.content.de?.title ||
    'Service preview';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">Preview: {title}</DialogTitle>

        {service ? (
          <article>
            <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob-storage media URLs; next/image adds no value here */}
              <img
                src={service.imageUrl}
                alt={service.alt}
                className="size-full object-cover"
              />
              <div className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-md border border-border bg-foreground/90 text-background shadow-sm">
                {createElement(getServiceIcon(service.icon), {
                  className: 'size-4',
                  strokeWidth: 1.75,
                })}
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <div className="flex items-center gap-1 self-start rounded-md border border-border bg-muted/30 p-0.5">
                {LOCALES.map((tab) => {
                  const isTabActive = locale === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      aria-pressed={isTabActive}
                      onClick={() => setLocale(tab.value)}
                      className={cn(
                        'cursor-pointer rounded-sm px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors',
                        isTabActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <ServiceContentBlock
                content={service.content[locale]}
                showFallbackNote={!service.content[locale]}
              />
            </div>
          </article>
        ) : (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              No service selected for preview.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ServiceContentBlock({
  content,
  showFallbackNote,
}: {
  content?: ServiceLocaleContent;
  showFallbackNote: boolean;
}) {
  return (
    <>
      {showFallbackNote && (
        <p className="text-sm text-muted-foreground">
          This locale has no content yet.
        </p>
      )}

      {content && (
        <>
          <div>
            <div className="flex items-center justify-between gap-2">
              {content.tag ? (
                <p className="font-sans text-[11px] font-medium tracking-widest text-primary uppercase">
                  {content.tag}
                </p>
              ) : (
                <span />
              )}
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                #{content.slug || '—'}
              </span>
            </div>

            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {content.title || 'Untitled'}
            </h2>
            {content.subtitle && (
              <p className="mt-1 font-sans text-base font-medium text-foreground/80">
                {content.subtitle}
              </p>
            )}
          </div>

          {content.shortDescription && (
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              {content.shortDescription}
            </p>
          )}

          {content.details && (
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              {content.details}
            </p>
          )}

          {content.body && (
            <p className="font-sans text-sm leading-relaxed text-foreground">
              {content.body}
            </p>
          )}

          {content.features.length > 0 && (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {content.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 font-sans text-sm text-foreground"
                >
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="leading-snug text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {content.whoThisIsFor && (
            <div className="flex gap-4 bg-foreground p-4 text-background md:p-5">
              <div className="w-0.5 shrink-0 self-stretch rounded-full bg-background/40" />
              <p className="font-sans text-sm leading-relaxed">
                <span className="font-medium text-background">For </span>
                <span className="text-background/80">
                  {content.whoThisIsFor}
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}
