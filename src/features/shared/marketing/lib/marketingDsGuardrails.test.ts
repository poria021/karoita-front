import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const MARKETING_DIR = path.join(
  process.cwd(),
  'src/features/shared/marketing/components'
);

function listTsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listTsxFiles(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });
}

describe('marketing DS guardrails', () => {
  const files = listTsxFiles(MARKETING_DIR);

  it('scans marketing components', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it('avoids raw shadows, sub-12px type, and LTR margin utilities', () => {
    const banned =
      /shadow-(?:md|sm|xl)\b|text-\[(?:10|11)px\]|\bml-\d|\bmr-\d|rounded-l-none|rounded-r-3xl/;

    const offenders: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      if (banned.test(source)) {
        offenders.push(path.relative(process.cwd(), file));
      }
    }

    expect(offenders).toEqual([]);
  });
});
