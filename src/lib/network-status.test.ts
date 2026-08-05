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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response()));
    const onOffline = vi.fn();
    const onOnline = vi.fn();
    ensureNetworkMonitoring({ onOffline, onOnline });

    stubNavigatorOnline(false);
    window.dispatchEvent(new Event('offline'));

    expect(useNetworkStore.getState().isOnline).toBe(false);
    expect(onOffline).toHaveBeenCalledTimes(1);
  });

  it('confirms online via probe after window online event', async () => {
    let online = false;
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => online,
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', fetchMock);

    const onOffline = vi.fn();
    const onOnline = vi.fn();
    ensureNetworkMonitoring({ onOffline, onOnline });
    expect(useNetworkStore.getState().isOnline).toBe(false);

    online = true;
    window.dispatchEvent(new Event('online'));

    await vi.waitFor(() => {
      expect(useNetworkStore.getState().isOnline).toBe(true);
    });
    expect(onOnline).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('marks offline after two failed probe rounds (hysteresis)', async () => {
    vi.useFakeTimers();
    stubNavigatorOnline(true);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    );
    const onOffline = vi.fn();
    const onOnline = vi.fn();

    ensureNetworkMonitoring({ onOffline, onOnline });

    // First probe round — streak 1, still optimistic online.
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();
    expect(useNetworkStore.getState().isOnline).toBe(true);

    // Second round after VERIFY_POLL_MS (1500).
    await vi.advanceTimersByTimeAsync(1500);
    await Promise.resolve();
    await vi.waitFor(() => {
      expect(useNetworkStore.getState().isOnline).toBe(false);
    });
    expect(onOffline).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('pauses polling while the document is hidden', async () => {
    vi.useFakeTimers();
    stubNavigatorOnline(true);
    const fetchMock = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', fetchMock);

    let visibility: DocumentVisibilityState = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(
      () => visibility
    );

    ensureNetworkMonitoring({ onOffline: vi.fn(), onOnline: vi.fn() });

    await vi.waitFor(() => {
      expect(useNetworkStore.getState().isOnline).toBe(true);
    });
    // Allow syncConnectivity `finally` / scheduleNextPoll to run.
    await Promise.resolve();
    await Promise.resolve();

    const callsAfterInit = fetchMock.mock.calls.length;
    expect(callsAfterInit).toBeGreaterThan(0);

    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));

    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock.mock.calls.length).toBe(callsAfterInit);

    vi.useRealTimers();
  });
});
