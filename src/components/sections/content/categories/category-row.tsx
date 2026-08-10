'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/lib/api/content/categories';

type CategoryRowProps = {
  category: Category;
  isPending?: boolean;
  onRename: (category: Category, name: string) => void;
  onDeleteClick: (category: Category) => void;
};

export function CategoryRow({
  category,
  isPending = false,
  onRename,
  onDeleteClick,
}: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(category.name);

  function startEdit() {
    setDraft(category.name);
    setIsEditing(true);
  }

  function commit() {
    const name = draft.trim();
    setIsEditing(false);
    if (name && name !== category.name) {
      onRename(category, name);
    }
  }

  function cancel() {
    setDraft(category.name);
    setIsEditing(false);
  }

  return (
    <div
      aria-busy={isPending}
      onDoubleClick={startEdit}
      className={cn(
        'group flex items-center gap-3 px-5 py-3.5 transition-[opacity,background-color] hover:bg-muted/50',
        isPending && 'opacity-60',
      )}
    >
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
          className="h-8 w-56 rounded-md"
        />
      ) : (
        <p className="min-w-0 text-sm font-medium text-foreground">
          {category.name}
        </p>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={() => onDeleteClick(category)}
      >
        <XIcon />
        <span className="sr-only">Delete {category.name}</span>
      </Button>
    </div>
  );
}
