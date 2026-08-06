'use client';

import type { OrganizationalCapacityKind } from '@/types/organizational-capacities';

import { OrganizationalCapacitiesTabs } from './OrganizationalCapacitiesTabs';

type OrganizationalCapacitiesHeaderProps = {
  kind: OrganizationalCapacityKind;
  onKindChange: (kind: OrganizationalCapacityKind) => void;
};

export function OrganizationalCapacitiesHeader({
  kind,
  onKindChange,
}: OrganizationalCapacitiesHeaderProps) {
  return (
    <div className="border-b border-kv-border pb-kv-group">
      <OrganizationalCapacitiesTabs value={kind} onChange={onKindChange} />
    </div>
  );
}
