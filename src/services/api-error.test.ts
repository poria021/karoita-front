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

const SEMESTER_URL = 'https://backenddev.darkube.ir/api/admin/semester';
const SEMESTER_BY_ID_URL =
  'https://backenddev.darkube.ir/api/admin/semester/6a96bc5ec0dbacb9d068188b';
const SEMESTERS_ALL_URL =
  'https://backenddev.darkube.ir/api/admin/semesters_all?structure=podmani';

describe('localizeApiError — admin semester 400/404', () => {
  it('maps duplicate/conflict 400 on POST and PATCH semester', () => {
    expect(
      localizeApiError(
        {
          message:
            'Duplicate semester, or another semester with the same season and structure already has course selection open.',
        },
        400,
        SEMESTER_URL
      )
    ).toBe(
      'این دوره تحصیلی تکراری است، یا ترم دیگری با همین فصل و ساختار انتخاب واحد باز دارد.'
    );
    expect(localizeApiError(null, 400, SEMESTER_BY_ID_URL)).toBe(
      'این دوره تحصیلی تکراری است، یا ترم دیگری با همین فصل و ساختار انتخاب واحد باز دارد.'
    );
  });

  it('maps 404 on semester by id, without hijacking semesters_all', () => {
    expect(localizeApiError(null, 404, SEMESTER_BY_ID_URL)).toBe(
      'دوره تحصیلی یافت نشد.'
    );
    expect(localizeApiError(null, 404, SEMESTERS_ALL_URL)).toBe(
      'منبع درخواستی یافت نشد.'
    );
  });
});

const SETTINGS_URL = 'https://backenddev.darkube.ir/api/admin/settings';
const WEEK_BY_ID_URL =
  'https://backenddev.darkube.ir/api/admin/weeks/6a96c14fc0dbacb9d06818a1';
const WEEKS_BY_LESSON_URL =
  'https://backenddev.darkube.ir/api/admin/weeks/lesson/6a96bc5ec0dbacb9d068188b';
const LESSON_STATUS_URL =
  'https://backenddev.darkube.ir/api/admin/lessons/6a8e2b51d2187e0f2fdb784b/status';
const LESSONS_BULK_STATUS_URL =
  'https://backenddev.darkube.ir/api/admin/lessons/status';
const LESSON_WEEKS_PUT_URL =
  'https://backenddev.darkube.ir/api/admin/lessons/6a8e2b51d2187e0f2fdb784b/weeks';

describe('localizeApiError — settings, weeks, lessons', () => {
  it('maps settings 404', () => {
    expect(localizeApiError(null, 404, SETTINGS_URL)).toBe(
      'تنظیمات تحصیلی یافت نشد.'
    );
  });

  it('maps weeks 404 on by-id and by-lesson', () => {
    expect(localizeApiError(null, 404, WEEK_BY_ID_URL)).toBe('هفته یافت نشد.');
    expect(localizeApiError(null, 404, WEEKS_BY_LESSON_URL)).toBe(
      'هفته یافت نشد.'
    );
  });

  it('maps lesson not-found and capacity-exceeded', () => {
    expect(
      localizeApiError(
        {
          message: 'Lesson with id 6a8e2b51d2187e0f2fdb784b not found',
          error: 'Not Found',
          statusCode: 404,
        },
        404,
        LESSON_STATUS_URL
      )
    ).toBe('درس یافت نشد.');
    expect(
      localizeApiError(
        { message: 'Lesson(s) not found: 66c7a9b3e8f5a12345678901' },
        404,
        LESSONS_BULK_STATUS_URL
      )
    ).toBe('درس یافت نشد.');
    expect(
      localizeApiError(
        { message: 'capacity must not exceed generalProfessorCapacity' },
        400,
        LESSON_STATUS_URL
      )
    ).toBe('ظرفیت درس از سقف عمومی اساتید بیشتر است.');
    expect(localizeApiError(null, 400, LESSON_WEEKS_PUT_URL)).toBe(
      'برنامهٔ هفتگی درس معتبر نیست.'
    );
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
