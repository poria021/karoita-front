import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { HydrationSafe } from '@/components/shared/shell/HydrationSafe';
import {
  LEGACY_USER_STORE_STORAGE_KEY,
  useUserStore,
} from '@/store/useUserStore';

describe('HydrationSafe', () => {
  afterEach(() => {
    useUserStore.setState({
      activeUser: null,
      isAuthenticated: false,
      hasHydrated: false,
    });
    sessionStorage.clear();
  });

  it('marks chrome ready without rehydrating a persisted user profile', async () => {
    useUserStore.setState({
      activeUser: null,
      isAuthenticated: false,
      hasHydrated: false,
    });
    sessionStorage.setItem(
      LEGACY_USER_STORE_STORAGE_KEY,
      JSON.stringify({
        state: {
          activeUser: {
            mobile: '9123456786',
            role: 'super_admin',
            firstName: 'نشت',
          },
          isAuthenticated: true,
        },
      })
    );

    render(
      <HydrationSafe>
        <div>آماده</div>
      </HydrationSafe>
    );

    await waitFor(() => {
      expect(useUserStore.getState().hasHydrated).toBe(true);
    });

    expect(useUserStore.getState().activeUser).toBeNull();
    expect(sessionStorage.getItem(LEGACY_USER_STORE_STORAGE_KEY)).toBeNull();
  });
});
