import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { toastMock } = vi.hoisted(() => {
  const toastFn = vi.fn(() => 'toast-1');
  return {
    toastMock: Object.assign(toastFn, {
      message: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
      dismiss: vi.fn(),
    }),
  };
});

vi.mock('sonner', () => ({
  toast: toastMock,
}));

import { scheduleUndoableMutation } from '@/lib/undoable-mutation';

describe('scheduleUndoableMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('commits on auto-close when undo was not pressed', async () => {
    const commit = vi.fn(async () => 'ok');
    const onCommitted = vi.fn();

    scheduleUndoableMutation({
      message: 'در حال ارسال…',
      commit,
      onCommitted,
    });

    const opts = toastMock.mock.calls[0]?.[1] as {
      onAutoClose?: () => void;
      action?: { onClick: () => void };
    };

    opts.onAutoClose?.();
    await vi.waitFor(() => {
      expect(commit).toHaveBeenCalledTimes(1);
      expect(onCommitted).toHaveBeenCalledWith('ok');
    });
  });

  it('does not commit when undo is pressed', async () => {
    const commit = vi.fn(async () => 'ok');
    const onUndone = vi.fn();

    scheduleUndoableMutation({
      message: 'در حال ارسال…',
      commit,
      onUndone,
    });

    const opts = toastMock.mock.calls[0]?.[1] as {
      onAutoClose?: () => void;
      onDismiss?: () => void;
      action?: { onClick: () => void; label: string };
    };

    expect(opts.action?.label).toBe('بازگردانی');
    opts.action?.onClick();
    expect(onUndone).toHaveBeenCalledTimes(1);

    opts.onAutoClose?.();
    opts.onDismiss?.();
    await Promise.resolve();

    expect(commit).not.toHaveBeenCalled();
    expect(toastMock.message).toHaveBeenCalled();
  });
});
