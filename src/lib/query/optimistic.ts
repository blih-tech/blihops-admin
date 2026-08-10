import type { QueryClient } from '@tanstack/react-query';

export function takeSnapshot<T>(
  queryClient: QueryClient,
  key: readonly unknown[],
): T | undefined {
  return queryClient.getQueryData<T>(key);
}

export function restoreSnapshot<T>(
  queryClient: QueryClient,
  key: readonly unknown[],
  snapshot: T | undefined,
): void {
  if (snapshot === undefined) {
    queryClient.removeQueries({ queryKey: key });
    return;
  }
  queryClient.setQueryData<T>(key, snapshot);
}
