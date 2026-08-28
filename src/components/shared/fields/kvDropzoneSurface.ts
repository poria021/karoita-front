import { cn } from '@/lib/utils';

export type KvDropzoneSurfaceState = {
  disabled?: boolean;
  isDragActive?: boolean;
  error?: boolean;
};

/** Shared dashed drop target chrome for all file uploaders. */
export const KV_IMAGE_DOC_SURFACE_HEIGHT_CLASS = 'h-36';
export function kvDropzoneSurfaceClass({
  disabled = false,
  isDragActive = false,
  error = false,
}: KvDropzoneSurfaceState = {}): string {
  return cn(
    'group mx-auto flex min-h-32 w-full flex-col items-center justify-center gap-kv-pair rounded-kv-control border-2 border-dashed bg-kv-surface p-kv-group text-center transition-all',
    disabled
      ? 'cursor-not-allowed border-kv-border-disabled bg-kv-field-disabled text-kv-text-disabled'
      : isDragActive
        ? 'cursor-pointer border-kv-brand bg-kv-brand-soft/50'
        : 'cursor-pointer border-kv-border-strong hover:bg-kv-surface-muted',
    error && 'border-kv-danger'
  );
}

export function kvDropzoneIconClass({
  disabled = false,
  isDragActive = false,
}: KvDropzoneSurfaceState = {}): string {
  return cn(
    disabled ? 'text-kv-text-disabled' : 'text-kv-text-placeholder',
    isDragActive && !disabled && 'text-kv-brand-soft-fg'
  );
}
