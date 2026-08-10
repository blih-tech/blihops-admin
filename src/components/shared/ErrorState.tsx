import { RotateCwIcon, TriangleAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      className={className}
      icon={<TriangleAlertIcon className="size-6" />}
      iconClassName="bg-destructive/10 text-destructive"
      title={title}
      description={message}
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCwIcon data-icon="inline-start" />
            {retryLabel}
          </Button>
        ) : undefined
      }
    />
  );
}
