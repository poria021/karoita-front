import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useOtpCountdown } from './useOtpCountdown';

describe('useOtpCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('در حالت idle شروع می‌کند — canResend: true، secondsLeft: 0', () => {
    const { result } = renderHook(() => useOtpCountdown(60));

    expect(result.current.canResend).toBe(true);
    expect(result.current.secondsLeft).toBe(0);
  });

  it('بعد از restart شمارش‌معکوس شروع می‌شود و canResend: false است', () => {
    const { result } = renderHook(() => useOtpCountdown(60));

    act(() => {
      result.current.restart();
    });

    expect(result.current.secondsLeft).toBe(60);
    expect(result.current.canResend).toBe(false);
  });

  it('هر ثانیه یک واحد کم می‌کند', () => {
    const { result } = renderHook(() => useOtpCountdown(60));

    act(() => {
      result.current.restart();
    });

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(59);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(58);
  });

  it('وقتی به صفر می‌رسد canResend: true می‌شود', () => {
    const { result } = renderHook(() => useOtpCountdown(3));

    act(() => {
      result.current.restart();
    });

    act(() => { vi.advanceTimersByTime(3000); });

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it('restart با آرگومان سفارشی مدت را override می‌کند', () => {
    const { result } = renderHook(() => useOtpCountdown(60));

    act(() => {
      result.current.restart(30);
    });

    expect(result.current.secondsLeft).toBe(30);
  });

  it('restart در حین شمارش، شمارش را ریست می‌کند', () => {
    const { result } = renderHook(() => useOtpCountdown(60));

    act(() => {
      result.current.restart();
    });

    act(() => { vi.advanceTimersByTime(10_000); });
    expect(result.current.secondsLeft).toBe(50);

    act(() => {
      result.current.restart();
    });

    expect(result.current.secondsLeft).toBe(60);
  });

  it('restart با مقدار منفی به صفر کلمپ می‌شود', () => {
    const { result } = renderHook(() => useOtpCountdown(60));

    act(() => {
      result.current.restart(-5);
    });

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it('بعد از اتمام شمارش، تایمر دیگر فعال نیست', () => {
    const { result } = renderHook(() => useOtpCountdown(2));

    act(() => {
      result.current.restart();
    });

    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.secondsLeft).toBe(0);

    // تایمر اضافی نباید secondsLeft را منفی کند
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.secondsLeft).toBe(0);
  });
});
