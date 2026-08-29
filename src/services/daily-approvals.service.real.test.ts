import { afterEach, describe, expect, it, vi } from 'vitest';

import { REAL_MODE_NOT_IMPLEMENTED } from '@/lib/api-mode';
import { DailyApprovalsService } from '@/services/daily-approvals.service';

describe('DailyApprovalsService real fail-closed', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws the shared real stub instead of serving mock reviews', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');

    await expect(DailyApprovalsService.listTerms('internship')).rejects.toThrow(
      REAL_MODE_NOT_IMPLEMENTED
    );
    await expect(DailyApprovalsService.getPassingScoreThreshold()).rejects.toThrow(
      REAL_MODE_NOT_IMPLEMENTED
    );
    await expect(
      DailyApprovalsService.listPage({
        kind: 'internship',
        query: '',
        readFilter: 'all',
        course: 'all',
        termId: '',
        offset: 0,
        limit: 20,
      })
    ).rejects.toThrow(REAL_MODE_NOT_IMPLEMENTED);
  });
});
