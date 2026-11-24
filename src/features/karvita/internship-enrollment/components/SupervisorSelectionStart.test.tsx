/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SupervisorSelectionStart } from './SupervisorSelectionStart';

afterEach(() => {
  cleanup();
});

describe('SupervisorSelectionStart', () => {
  it('tells the learner in red which professor removed them and that they can retry', () => {
    render(
      <SupervisorSelectionStart
        wasDropped
        droppedSupervisorName="اکرم صفری"
        onStart={() => {}}
      />
    );

    const message = screen.getByText(
      'استاد «اکرم صفری» شما را از این درس حذف کرد. می‌توانید دوباره اقدام کنید.'
    );
    expect(message.className).toContain('text-kv-danger');
  });

  it('falls back to a generic professor label when the name is unknown', () => {
    render(
      <SupervisorSelectionStart
        wasDropped
        droppedSupervisorName={null}
        onStart={() => {}}
      />
    );

    expect(
      screen.getByText(
        'استاد راهنما شما را از این درس حذف کرد. می‌توانید دوباره اقدام کنید.'
      )
    ).toBeInTheDocument();
  });

  it('keeps the neutral muted message when the learner was not removed', () => {
    render(
      <SupervisorSelectionStart
        wasDropped={false}
        droppedSupervisorName={null}
        onStart={() => {}}
      />
    );

    expect(screen.queryByText(/شما را از این درس حذف کرد/)).toBeNull();
    const message = screen.getByText(/درگاه رسمی انتخاب واحد/);
    expect(message.className).not.toContain('text-kv-danger');
  });

  it('still lets the learner restart the selection after being removed', async () => {
    const onStart = vi.fn();
    render(
      <SupervisorSelectionStart
        wasDropped
        droppedSupervisorName="اکرم صفری"
        onStart={onStart}
      />
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /شروع فرآیند انتخاب واحد و تعیین ناظر/,
      })
    );
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});
