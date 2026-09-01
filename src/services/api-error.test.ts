import { describe, expect, it } from 'vitest';
import { TimeoutError } from 'ky';

import { localizeApiError, mapHttpError } from '@/services/api-error';

const LOGIN_VERIFY_OTP_URL = 'http://localhost:3000/__nest-api/v1/auth/phone/login/verify-otp';
const ADMIN_VERIFY_OTP_URL = 'http://localhost:3000/__nest-api/v1/admin/auth/phone/login/verify-otp';
const SOME_OTHER_URL = 'http://localhost:3000/__nest-api/v1/auth/me';

/** رگرسیون: Nest کد OTP اشتباه را ۴۰۴ می‌دهد؛ حتی بدون `{ errors.hash }` پیام «منبع یافت نشد» نباشد. */
describe('localizeApiError — OTP verify 404 mapping', () => {
  it('maps a 404 with no parseable body on verify-otp to the wrong-code message', () => {
    expect(localizeApiError(null, 404, LOGIN_VERIFY_OTP_URL)).toBe(
      'کد تایید وارد‌شده اشتباه یا منقضی شده است.'
    );
  });

  it('maps a 404 with an unrelated/generic body on verify-otp to the wrong-code message', () => {
    expect(
      localizeApiError({ statusCode: 404, message: 'Not Found', error: 'Not Found' }, 404, LOGIN_VERIFY_OTP_URL)
    ).toBe('کد تایید وارد‌شده اشتباه یا منقضی شده است.');
  });

  it('still maps the documented Nest shape ({ errors: { hash } }) to the wrong-code message', () => {
    expect(
      localizeApiError({ errors: { hash: 'invalidOtp.' } }, 404, LOGIN_VERIFY_OTP_URL)
    ).toBe('کد تایید وارد‌شده اشتباه یا منقضی شده است.');
  });

  it('applies the same mapping on the admin verify-otp endpoint', () => {
    expect(localizeApiError(null, 404, ADMIN_VERIFY_OTP_URL)).toBe(
      'کد تایید وارد‌شده اشتباه یا منقضی شده است.'
    );
  });

  it('does NOT hijack 404s from unrelated endpoints', () => {
    expect(localizeApiError(null, 404, SOME_OTHER_URL)).toBe('منبع درخواستی یافت نشد.');
  });

  it('does NOT hijack 404s when the url is missing entirely (no regression on existing callers)', () => {
    expect(localizeApiError(null, 404)).toBe('منبع درخواستی یافت نشد.');
  });
});

describe('mapHttpError — timeout vs network', () => {
  it('maps TimeoutError to a generic timeout message, not the auth-network copy', async () => {
    const timeout = new TimeoutError(new Request('https://api.example.com/v1/users'));
    await expect(mapHttpError(timeout)).rejects.toMatchObject({
      message: 'پاسخ سرویس بیش از حد طول کشید. لطفاً دوباره تلاش کنید.',
    });
  });
});
