import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('بلافاصله مقدار اولیه را برمی‌گرداند', () => {
    const { result } = renderHook(() => useDebouncedValue('سلام', 300));
    expect(result.current).toBe('سلام');
  });

  it('قبل از اتمام delay مقدار قدیمی را نگه می‌دارد', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebouncedValue(value, delay),
      { initialProps: { value: 'الف', delay: 300 } }
    );

    rerender({ value: 'ب', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('الف');
  });

  it('بعد از اتمام دقیق delay مقدار جدید را اعمال می‌کند', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebouncedValue(value, delay),
      { initialProps: { value: 'الف', delay: 300 } }
    );

    rerender({ value: 'ب', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('ب');
  });

  it('در تغییرات سریع فقط آخرین مقدار اعمال می‌شود (debounce واقعی)', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'الف' } }
    );

    rerender({ value: 'ب' });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'ج' });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'د' });
    act(() => { vi.advanceTimersByTime(300); });

    expect(result.current).toBe('د');
  });

  it('بعد از unmount تایمر لغو می‌شود و خطا نمی‌دهد', () => {
    const { rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'الف' } }
    );

    rerender({ value: 'ب' });
    unmount();

    // نباید پس از unmount setState فراخوانی شود
    expect(() => {
      act(() => { vi.advanceTimersByTime(300); });
    }).not.toThrow();
  });

  it('با نوع عددی کار می‌کند', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebouncedValue(value, 200),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });
    act(() => { vi.advanceTimersByTime(200); });

    expect(result.current).toBe(42);
  });
});
