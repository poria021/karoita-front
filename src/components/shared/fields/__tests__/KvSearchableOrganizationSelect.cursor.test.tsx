import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { KvSearchableOrganizationSelect } from '@/components/shared/fields/KvSearchableOrganizationSelect';

// jsdom has no ResizeObserver; the overlay's edge-auto-scroll hook needs a stub.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverStub;

vi.mock('@/services/organization-options.service', () => ({
  ORGANIZATION_OPTIONS_PAGE_SIZE: 10,
  OrganizationOptionsService: {
    getOptions: vi.fn(() => Promise.resolve({ items: [], hasMore: false })),
  },
}));

function Wrapper() {
  const [value, setValue] = useState('Tehran');
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <KvSearchableOrganizationSelect
        type="city"
        placeholder="شهر"
        value={value}
        onChange={setValue}
      />
    </QueryClientProvider>
  );
}

describe('KvSearchableOrganizationSelect cursor bug', () => {
  it('keeps a mid-string edit instead of resetting to empty when the field already had a value', () => {
    render(<Wrapper />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Tehran');

    // Simulate deleting the 3rd char ('h') and typing 'X' in its place: "Tehran" -> "TeXran".
    // This is the exact keystroke that used to get clobbered because the component
    // clears the parent value on the first edit of an already-filled field, then
    // re-synced `query` from that now-empty parent value on the very next render.
    fireEvent.change(input, { target: { value: 'TeXran' } });

    expect(input.value).toBe('TeXran');
  });
});
