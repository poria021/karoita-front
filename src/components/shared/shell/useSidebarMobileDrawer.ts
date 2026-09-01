'use client';

import { useEffect } from 'react';

type UseSidebarMobileDrawerArgs = {
  isMobileOpen: boolean;
  /** `readonly` تا هم `div` و هم `aside` بدون invariant بودن RefObject قبول شوند. */
  drawerRef: { readonly current: HTMLElement | null };
  onClose: () => void;
};

/**
 * Escape + تله/بازگردانی فوکوس برای دراور موبایل سایدبار.
 * رفتار باید با ترکیب `Sidebar` هم‌خوان بماند (فقط a11y).
 */
export function useSidebarMobileDrawer({
  isMobileOpen,
  drawerRef,
  onClose,
}: UseSidebarMobileDrawerArgs) {
  useEffect(() => {
    if (!isMobileOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const drawer = drawerRef.current;
    const focusable = drawer?.querySelector<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !drawer) return;

      const nodes = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter((node) => !node.hasAttribute('disabled'));
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isMobileOpen, drawerRef, onClose]);
}
