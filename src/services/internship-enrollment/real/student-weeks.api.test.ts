import { describe, expect, it, vi } from 'vitest';

import { studentWeeksApi } from './student-weeks.api';
import { apiClient } from '@/services/api-client';

vi.mock('@/services/api-client', () => ({
  apiClient: { patchMaybeJson: vi.fn(async () => null) },
}));

describe('studentWeeksApi.setMentorPresent', () => {
  it('PATCHes v1/student-weeks/{id}/mentor-present with isMentorPresent', async () => {
    await studentWeeksApi.setMentorPresent('w1', true);

    expect(apiClient.patchMaybeJson).toHaveBeenCalledWith(
      'v1/student-weeks/w1/mentor-present',
      { isMentorPresent: true }
    );
  });
});
