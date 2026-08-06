'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type Ref,
  type MutableRefObject,
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
  }, []);

  const setRef = useCallback((node: T | null) => {
    nodeRef.current = node;
    if (!node) velocityRef.current = 0;
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

  return {
    ref: setRef,
    onPointerMove,
    onPointerLeave,
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
