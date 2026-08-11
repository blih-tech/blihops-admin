'use client';

import { useRef } from 'react';
import {
  EllipsisVerticalIcon,
  EyeIcon,
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
import type { CareerListItem } from '@/lib/api/content/careers';

type CareerCardProps = {
  career: CareerListItem;
  isPending?: boolean;
  onPreview: (career: CareerListItem) => void;
  onEdit: (career: CareerListItem) => void;
  onToggleActive: (career: CareerListItem) => void;
  onDelete: (career: CareerListItem) => void;
};

export function CareerCard({
  career,
  isPending = false,
  onPreview,
  onEdit,
  onToggleActive,
  onDelete,
}: CareerCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const isActive = career.isActive;

  return (
    <article
      ref={cardRef}
      aria-busy={isPending}
      role="button"
      tabIndex={0}
      onClick={() => onPreview(career)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPreview(career);
        }
      }}
      className={cn(
        'group relative flex min-h-full min-w-0 cursor-pointer flex-col border border-border bg-background p-4 transition-[opacity,background-color] duration-300 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/30 sm:p-5',
        isPending && 'opacity-60',
      )}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="absolute top-3 right-3 z-10 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-foreground text-background hover:bg-foreground/90 hover:text-background"
              />
            }
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">Career role actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={4}
            className="w-44"
          >
            <DropdownMenuItem
              onClick={() => onPreview(career)}
              className="focus:bg-muted focus:text-foreground"
            >
              <EyeIcon />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(career)}
              className="focus:bg-muted focus:text-foreground"
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleActive(career)}
              className="focus:bg-muted focus:text-foreground"
            >
              <PowerIcon />
              {isActive ? 'Make inactive' : 'Make active'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(career)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
