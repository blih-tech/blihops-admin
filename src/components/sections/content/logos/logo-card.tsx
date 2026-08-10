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
import type { Logo } from '@/lib/api/content/logos';

type LogoCardProps = {
  logo: Logo;
  isPending?: boolean;
  onEdit: (logo: Logo) => void;
  onDelete: (logo: Logo) => void;
};

export function LogoCard({
  logo,
  isPending = false,
  onEdit,
  onDelete,
}: LogoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      aria-busy={isPending}
      className={cn(
        'group flex flex-col rounded-md border bg-card p-3 transition-[opacity,box-shadow] hover:shadow-sm',
        isPending && 'opacity-60',
      )}
    >
      <div className="flex aspect-[3/1] items-center justify-center overflow-hidden rounded-md bg-muted/50">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob-storage logo URLs; next/image adds no value at this size */}
        <img
          src={logo.imageUrl}
          alt={logo.alt}
          className="h-full w-full object-contain p-3"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <p
          className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
          title={logo.alt}
        >
          {logo.alt}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="shrink-0" />
            }
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">Logo actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            anchor={cardRef}
            side="bottom"
            align="end"
            sideOffset={4}
            className="w-40"
          >
            <DropdownMenuItem onClick={() => onEdit(logo)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(logo)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
