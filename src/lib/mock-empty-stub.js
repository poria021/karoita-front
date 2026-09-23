'use strict';
/**
 * Universal stub for mock modules in non-mock production builds.
 * Turbopack resolveAlias redirects all mock module imports to this file
 * when NEXT_PUBLIC_API_MODE is not 'mock'.
 *
 * Every named import resolves to a no-op function.
 * Safe because all mock code paths are guarded by IS_MOCK_MODE checks
 * and are never executed in real mode.
 */
const noop = function mockStub() {
  return undefined;
};

const handler = {
  get(_, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return noop;
    if (typeof prop === 'symbol') return undefined;
    return noop;
  },
  apply() {
    return undefined;
  },
  construct() {
    return {};
  },
  set() {
    return true;
  },
};

module.exports = new Proxy(noop, handler);
