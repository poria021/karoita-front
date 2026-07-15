/** Severity of the auth banner shown above the login/register forms (see `AuthFormMessage.tsx`). */
export type AuthFormMessageType = 'error' | 'success' | 'info';

/** Local, transient feedback state surfaced by `useLoginForm`/`useRegisterForm`. */
export interface AuthFormMessageState {
  type: AuthFormMessageType;
  text: string;
}
