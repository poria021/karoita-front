export { _DEPRECATED_FALLBACK_ROLE_IDS, REAL_AUTH_PATHS } from './bridge/shared';
export { realLoginWithCredentials, realSendLoginOtp, realVerifyLoginOtp } from './bridge/login';
export {
  realRegister,
  realVerifyRegistrationOtp,
  type OtpCooldownResult,
  type ForgotPasswordOtpResult,
} from './bridge/registration';
export {
  realSendForgotPasswordOtp,
  realResetPassword,
  realSetPassword,
} from './bridge/password';
export { realSendAdminGateOtp, realVerifyAdminGateOtp } from './bridge/admin-gate';
export {
  SessionTransientError,
  isSessionTransientError,
  SessionDeadError,
  isDeadSessionHttpStatus,
  toSessionTransientError,
  realRefreshToken,
  realFetchSession,
  type SessionFailureKind,
} from './bridge/session';
export { realUpdateMe, realDeleteMe, realSignOut } from './bridge/profile';
