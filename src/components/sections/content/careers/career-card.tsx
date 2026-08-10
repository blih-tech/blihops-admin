import { cn } from '@/lib/utils';
import type { CareerListItem } from '@/lib/api/content/careers';

type CareerCardProps = {
  career: CareerListItem;
};

export function CareerCard({ career }: CareerCardProps) {
  const isActive = career.isActive;

  return (
    <article className="group flex min-h-full min-w-0 flex-col border border-border bg-background p-4 transition-colors duration-300 hover:bg-muted/50 sm:p-5">
      <div className="flex flex-1 flex-col pt-1">
        <p className="font-sans text-[11px] font-medium text-muted-foreground">
          {career.department} · {career.location} · {career.employmentType}
        </p>

        <h2 className="mt-2 font-heading text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
          {career.title}
        </h2>

        <p className="mt-3 line-clamp-3 max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
          {career.summary}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase',
              isActive
                ? 'border-primary/20 bg-primary/10 text-primary'
                : 'border-border bg-muted text-muted-foreground',
            )}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </article>
  );
}
