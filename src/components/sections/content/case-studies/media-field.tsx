'use client';

import { useState } from 'react';
import { ImageIcon, VideoIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { VideoUpload } from '@/components/sections/content/services/video-upload';
import { CoverUpload } from '@/components/sections/content/services/cover-upload';
import type { CaseStudyMedia } from '@/lib/api/content/case-studies';

type MediaFieldProps = {
  value?: CaseStudyMedia;
  onChange: (media: CaseStudyMedia | undefined) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  disabled?: boolean;
};

export function MediaField({
  value,
  onChange,
  onUploadingChange,
  disabled,
}: MediaFieldProps) {
  const [type, setType] = useState<'image' | 'video'>(value?.type ?? 'image');

  const currentUrl = value?.type === type ? value.url : null;

  function handleUrlChange(url: string | null) {
    if (url === null) {
      onChange(undefined);
      return;
    }
    onChange({ type, url, alt: value?.alt });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1 w-fit">
        {(['image', 'video'] as const).map((mediaType) => (
          <button
            key={mediaType}
            type="button"
            aria-pressed={type === mediaType}
            onClick={() => setType(mediaType)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-xs font-medium transition-colors',
              type === mediaType
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {mediaType === 'image' ? (
              <ImageIcon className="size-3.5" />
            ) : (
              <VideoIcon className="size-3.5" />
            )}
            {mediaType === 'image' ? 'Image' : 'Video'}
          </button>
        ))}
      </div>

      {type === 'image' ? (
        <CoverUpload
          value={currentUrl}
          onChange={handleUrlChange}
          onUploadingChange={onUploadingChange}
          disabled={disabled}
        />
      ) : (
        <VideoUpload
          value={currentUrl}
          onChange={handleUrlChange}
          onUploadingChange={onUploadingChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
