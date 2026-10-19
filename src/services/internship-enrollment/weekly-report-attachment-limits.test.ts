import { describe, expect, it } from 'vitest';

import { isAllowedWeeklyReportAttachment } from './weekly-report-attachment-limits';

describe('weekly-report-attachment-limits', () => {
  it('allows pdf txt zip by extension', () => {
    expect(isAllowedWeeklyReportAttachment({ name: 'a.pdf' })).toBe(true);
    expect(isAllowedWeeklyReportAttachment({ name: 'notes.TXT' })).toBe(true);
    expect(isAllowedWeeklyReportAttachment({ name: 'pack.zip' })).toBe(true);
  });

  it('allows images by extension and mime', () => {
    expect(isAllowedWeeklyReportAttachment({ name: 'photo.png' })).toBe(true);
    expect(isAllowedWeeklyReportAttachment({ name: 'IMG_1.JPG' })).toBe(true);
    expect(isAllowedWeeklyReportAttachment({ name: 'scan.jpeg' })).toBe(true);
    expect(isAllowedWeeklyReportAttachment({ name: 'pic.webp' })).toBe(true);
    expect(
      isAllowedWeeklyReportAttachment({ name: 'camera', mimeType: 'image/jpeg' })
    ).toBe(true);
  });

  it('rejects other types', () => {
    expect(isAllowedWeeklyReportAttachment({ name: 'anim.gif' })).toBe(false);
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
