import { afterEach, describe, expect, it, vi } from 'vitest';

const { toastMock } = vi.hoisted(() => ({
  toastMock: {
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: toastMock,
}));

import {
  POST_COMMIT_REFRESH_TOAST,
  PostCommitRefreshError,
  isPostCommitRefreshError,
  notifyIfPostCommitRefreshFailure,
  reloadAfterWrite,
} from '@/lib/post-commit-refresh';

afterEach(() => {
  vi.clearAllMocks();
});

describe('reloadAfterWrite', () => {
  it('returns the reloaded value when GET succeeds', async () => {
    await expect(reloadAfterWrite(async () => ({ id: '1' }))).resolves.toEqual({
      id: '1',
    });
  });

  it('wraps a failed reload so callers can keep the write', async () => {
    const cause = new Error('سرویس موقتاً در دسترس نیست. لطفاً کمی بعد تلاش کنید.');
    await expect(
      reloadAfterWrite(async () => {
        throw cause;
      })
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(PostCommitRefreshError);
      expect(isPostCommitRefreshError(error)).toBe(true);
      expect((error as PostCommitRefreshError).message).toBe(
        POST_COMMIT_REFRESH_TOAST
      );
      expect((error as PostCommitRefreshError).cause).toBe(cause);
      return true;
    });
  });
});

describe('notifyIfPostCommitRefreshFailure', () => {
  it('warns only for post-commit refresh errors', () => {
    expect(notifyIfPostCommitRefreshFailure(new Error('boom'))).toBe(false);
    expect(toastMock.warning).not.toHaveBeenCalled();

    expect(
      notifyIfPostCommitRefreshFailure(new PostCommitRefreshError(new Error('x')))
    ).toBe(true);
    expect(toastMock.warning).toHaveBeenCalledWith(POST_COMMIT_REFRESH_TOAST);
    expect(toastMock.error).not.toHaveBeenCalled();
  });
});
