'use client';

import { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Tag } from '@/lib/api/content/tags';

type TagInputProps = {
  available: Tag[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function TagInput({
  available,
  value,
  onChange,
  disabled,
}: TagInputProps) {
  const [query, setQuery] = useState('');

  const selected = value
    .map((id) => available.find((tag) => tag.id === id))
    .filter((tag): tag is Tag => tag !== undefined);

  const suggestions = available
    .filter((tag) => !value.includes(tag.id))
    .filter((tag) =>
      tag.name.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .slice(0, 6);

  function addTag(id: string) {
    onChange([...value, id]);
    setQuery('');
  }

  function removeTag(id: string) {
    onChange(value.filter((existing) => existing !== id));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5">
        {selected.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-xs font-medium text-foreground"
          >
            {tag.name}
            <button
              type="button"
              aria-label={`Remove ${tag.name}`}
              onClick={() => removeTag(tag.id)}
              className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <Input
          type="text"
          placeholder={selected.length === 0 ? 'Search tags…' : 'Add more…'}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={disabled}
          className="h-7 min-w-32 flex-1 border-none bg-transparent px-1 shadow-none focus-visible:ring-0"
        />
      </div>

      {query.trim() && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <Button
              key={tag.id}
              type="button"
              variant="outline"
              size="xs"
              disabled={disabled}
              onClick={() => addTag(tag.id)}
            >
              <PlusIcon data-icon="inline-start" />
              {tag.name}
            </Button>
          ))}
        </div>
      )}
      {query.trim() && suggestions.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No matching tags. Create tags in the Tags section first.
        </p>
      )}
    </div>
  );
}
