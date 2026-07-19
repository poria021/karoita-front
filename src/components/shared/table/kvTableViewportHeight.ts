/** Shared admin table viewport height — keep busy/empty/scroll hosts in sync. */
export const KV_TABLE_VIEWPORT_HEIGHT = 'h-[min(28rem,55dvh)]';

/**
 * Empty-body fill under sticky thead inside {@link KvTableViewport}.
 * Subtracts one header row (`p-3.5` + line) so total height matches the host.
 */
export const KV_TABLE_EMPTY_FILL_HEIGHT =
  'min-h-[calc(min(28rem,55dvh)-3.5rem)]';
