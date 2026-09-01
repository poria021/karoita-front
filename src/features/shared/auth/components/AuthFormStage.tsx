'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

/**
 * ارتفاع اسلات auth حداقل به اندازهٔ فرم جاری می‌ماند (بدون برش)
 * و وقتی فرم کوتاه‌تر شود min-height را نرم پایین می‌آورد.
 */
export function AuthFormStage({
  stageKey,
  children,
}: {
  stageKey: string;
  children: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    const stage = stageRef.current;
    if (!inner || !stage) return;

    const apply = () => {
      const next = Math.ceil(inner.getBoundingClientRect().height);
      if (next <= 0) return;
      if (
        targetRef.current !== undefined &&
        Math.abs(next - targetRef.current) < 1
      ) {
        return;
      }
      targetRef.current = next;
      stage.style.minHeight = `${next}px`;
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [stageKey]);

  return (
    <div ref={stageRef} className="kv-auth-form-stage">
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
