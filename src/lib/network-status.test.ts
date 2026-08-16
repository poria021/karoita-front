/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  __resetNetworkMonitoringForTests,
  ensureNetworkMonitoring,
} from '@/lib/network-status';
import { useNetworkStore } from '@/store/useNetworkStore';

function stubNavigatorOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => online,
  });
}

describe('network-status monitor', () => {
  afterEach(() => {
    __resetNetworkMonitoringForTests();
    useNetworkStore.setState({ isOnline: true });
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sets store offline when navigator reports offline on init', () => {
    stubNavigatorOnline(false);
    const onOffline = vi.fn();
    const onOnline = vi.fn();

    ensureNetworkMonitoring({ onOffline, onOnline });

    expect(useNetworkStore.getState().isOnline).toBe(false);
    expect(onOffline).toHaveBeenCalledTimes(1);
    expect(onOnline).not.toHaveBeenCalled();
  });

  it('goes offline immediately on window offline event', () => {
    stubNavigatorOnline(true);
    const onOffline = vi.fn();
    const onOnline = vi.fn();
    ensureNetworkMonitoring({ onOffline, onOnline });

    stubNavigatorOnline(false);
    window.dispatchEvent(new Event('offline'));

    expect(useNetworkStore.getState().isOnline).toBe(false);
    expect(onOffline).toHaveBeenCalledTimes(1);
  });

  it('goes online immediately on window online event', () => {
    stubNavigatorOnline(false);
    const onOffline = vi.fn();
    const onOnline = vi.fn();
    ensureNetworkMonitoring({ onOffline, onOnline });
    expect(useNetworkStore.getState().isOnline).toBe(false);

    stubNavigatorOnline(true);
    window.dispatchEvent(new Event('online'));

    expect(useNetworkStore.getState().isOnline).toBe(true);
    expect(onOnline).toHaveBeenCalledTimes(1);
  });
});
