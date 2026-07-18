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
  /** When true, confirm is disabled (e.g. parent-driven loading). */
  confirmDisabled?: boolean;
  children?: ReactNode;
};

/**
 * Product confirmation — `ui/alert-dialog` + product button variants.
 * Panel chrome matches {@link KvDialogContent}.
 */
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
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="mb-kv-section gap-1">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter className="mt-2 gap-2 sm:justify-stretch">
          <AlertDialogCancel onClick={onClose} disabled={busy}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
            disabled={busy}
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
