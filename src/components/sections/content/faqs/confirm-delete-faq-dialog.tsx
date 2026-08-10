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
import type { Faq } from '@/lib/api/content/faqs';

type ConfirmDeleteFaqDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: Faq | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteFaqDialog({
  open,
  onOpenChange,
  faq,
  isDeleting,
  onConfirm,
}: ConfirmDeleteFaqDialogProps) {
  const question = faq?.content.en?.question ?? faq?.content.de?.question;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete question?</DialogTitle>
          <DialogDescription>
            &ldquo;{question ?? 'Untitled question'}&rdquo; will be permanently
            removed from the Pilot page. This action cannot be undone.
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
            {isDeleting ? <Dots dots={3} /> : 'Delete question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
