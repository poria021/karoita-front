'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type Ref,
} from 'react';

import {
  computeEdgeScrollVelocity,
  resolveScrollableTarget,
} from '@/hooks/edgeAutoScroll';

export type UseEdgeAutoScrollOptions = {
  enabled?: boolean;
  /** Distance from top/bottom that starts auto-scroll (px). */
  edgeSize?: number;
  /** Max pixels advanced per animation frame. */
  maxSpeed?: number;
};

/**
 * Pointer-near-edge auto-scroll for long overlay lists (select / menu / combobox).
 * Attach `ref` + pointer handlers to the scroll container (or its wrapper).
 */
export function useEdgeAutoScroll<T extends HTMLElement = HTMLElement>(
  options: UseEdgeAutoScrollOptions = {}
) {
  const { enabled = true, edgeSize = 32, maxSpeed = 14 } = options;

  const nodeRef = useRef<T | null>(null);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const enabledRef = useRef(enabled);
  const edgeSizeRef = useRef(edgeSize);
  const maxSpeedRef = useRef(maxSpeed);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const syncOverflow = useCallback(() => {
    const target = resolveScrollableTarget(nodeRef.current);
    if (!target) {
      setCanScrollDown(false);
      return;
    }
    const next =
      target.scrollHeight > target.clientHeight + 1 &&
      target.scrollTop + target.clientHeight < target.scrollHeight - 2;
    setCanScrollDown((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
    edgeSizeRef.current = edgeSize;
    maxSpeedRef.current = maxSpeed;
    if (!enabled) velocityRef.current = 0;
  }, [edgeSize, enabled, maxSpeed]);

  useEffect(() => {
    const tick = () => {
      const velocity = velocityRef.current;
      if (velocity !== 0 && enabledRef.current) {
        const target = resolveScrollableTarget(nodeRef.current);
        if (target) {
          const maxScroll = target.scrollHeight - target.clientHeight;
          if (maxScroll > 0) {
            target.scrollTop = Math.min(
              maxScroll,
              Math.max(0, target.scrollTop + velocity)
            );
            syncOverflow();
          }
        }
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafRef.current);
      velocityRef.current = 0;
    };
  }, [syncOverflow]);

  const bindOverflowListeners = useCallback(
    (node: T | null) => {
      const target = resolveScrollableTarget(node);
      if (!target) {
        setCanScrollDown(false);
        return () => undefined;
      }

      const onScroll = () => syncOverflow();
      target.addEventListener('scroll', onScroll, { passive: true });
      const observer = new ResizeObserver(() => syncOverflow());
      observer.observe(target);
      // Content size changes (options loading) live on children.
      if (target.firstElementChild) {
        observer.observe(target.firstElementChild);
      }
      syncOverflow();

      return () => {
        target.removeEventListener('scroll', onScroll);
        observer.disconnect();
      };
    },
    [syncOverflow]
  );

  const cleanupOverflowRef = useRef<(() => void) | null>(null);

  const setRef = useCallback(
    (node: T | null) => {
      cleanupOverflowRef.current?.();
      cleanupOverflowRef.current = null;
      nodeRef.current = node;
      if (!node) {
        velocityRef.current = 0;
        setCanScrollDown(false);
        return;
      }
      // Nested viewport may mount a tick later (Radix Select).
      cleanupOverflowRef.current = bindOverflowListeners(node);
      window.requestAnimationFrame(() => {
        cleanupOverflowRef.current?.();
        cleanupOverflowRef.current = bindOverflowListeners(node);
      });
    },
    [bindOverflowListeners]
  );

  useEffect(() => {
    return () => {
      cleanupOverflowRef.current?.();
      cleanupOverflowRef.current = null;
    };
  }, []);

  const onPointerMove = useCallback(
    (event: { clientY: number; currentTarget: EventTarget }) => {
      if (!enabledRef.current) {
        velocityRef.current = 0;
        return;
      }
      const root =
        (event.currentTarget instanceof HTMLElement
          ? event.currentTarget
          : null) ?? nodeRef.current;
      const target = resolveScrollableTarget(root);
      if (!target) {
        velocityRef.current = 0;
        return;
      }
      if (target.scrollHeight <= target.clientHeight + 1) {
        velocityRef.current = 0;
        return;
      }

      const rect = target.getBoundingClientRect();
      velocityRef.current = computeEdgeScrollVelocity({
        offsetY: event.clientY - rect.top,
        height: rect.height,
        edgeSize: edgeSizeRef.current,
        maxSpeed: maxSpeedRef.current,
      });
    },
    []
  );

  const onPointerLeave = useCallback(() => {
    velocityRef.current = 0;
  }, []);

  const nudgeDown = useCallback(() => {
    if (!enabledRef.current) return;
    velocityRef.current = maxSpeedRef.current;
  }, []);

  const stop = useCallback(() => {
    velocityRef.current = 0;
  }, []);

  return {
    ref: setRef,
    onPointerMove,
    onPointerLeave,
    canScrollDown,
    nudgeDown,
    stop,
    syncOverflow,
  };
}

/** Merge a callback/object ref with the edge-auto-scroll ref setter. */
export function mergeEdgeAutoScrollRef<T extends HTMLElement>(
  edgeRef: (node: T | null) => void,
  externalRef?: Ref<T> | null
): (node: T | null) => void {
  return (node) => {
    edgeRef(node);
    if (typeof externalRef === 'function') {
      externalRef(node);
      return;
    }
    if (externalRef && typeof externalRef === 'object') {
      (externalRef as MutableRefObject<T | null>).current = node;
    }
  };
}
