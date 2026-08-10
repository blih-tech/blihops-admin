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
import type { Testimonial } from '@/lib/api/content/testimonials';

type ConfirmDeleteTestimonialDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial | null;
  isDeleting: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteTestimonialDialog({
  open,
  onOpenChange,
  testimonial,
  isDeleting,
  onConfirm,
}: ConfirmDeleteTestimonialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete testimonial?</DialogTitle>
          <DialogDescription>
            &ldquo;{testimonial?.name}&rdquo;&apos;s quote will be removed from
            the home page. This action cannot be undone.
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
            {isDeleting ? <Dots dots={3} /> : 'Delete testimonial'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
