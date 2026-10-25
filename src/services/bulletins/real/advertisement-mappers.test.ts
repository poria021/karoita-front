import { describe, expect, it } from 'vitest';

import {
  kindToNestType,
  mapAdminAdvertisement,
  nestTypeToKind,
  toCreateBody,
  toUpdateBody,
} from './advertisement-mappers';
import type { UpsertBulletinInput } from '@/types/bulletins';
import type { NestAdvertisementDto } from '@/types/nest-advertisements';

const baseInput = (
  patch: Partial<UpsertBulletinInput> = {}
): UpsertBulletinInput => ({
  kind: 'announcement',
  title: 'عنوان',
  body: 'متن',
  audienceRoles: ['student'],
  provinces: ['تهران'],
  ...patch,
});

describe('advertisement-mappers', () => {
  it('maps kind ↔ Nest type', () => {
    expect(kindToNestType('advertisement')).toBe('ads');
    expect(kindToNestType('announcement')).toBe('info');
    expect(nestTypeToKind('ads')).toBe('advertisement');
    expect(nestTypeToKind('info')).toBe('announcement');
  });

  it('builds create body for info with province ids', () => {
    const body = toCreateBody(baseInput(), {
      provinceTitleToId: new Map([['تهران', 'prov-1']]),
    });
    expect(body.type).toBe('info');
    expect(body.format).toBe('text');
    expect(body.placement).toBe('sidebar');
    expect(body.targetProvinceIds).toEqual(['prov-1']);
    expect(body.targetRoles).toContain('student');
    expect(body.image).toBeUndefined();
    expect(body.link).toBeUndefined();
  });

  it('requires image id for image ads', () => {
    expect(() =>
      toCreateBody(
        baseInput({
          kind: 'advertisement',
          imageUrl: 'https://cdn.example/a.png',
        }),
        { provinceTitleToId: new Map() }
      )
    ).toThrow(/تصویر/);
  });

  it('maps admin dto provinces via id→title', () => {
    const dto: NestAdvertisementDto = {
      id: 'ad-1',
      type: 'info',
      format: 'text',
      title: 'T',
      body: 'B',
      placement: 'sidebar',
      targetRoles: ['student'],
      targetProvinceIds: ['p1'],
      targetUniversityIds: [],
      targetUserIds: [],
      isActive: true,
      clickCount: 0,
      impressionCount: 0,
      startsAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      createdByRole: 'organization_center',
    };
    const mapped = mapAdminAdvertisement(dto, new Map([['p1', 'قم']]));
    expect(mapped.kind).toBe('announcement');
    expect(mapped.provinces).toEqual(['قم']);
    expect(mapped.authorRole).toBe('central_organization');
    expect(mapped.format).toBe('text');
  });

  it('blocks adding image to an existing text ad on update', () => {
    expect(() =>
      toUpdateBody(
        baseInput({
          kind: 'advertisement',
          imageFile: new File(['x'], 'a.png', { type: 'image/png' }),
        }),
        {
          provinceTitleToId: new Map(),
          existingFormat: 'text',
        }
      )
    ).toThrow(/متنی/);
  });
});
