// Vitest stub for next/headers — server-only Next.js module
import { vi } from 'vitest';

export const cookies = vi.fn().mockResolvedValue({
  toString: () => '',
  get: () => undefined,
  getAll: () => [],
  has: () => false,
});

export const headers = vi.fn().mockResolvedValue(new Headers());
