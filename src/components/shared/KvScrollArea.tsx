import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * تنها ظاهر اسکرول محصول. ظاهر در `globals.css` روی `.kv-scroll-area` و `*`
 * یکی است — اورلی / جدول / سایدبار توکن جدا ندارند.
 */
export const kvScrollAreaClassName = 'kv-scroll-area';

/**
 * اسکرول بدون کروم — فقط نوار تب و ناوبار فشردهٔ افقی.
 * جای دیگری hide نکنید؛ اسکرول محتوا باید همان KvScrollArea باشد.
 */
export const kvScrollAreaHiddenClassName = 'kv-scroll-area-hidden';

export type KvScrollAreaProps = React.ComponentProps<'div'>;

export function KvScrollArea({
  className,
  ref,
  ...props
}: KvScrollAreaProps) {
  return (
    <div
      ref={ref}
      data-slot="kv-scroll-area"
      className={cn(
        'min-h-0 overflow-auto',
        kvScrollAreaClassName,
        className
      )}
      {...props}
    />
  );
}
