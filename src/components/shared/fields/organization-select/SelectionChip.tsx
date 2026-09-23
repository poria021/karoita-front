import { FaIcon } from '@/components/shared/FaIcon';
import { Badge } from '@/components/ui/badge';
import { faIcons } from '@/utils/iconMap';

export function SelectionChip({
  label,
  onRemove,
  disabled = false,
}: {
  label: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="min-w-0 truncate text-kv-text-disabled">
        {label}
      </span>
    );
  }

  return (
    <Badge
      variant="brand"
      className="max-w-full gap-0.5 rounded-kv-tight px-1.5 py-0.5 pe-0.5 font-medium leading-none"
    >
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        tabIndex={-1}
        aria-label={`حذف ${label}`}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-kv-tight text-kv-brand-soft-fg outline-none transition-colors hover:bg-kv-brand/15 focus-visible:ring-2 focus-visible:ring-kv-ring/30"
      >
        <FaIcon icon={faIcons.xmark} size="2xs" />
      </button>
    </Badge>
  );
}
