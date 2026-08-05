'use client';

import { useState, type ReactNode } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type KvConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive';
  confirmDisabled?: boolean;
  children?: ReactNode;
};

export function KvConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'تأیید',
  cancelText = 'انصراف',
  confirmVariant = 'default',
  confirmDisabled = false,
  children,
}: KvConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const busy = isSubmitting || confirmDisabled;

  const handleConfirm = async () => {
    if (busy) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isOpen && !busy) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="mb-4 border-b border-kv-border-muted pb-3">
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="mb-6">
          {description}
        </AlertDialogDescription>
        {children}
        <AlertDialogFooter className="gap-2 sm:justify-end">
          <AlertDialogCancel onClick={onClose} disabled={busy}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
            disabled={busy}
            aria-busy={isSubmitting}
            className={cn(
              confirmVariant === 'destructive' &&
                buttonVariants({
                  color: 'error',
                  appearance: 'solid',
                  size: 'md',
                })
            )}
          >
            {isSubmitting ? 'لطفاً صبر کنید...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
