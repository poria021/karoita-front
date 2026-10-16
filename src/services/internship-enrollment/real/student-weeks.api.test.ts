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

describe('studentWeeksApi school-admin approvals', () => {
  it('PATCHes approve-mentor-present with the flag and optional time', async () => {
    await studentWeeksApi.approveMentorPresent('w1', true, '2026-10-10T00:00:00.000Z');

    expect(apiClient.patchMaybeJson).toHaveBeenCalledWith(
      'v1/student-weeks/w1/approve-mentor-present',
      {
        isApprovedBySchoolAdminMentorPresent: true,
        mentorPresentAt: '2026-10-10T00:00:00.000Z',
      }
    );
  });

  it('omits studentPresentAt when no time is given', async () => {
    await studentWeeksApi.approveStudentPresent('w1', false);

    expect(apiClient.patchMaybeJson).toHaveBeenCalledWith(
      'v1/student-weeks/w1/approve-student-present',
      { isApprovedBySchoolAdminStudentPresent: false }
    );
  });
});

describe('studentWeeksApi.setCanWatchOthers', () => {
  it('PATCHes can-watch-others with canWatchOthers', async () => {
    await studentWeeksApi.setCanWatchOthers('w1', true);

    expect(apiClient.patchMaybeJson).toHaveBeenCalledWith(
      'v1/student-weeks/w1/can-watch-others',
      { canWatchOthers: true }
    );
  });
});
