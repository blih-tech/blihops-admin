'use client';

import { useRef, useState } from 'react';
import { Loader2Icon, UserRoundIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];
const MAX_SIZE_MB = 5;

type AvatarUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  error?: string;
  disabled?: boolean;
};

export function AvatarUpload({
  value,
  onChange,
  onUploadingChange,
  error,
  disabled,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  async function handleFile(file: File | undefined | null) {
    setFileError(null);
    if (!file) {
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Only JPEG, PNG, WEBP, or SVG images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`Image must be ${MAX_SIZE_MB} MB or smaller.`);
      return;
    }

    setIsUploading(true);
    onUploadingChange?.(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as {
        url?: string;
        error?: { message?: string };
      } | null;
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? 'Upload failed');
      }
      if (!payload?.url) {
        throw new Error('Upload failed: no URL returned');
      }
      onChange(payload.url);
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : 'Upload failed. Try again.',
      );
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  }

  const blocked = disabled || isUploading;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div
          role="button"
          tabIndex={blocked ? -1 : 0}
          aria-label="Upload avatar image"
          onClick={() => {
            if (!blocked) {
              inputRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if (!blocked && (event.key === 'Enter' || event.key === ' ')) {
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!blocked) {
              setIsDragging(true);
            }
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (!blocked) {
              void handleFile(event.dataTransfer.files?.[0]);
            }
          }}
          className={cn(
            'flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed bg-muted/40 text-muted-foreground transition-colors outline-none hover:border-ring hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
            isDragging && 'border-ring bg-muted/60',
            (error ?? fileError) && 'border-destructive/60',
            blocked && 'pointer-events-none opacity-50',
          )}
        >
          {isUploading ? (
            <Loader2Icon className="size-6 animate-spin" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob-storage avatar URLs; next/image adds no value at this size
            <img
              src={value}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRoundIcon className="size-6" />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">
            {value ? 'Avatar ready' : 'Add an avatar'}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Click to upload or drag &amp; drop. PNG · JPEG · WEBP · SVG — max
            5&nbsp;MB
          </p>
          {value && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onChange(null)}
            >
              <XIcon data-icon="inline-start" />
              Remove
            </Button>
          )}
        </div>
      </div>
      {(error ?? fileError) && (
        <p className="text-xs text-destructive">{error ?? fileError}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
        }}
      />
    </div>
  );
}
