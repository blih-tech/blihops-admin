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
import type { TalentApplicationListItem } from '@/lib/api/talent/applications';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: TalentApplicationListItem | null;
  isPending: boolean;
  onConfirm: () => void;
};

export function SendCompletionRequestDialog({
  open,
  onOpenChange,
  application,
  isPending,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send completion request?</DialogTitle>
          <DialogDescription>
            {application
              ? `An email will be sent to ${application.fullName} (${application.workEmail}) with a secure link to submit photo, headline and bio. Any previous pending token will be replaced.`
              : 'This will send a completion email.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? <Dots dots={3} /> : 'Send request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
