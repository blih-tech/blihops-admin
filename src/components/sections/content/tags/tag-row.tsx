'use client';

import { useState } from 'react';
import { TagIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Tag } from '@/lib/api/content/tags';

type TagRowProps = {
  tag: Tag;
  isPending?: boolean;
  onRename: (tag: Tag, name: string) => void;
  onDeleteClick: (tag: Tag) => void;
};

export function TagRow({
  tag,
  isPending = false,
  onRename,
  onDeleteClick,
}: TagRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(tag.name);

  function startEdit() {
    setDraft(tag.name);
    setIsEditing(true);
  }

  function commit() {
    const name = draft.trim();
    setIsEditing(false);
    if (name && name !== tag.name) {
      onRename(tag, name);
    }
  }

  function cancel() {
    setDraft(tag.name);
    setIsEditing(false);
  }

  return (
    <div
      aria-busy={isPending}
      onDoubleClick={startEdit}
      title="Double-click to rename"
      className={cn(
        'group inline-flex items-center gap-2 rounded-md border border-border bg-card py-2 pr-2 pl-3 transition-[opacity,background-color,box-shadow] hover:bg-muted/50 hover:shadow-sm',
        isPending && 'opacity-60',
      )}
    >
      <TagIcon className="size-3.5 shrink-0 text-muted-foreground" />
      {isEditing ? (
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commit();
            }
            if (event.key === 'Escape') {
              cancel();
            }
          }}
          onBlur={cancel}
          onFocus={(event) => event.target.select()}
          maxLength={100}
          autoFocus
          className="h-7 w-44 rounded-md"
        />
      ) : (
        <p className="min-w-0 text-sm font-medium text-foreground">
          {tag.name}
        </p>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="shrink-0 text-muted-foreground opacity-100 transition-opacity hover:text-destructive md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        onClick={() => onDeleteClick(tag)}
      >
        <XIcon />
        <span className="sr-only">Delete {tag.name}</span>
      </Button>
    </div>
  );
}
