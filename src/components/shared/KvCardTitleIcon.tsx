import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { FaIcon } from '@/components/shared/FaIcon';

type KvCardTitleIconProps = {
  icon: IconDefinition;
};

export function KvCardTitleIcon({ icon }: KvCardTitleIconProps) {
  return (
    <div
      className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand/10 text-kv-brand-soft-fg"
      aria-hidden
    >
      <FaIcon icon={icon} size="sm" />
    </div>
  );
}
