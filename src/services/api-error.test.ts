import { describe, expect, it } from 'vitest';
import { TimeoutError } from 'ky';

import {
  extractApiMessage,
  localizeApiError,
  mapHttpError,
} from '@/services/api-error';

const LOGIN_VERIFY_OTP_URL =
  'http://localhost:3000/api/nest/v1/auth/phone/login/verify-otp';
const SEMESTER_URL = 'https://backenddev.darkube.ir/api/admin/semester';
const LESSON_STATUS_URL =
  'https://backenddev.darkube.ir/api/admin/lessons/6a8e2b51d2187e0f2fdb784b/status';

describe('extractApiMessage', () => {
  it('reads Nest message string and class-validator arrays', () => {
    expect(extractApiMessage({ message: 'Not Found' })).toBe('Not Found');
    expect(
      extractApiMessage({ message: ['title should not be empty', 'cityId must be a mongodb id'] })
    ).toBe('title should not be empty، cityId must be a mongodb id');
  });

  it('reads errors map and array without rewriting values', () => {
    expect(extractApiMessage({ errors: { hash: 'invalidOtp.' } })).toBe(
      'invalidOtp.'
    );
    expect(
      extractApiMessage({ errors: [{ message: 'province_id is required' }] })
    ).toBe('province_id is required');
  });

  it('falls through to detail then error', () => {
    expect(extractApiMessage({ detail: 'semester already open' })).toBe(
      'semester already open'
    );
    expect(extractApiMessage({ error: 'Bad Request' })).toBe('Bad Request');
  });

  it('prefers message over the generic Nest error field', () => {
    expect(
      extractApiMessage({
        message: 'capacity must not exceed generalProfessorCapacity',
        error: 'Bad Request',
        statusCode: 400,
      })
    ).toBe('capacity must not exceed generalProfessorCapacity');
  });

  it('prefers errors/constraints over a generic HTTP message so the toast is not 400', () => {
    expect(
      extractApiMessage({
        statusCode: 400,
        message: 'Bad Request',
        error: 'Bad Request',
        errors: { title: 'این عنوان قبلاً ثبت شده است.' },
      })
    ).toBe('این عنوان قبلاً ثبت شده است.');
    expect(
      extractApiMessage({
        statusCode: 400,
        message: [
          {
            property: 'title',
            constraints: { isNotEmpty: 'title should not be empty' },
          },
        ],
      })
    ).toBe('title should not be empty');
    expect(
      extractApiMessage({
        statusCode: 400,
        errors: { cityId: ['cityId must be a mongodb id'] },
      })
    ).toBe('cityId must be a mongodb id');
  });

  it('reads nested data/error objects and fa locale maps', () => {
    expect(
      extractApiMessage({
        statusCode: 400,
        data: { message: 'ظرفیت از حد مجاز بیشتر است.' },
      })
    ).toBe('ظرفیت از حد مجاز بیشتر است.');
    expect(
      extractApiMessage({
        error: { message: 'ترم تکراری است.', code: 'SEMESTER_DUPLICATE' },
      })
    ).toBe('ترم تکراری است.');
    expect(
      extractApiMessage({ message: { fa: 'کد تایید نامعتبر است.', en: 'invalid otp' } })
    ).toBe('کد تایید نامعتبر است.');
  });
});

describe('localizeApiError — server text only', () => {
  it('shows the Nest body even when it is English', () => {
    expect(
      localizeApiError(
        { statusCode: 404, message: 'Not Found', error: 'Not Found' },
        404,
        LOGIN_VERIFY_OTP_URL
      )
    ).toBe('Not Found');
    expect(
      localizeApiError({ errors: { hash: 'invalidOtp.' } }, 404, LOGIN_VERIFY_OTP_URL)
    ).toBe('invalidOtp.');
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
      'Duplicate semester, or another semester with the same season and structure already has course selection open.'
    );
    expect(
      localizeApiError(
        { message: 'capacity must not exceed generalProfessorCapacity' },
        400,
        LESSON_STATUS_URL
      )
    ).toBe('capacity must not exceed generalProfessorCapacity');
  });

  it('does not invent a domain message when the body is empty', () => {
    expect(
      localizeApiError(null, 404, LOGIN_VERIFY_OTP_URL, 'Not Found')
    ).toBe('Not Found');
    expect(localizeApiError(null, 400, SEMESTER_URL)).toBe('400');
    expect(localizeApiError(null, 404)).toBe('404');
  });
});

describe('mapHttpError — timeout vs network', () => {
  it('passes through the transport error message without rewriting it', async () => {
    const timeout = new TimeoutError(
      new Request('https://api.example.com/v1/users')
    );
    await expect(mapHttpError(timeout)).rejects.toMatchObject({
      message: timeout.message,
    });
  });
});
