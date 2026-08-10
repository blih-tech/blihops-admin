import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon?: ReactNode;
  iconClassName?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  iconClassName,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground',
            iconClassName,
          )}
        >
          {icon}
        </div>
      )}
      <h2 className="font-heading text-base font-semibold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
