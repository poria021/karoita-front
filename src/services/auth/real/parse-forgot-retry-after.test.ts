import { describe, expect, it } from 'vitest';

import {
  DEFAULT_FORGOT_RETRY_AFTER_SECONDS,
  parseForgotPasswordRetryAfter,
} from './parse-forgot-retry-after';

describe('parseForgotPasswordRetryAfter', () => {
  it('reads time from a live Nest payload', () => {
    expect(parseForgotPasswordRetryAfter({ time: 60, message: '81234' })).toBe(
      60
    );
  });

  it('never uses message as the cooldown', () => {
    expect(parseForgotPasswordRetryAfter({ message: '81234' })).toBe(
      DEFAULT_FORGOT_RETRY_AFTER_SECONDS
    );
  });

  it('falls back when the body is empty or not an object', () => {
    expect(parseForgotPasswordRetryAfter(null)).toBe(
      DEFAULT_FORGOT_RETRY_AFTER_SECONDS
    );
    expect(parseForgotPasswordRetryAfter(undefined)).toBe(
      DEFAULT_FORGOT_RETRY_AFTER_SECONDS
    );
    expect(parseForgotPasswordRetryAfter('60')).toBe(
      DEFAULT_FORGOT_RETRY_AFTER_SECONDS
    );
  });

  it('clamps and rounds numeric time', () => {
    expect(parseForgotPasswordRetryAfter({ time: 0 })).toBe(0);
    expect(parseForgotPasswordRetryAfter({ time: -12 })).toBe(0);
    expect(parseForgotPasswordRetryAfter({ time: 90.6 })).toBe(91);
    expect(parseForgotPasswordRetryAfter({ time: 9999 })).toBe(600);
  });
});
