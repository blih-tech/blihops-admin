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
import type { CaseStudyListItem } from '@/lib/api/content/case-studies';

type ConfirmDeleteCaseStudyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseStudy?: CaseStudyListItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteCaseStudyDialog({
  open,
  onOpenChange,
  caseStudy,
  isDeleting,
  onConfirm,
}: ConfirmDeleteCaseStudyDialogProps) {
  const title =
    caseStudy?.titles.en || caseStudy?.titles.de || 'this case study';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete case study?</DialogTitle>
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
            {isDeleting ? <Dots dots={3} /> : 'Delete case study'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
