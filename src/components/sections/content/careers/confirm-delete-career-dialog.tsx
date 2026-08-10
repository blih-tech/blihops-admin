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
import type { CareerListItem } from '@/lib/api/content/careers';

type ConfirmDeleteCareerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  career?: CareerListItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteCareerDialog({
  open,
  onOpenChange,
  career,
  isDeleting,
  onConfirm,
}: ConfirmDeleteCareerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete career role?</DialogTitle>
          <DialogDescription>
            &ldquo;{career?.title}&rdquo; will be permanently removed. This
            action cannot be undone.
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
            {isDeleting ? <Dots dots={3} /> : 'Delete role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
