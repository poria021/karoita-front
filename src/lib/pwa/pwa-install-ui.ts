export const PWA_INSTALL_DISMISS_KEY = 'karvita-pwa-install-dismissed';

type Listener = () => void;

let dialogOpen = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribePwaInstallDialog(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function peekPwaInstallDialogOpen(): boolean {
  return dialogOpen;
}

export function openPwaInstallDialog(): void {
  dialogOpen = true;
  emit();
}

export function closePwaInstallDialog(): void {
  dialogOpen = false;
  emit();
}

export function isPwaInstallDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(PWA_INSTALL_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissPwaInstallSuggestion(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PWA_INSTALL_DISMISS_KEY, '1');
  } catch {
    // حالت خصوصی — ممکن است بنر همین نشست برگردد.
  }
  closePwaInstallDialog();
}

export function shouldShowPwaInstallBanner(input: {
  standalone: boolean;
  dismissed: boolean;
  nativeAvailable: boolean;
}): boolean {
  return input.nativeAvailable && !input.standalone && !input.dismissed;
}
