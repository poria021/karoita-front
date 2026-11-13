import { describe, expect, it } from 'vitest';

import { workbenchBoxToneClass } from './workbench-grid';

describe('workbenchBoxToneClass', () => {
  it('حالت خالی: بدون پس‌زمینه و با بردر خط‌چین', () => {
    const cls = workbenchBoxToneClass(true);
    expect(cls).toContain('border-dashed');
    expect(cls).toContain('bg-transparent');
    expect(cls).not.toContain('bg-kv-surface');
    expect(cls).toContain('shadow-none');
  });

  it('حالت پُر: سطح معمولی با سایهٔ نرم', () => {
    const cls = workbenchBoxToneClass(false);
    expect(cls).toContain('bg-kv-surface');
    expect(cls).toContain('shadow-kv-soft');
    expect(cls).not.toContain('border-dashed');
  });

  it('رنگ بردر پُر بر اساس نوع', () => {
    expect(workbenchBoxToneClass(false, 'soft')).toContain('border-kv-border/70');
    expect(workbenchBoxToneClass(false, 'default')).toMatch(
      /border-kv-border(?!\/)/
    );
  });
});
