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

type PrimaryTestimonialCardProps = {
  testimonial: Testimonial;
  isPending?: boolean;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
};

export function PrimaryTestimonialCard({
  testimonial,
  isPending = false,
  onEdit,
  onDelete,
}: PrimaryTestimonialCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  return (
    <article
      ref={cardRef}
      aria-busy={isPending}
      className={cn(
        'relative flex flex-col border border-foreground bg-foreground text-background transition-opacity',
        isPending && 'opacity-60',
      )}
    >
      <div className="flex items-center justify-between border-b border-background/20 px-5 py-3.5">
        <QuoteMark className="text-background/50" />
        <span className="rounded-full border border-background/25 bg-background/15 px-2.5 py-1 font-sans text-[10px] font-medium tracking-wider text-background uppercase">
          Primary
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center px-5 py-6">
        <div className="flex gap-4">
          <div className="w-0.5 shrink-0 self-stretch rounded-full bg-background/40" />
          <p className="font-sans text-sm leading-relaxed text-background md:text-[15px]">
            {testimonial.quote}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-background/20 px-5 py-4">
        <p className="min-w-0 flex-1 font-sans text-sm text-background/70">
          <span className="font-medium text-background">
            {testimonial.name}
          </span>
          <span className="mx-1.5">·</span>
          {testimonial.role}, {testimonial.company}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 bg-background/10 text-background hover:bg-background/20 hover:text-background"
              />
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
            <DropdownMenuItem
              onClick={() => onEdit(testimonial)}
              className="focus:bg-muted focus:text-foreground"
            >
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
