import { cn } from '@/lib/utils';

export function QuoteMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('size-5 text-muted-foreground/50', className)}
    >
      <path d="M7.17 6C4.86 6 3 7.86 3 10.17V17h6.5v-6.83H6.33c0-1.29.55-1.84 1.84-1.84V6zm10 0C14.86 6 13 7.86 13 10.17V17H19.5v-6.83h-3.17c0-1.29.55-1.84 1.84-1.84V6z" />
    </svg>
  );
}
