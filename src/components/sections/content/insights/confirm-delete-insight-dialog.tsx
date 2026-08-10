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
import type { InsightListItem } from '@/lib/api/content/insights';

type ConfirmDeleteInsightDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insight?: InsightListItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteInsightDialog({
  open,
  onOpenChange,
  insight,
  isDeleting,
  onConfirm,
}: ConfirmDeleteInsightDialogProps) {
  const title = insight?.titles.en || insight?.titles.de || 'this insight';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete insight?</DialogTitle>
          <DialogDescription>
            &ldquo;{title}&rdquo; will be permanently removed. This action
            cannot be undone.
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
            {isDeleting ? <Dots dots={3} /> : 'Delete insight'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
