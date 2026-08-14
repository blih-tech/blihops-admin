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
import type { LeadListItem } from '@/lib/api/leads';

type ConfirmDeleteLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadListItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteLeadDialog({
  open,
  onOpenChange,
  lead,
  isDeleting,
  onConfirm,
}: ConfirmDeleteLeadDialogProps) {
  const title = lead
    ? `${lead.fullName}${lead.company ? ` · ${lead.company}` : ''}`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete lead?</DialogTitle>
          <DialogDescription>
            &ldquo;{title || 'This lead'}&rdquo; will be permanently removed.
            This action cannot be undone.
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
            {isDeleting ? <Dots dots={3} /> : 'Delete lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
