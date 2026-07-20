export type AuthFormMessageType = 'error' | 'success' | 'info';

export interface AuthFormMessageState {
  type: AuthFormMessageType;
  text: string;
}
