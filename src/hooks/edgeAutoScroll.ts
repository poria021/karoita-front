/**
 * Pure velocity helper for Google-Translate-style edge hover auto-scroll.
 * Negative = scroll up, positive = scroll down, 0 = idle.
 */
export function computeEdgeScrollVelocity(input: {
  offsetY: number;
  height: number;
  edgeSize: number;
  maxSpeed: number;
}): number {
  const { offsetY, height, edgeSize, maxSpeed } = input;
  if (height <= 0 || edgeSize <= 0 || maxSpeed <= 0) return 0;

  const edge = Math.min(edgeSize, height / 2);

  if (offsetY < edge) {
    const intensity = (edge - Math.max(0, offsetY)) / edge;
    return -maxSpeed * intensity;
  }

  if (offsetY > height - edge) {
    const intensity = (Math.min(height, offsetY) - (height - edge)) / edge;
    return maxSpeed * intensity;
  }

  return 0;
}

export function resolveScrollableTarget(
  root: HTMLElement | null
): HTMLElement | null {
  if (!root) return null;
  if (root.scrollHeight > root.clientHeight + 1) return root;

  const nested = root.querySelector<HTMLElement>(
    '[data-slot="select-viewport"], [data-radix-select-viewport], [cmdk-list], [data-edge-auto-scroll]'
  );
  if (nested && nested.scrollHeight > nested.clientHeight + 1) {
    return nested;
  }

  return root;
}
