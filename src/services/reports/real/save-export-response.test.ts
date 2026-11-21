// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { saveExportResponse } from '@/services/reports/real/save-export-response';

function pdfResponse(contentType: string): Response {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
  return new Response(bytes, { status: 200, headers: { 'content-type': contentType } });
}

describe('saveExportResponse', () => {
  let downloads: string[];

  beforeEach(() => {
    downloads = [];
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloads.push(this.download);
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('PDF واقعی با application/pdf ذخیره می‌شود', async () => {
    await saveExportResponse(pdfResponse('application/pdf'), 'a.pdf', 'pdf');
    expect(downloads).toEqual(['a.pdf']);
  });

  it('اگر Content-Type غلط بود ولی بایت‌ها %PDF بود، ذخیره می‌شود', async () => {
    await saveExportResponse(pdfResponse('application/json'), 'a.pdf', 'pdf');
    expect(downloads).toEqual(['a.pdf']);
  });

  it('JSON به‌جای PDF → خطای فارسی و هیچ فایلی ذخیره نمی‌شود', async () => {
    const res = new Response(JSON.stringify({ message: 'دسترسی ندارید' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    await expect(saveExportResponse(res, 'a.pdf', 'pdf')).rejects.toThrow(
      'دسترسی ندارید'
    );
    expect(downloads).toEqual([]);
  });

  it('اکسل باید zip (PK) باشد', async () => {
    const ok = new Response(new Uint8Array([0x50, 0x4b, 3, 4]), {
      headers: { 'content-type': 'application/octet-stream' },
    });
    await saveExportResponse(ok, 'a.xlsx', 'excel');
    expect(downloads).toEqual(['a.xlsx']);

    const bad = new Response('<html>', { headers: { 'content-type': 'text/html' } });
    await expect(saveExportResponse(bad, 'b.xlsx', 'excel')).rejects.toThrow();
  });
});
