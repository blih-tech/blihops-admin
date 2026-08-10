'use client';

import { useRef } from 'react';
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QuoteMark } from '@/components/sections/content/testimonials/quote-mark';
import type { Testimonial } from '@/lib/api/content/testimonials';

type TestimonialCardProps = {
  testimonial: Testimonial;
  isPending?: boolean;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
};

export function TestimonialCard({
  testimonial,
  isPending = false,
  onEdit,
  onDelete,
}: TestimonialCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  return (
    <article
      ref={cardRef}
      aria-busy={isPending}
      className={cn(
        'flex flex-col border border-border bg-background transition-opacity',
        isPending && 'opacity-60',
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <QuoteMark />
        <span className="font-sans text-xs text-muted-foreground">
          {testimonial.company}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center px-5 py-6">
        <p className="font-sans text-sm leading-relaxed text-foreground md:text-[15px]">
          {testimonial.quote}
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob-storage avatar URLs; next/image adds no value at this size */}
        <img
          src={testimonial.avatarUrl}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-semibold text-foreground">
            {testimonial.name}
          </p>
          <p className="truncate font-sans text-xs text-muted-foreground">
            {testimonial.role}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="shrink-0" />
            }
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">Testimonial actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            anchor={cardRef}
            side="bottom"
            align="end"
            sideOffset={4}
            className="w-40"
          >
            <DropdownMenuItem onClick={() => onEdit(testimonial)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(testimonial)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
