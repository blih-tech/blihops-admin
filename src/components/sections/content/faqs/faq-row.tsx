'use client';

import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PowerIcon,
  Trash2Icon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Faq } from '@/lib/api/content/faqs';

type FaqRowProps = {
  faq: Faq;
  isPending?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isMoving: boolean;
  onMoveUp: (faq: Faq) => void;
  onMoveDown: (faq: Faq) => void;
  onEdit: (faq: Faq) => void;
  onToggleActive: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
};

export function FaqRow({
  faq,
  isPending = false,
  canMoveUp,
  canMoveDown,
  isMoving,
  onMoveUp,
  onMoveDown,
  onEdit,
  onToggleActive,
  onDelete,
}: FaqRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = faq.isActive;
  const answerId = `faq-answer-${faq.id}`;

  return (
    <div
      aria-busy={isPending}
      className={cn(
        'transition-[opacity,background-color] duration-300 hover:bg-muted/50',
        isPending && 'opacity-60',
        isOpen && 'bg-muted/20',
      )}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex shrink-0 flex-col">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Move question ${faq.displayOrder} up`}
            disabled={!canMoveUp || isMoving}
            onClick={() => onMoveUp(faq)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronUpIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Move question ${faq.displayOrder} down`}
            disabled={!canMoveDown || isMoving}
            onClick={() => onMoveDown(faq)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronDownIcon />
          </Button>
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={answerId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
        >
          <p className="w-8 shrink-0 font-mono text-[10px] font-semibold text-muted-foreground">
            {String(faq.displayOrder).padStart(2, '0')}
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

          <ChevronDownIcon
            aria-hidden
            className={cn(
              'ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              isOpen && 'rotate-180',
            )}
          />
        </button>

        <span
          className={cn(
            'hidden shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase sm:inline',
            isActive
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-border bg-muted text-muted-foreground',
          )}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">FAQ actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={4}
            className="w-44"
          >
            <DropdownMenuItem
              onClick={() => onEdit(faq)}
              className="focus:bg-muted focus:text-foreground"
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleActive(faq)}
              className="focus:bg-muted focus:text-foreground"
            >
              <PowerIcon />
              {isActive ? 'Make inactive' : 'Make active'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(faq)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        id={answerId}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="ml-[104px] flex flex-col gap-3 border-t border-border pb-5 pr-5 pt-4">
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
