'use client';

import { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Faq } from '@/lib/api/content/faqs';

type FaqRowProps = {
  faq: Faq;
  index: number;
  isPending?: boolean;
};

export function FaqRow({ faq, index, isPending = false }: FaqRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = faq.isActive;
  const answerId = `faq-answer-${faq.id}`;

  return (
    <div
      aria-busy={isPending}
      className={cn('transition-opacity', isPending && 'opacity-60')}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors duration-300',
          'focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none',
          'hover:bg-muted/40',
          isOpen && 'bg-muted/20',
        )}
      >
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

        <ChevronDownIcon
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        id={answerId}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="ml-[68px] flex flex-col gap-3 border-t border-border pb-5 pr-5 pt-4">
            {faq.content.en && (
              <div className="flex items-baseline gap-2">
                <span className="w-6 shrink-0 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  EN
                </span>
                <p className="min-w-0 text-sm leading-relaxed text-foreground">
                  {faq.content.en.answer}
                </p>
              </div>
            )}
            {faq.content.de && (
              <div className="flex items-baseline gap-2">
                <span className="w-6 shrink-0 font-mono text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  DE
                </span>
                <p className="min-w-0 text-sm leading-relaxed text-muted-foreground">
                  {faq.content.de.answer}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
