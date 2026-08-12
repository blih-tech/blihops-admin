'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dots } from '@/components/shared/Dots';
import type { Service } from '@/lib/api/content/services';

type ConfirmDeleteServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteServiceDialog({
  open,
  onOpenChange,
  service,
  isDeleting,
  onConfirm,
}: ConfirmDeleteServiceDialogProps) {
  const title = service?.content.en?.title ?? service?.content.de?.title;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete service?</DialogTitle>
          <DialogDescription>
            &ldquo;{title ?? 'Untitled service'}&rdquo; will be permanently
            removed from the website. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Dots dots={3} /> : 'Delete service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
