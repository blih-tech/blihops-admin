import { cn } from '@/lib/utils';
import type { Faq } from '@/lib/api/content/faqs';

type FaqRowProps = {
  faq: Faq;
  index: number;
};

export function FaqRow({ faq, index }: FaqRowProps) {
  const isActive = faq.isActive;

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <p className="w-8 shrink-0 font-mono text-[10px] font-semibold text-muted-foreground">
        {String(index + 1).padStart(2, '0')}
      </p>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="w-6 shrink-0 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            EN
          </span>
          {faq.content.en ? (
            <p className="min-w-0 truncate text-sm font-medium text-foreground">
              {faq.content.en.question}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              English content missing
            </p>
          )}
        </div>
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="w-6 shrink-0 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            DE
          </span>
          {faq.content.de ? (
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {faq.content.de.question}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              German content missing
            </p>
          )}
        </div>
      </div>

      <span
        className={cn(
          'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase',
          isActive
            ? 'border-primary/20 bg-primary/10 text-primary'
            : 'border-border bg-muted text-muted-foreground',
        )}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}
