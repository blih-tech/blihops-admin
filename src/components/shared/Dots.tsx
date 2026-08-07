import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Dots({
  className,
  dots = 3,
  ...props
}: ComponentProps<'span'> & { dots?: number }) {
  return (
    <>
      <style>{`
        @keyframes loading-ui-dots-blink {
          0%,
          100% {
            opacity: 0.2;
          }

          20% {
            opacity: 1;
          }
        }
      `}</style>
      <span
        role="status"
        className={cn(
          'inline-flex items-center justify-center gap-[0.25em]',
          className,
        )}
        {...props}
      >
        {Array.from({ length: dots }, (_, index) => (
          <span
            key={index}
            data-slot="dot"
            aria-hidden="true"
            style={{
              animation:
                'loading-ui-dots-blink var(--duration, 1.4s) infinite both',
              animationDelay: `calc(var(--delay, 0.2s) * ${index})`,
            }}
            className="inline-block size-[0.5em] rounded-full bg-current"
          />
        ))}
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

export { Dots };
