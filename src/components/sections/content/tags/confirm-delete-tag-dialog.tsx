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
import type { Tag } from '@/lib/api/content/tags';

type ConfirmDeleteTagDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteTagDialog({
  open,
  onOpenChange,
  tag,
  isDeleting,
  onConfirm,
}: ConfirmDeleteTagDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete tag?</DialogTitle>
          <DialogDescription>
            &ldquo;{tag?.name}&rdquo; will be permanently removed and detached
            from case studies and insights. This action cannot be undone.
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
            {isDeleting ? <Dots dots={3} /> : 'Delete tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
