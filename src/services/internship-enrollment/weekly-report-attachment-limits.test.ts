import { describe, expect, it } from 'vitest';

import { isAllowedWeeklyReportAttachment } from './weekly-report-attachment-limits';

describe('weekly-report-attachment-limits', () => {
  it('allows pdf txt zip by extension', () => {
    expect(isAllowedWeeklyReportAttachment({ name: 'a.pdf' })).toBe(true);
    expect(isAllowedWeeklyReportAttachment({ name: 'notes.TXT' })).toBe(true);
    expect(isAllowedWeeklyReportAttachment({ name: 'pack.zip' })).toBe(true);
  });

  it('rejects other types', () => {
    expect(isAllowedWeeklyReportAttachment({ name: 'photo.png' })).toBe(false);
    expect(isAllowedWeeklyReportAttachment({ name: 'clip.mp4' })).toBe(false);
    expect(isAllowedWeeklyReportAttachment({ name: 'doc.docx' })).toBe(false);
  });

  it('allows by mime when extension missing', () => {
    expect(
      isAllowedWeeklyReportAttachment({
        name: 'report',
        mimeType: 'application/pdf',
      })
    ).toBe(true);
  });
});
