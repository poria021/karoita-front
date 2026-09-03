'use client';

import { useCallback, useRef, useState } from 'react';

const DRAFT_STORAGE_PREFIX = 'karvita:draft:';
const DEFAULT_DEBOUNCE_MS = 600;
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type StoredDraft<T> = {
  value: T;
  savedAt: number;
};

export type UseLocalFormDraftOptions<T> = {
  key: string;
  initialValue: T;
  debounceMs?: number;
  maxAgeMs?: number;
};

function getStorageKey(key: string) {
  return `${DRAFT_STORAGE_PREFIX}${key}`;
}

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function isPlainSerializable(value: unknown): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every((item) => isPlainSerializable(item));
  }
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every((item) => isPlainSerializable(item));
  }
  return false;
}

export function readLocalFormDraftState<T>(
  key: string,
  maxAgeMs: number
): { value: T | null; hasDraft: boolean } {
  if (!hasWindow()) {
    return { value: null, hasDraft: false };
  }

  const storageKey = getStorageKey(key);
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return { value: null, hasDraft: false };
    }

    const parsed = JSON.parse(raw) as Partial<StoredDraft<T>>;
    const value = parsed?.value;
    const savedAt = parsed?.savedAt;

    if (
      value == null ||
      typeof savedAt !== 'number' ||
      Number.isNaN(savedAt) ||
      !isPlainSerializable(value)
    ) {
      window.localStorage.removeItem(storageKey);
      return { value: null, hasDraft: false };
    }

    if (Date.now() - savedAt > maxAgeMs) {
      window.localStorage.removeItem(storageKey);
      return { value: null, hasDraft: false };
    }

    return { value: value as T, hasDraft: true };
  } catch {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // noop
    }
    return { value: null, hasDraft: false };
  }
}

export function writeLocalFormDraftState<T>(key: string, value: T) {
  if (!hasWindow()) {
    return;
  }

  const storageKey = getStorageKey(key);
  try {
    const payload: StoredDraft<T> = {
      value,
      savedAt: Date.now(),
    };
    if (!isPlainSerializable(payload)) {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // noop
  }
}

export function useLocalFormDraft<T>(options: UseLocalFormDraftOptions<T>) {
  const {
    key,
    initialValue,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    maxAgeMs = DEFAULT_MAX_AGE_MS,
  } = options;

  const [draftKey, setDraftKey] = useState(key);
  const [value, setValueState] = useState<T>(() => {
    const { value } = readLocalFormDraftState<T>(key, maxAgeMs);
    return value ?? initialValue;
  });
  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    const { hasDraft } = readLocalFormDraftState<T>(key, maxAgeMs);
    return hasDraft;
  });
  const timerRef = useRef<number | null>(null);

  const resolvedValue = key === draftKey ? value : readLocalFormDraftState<T>(key, maxAgeMs).value ?? initialValue;
  const resolvedHasDraft = key === draftKey ? hasDraft : readLocalFormDraftState<T>(key, maxAgeMs).hasDraft;

  const clearDraft = useCallback(() => {
    if (!hasWindow()) {
      return;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      window.localStorage.removeItem(getStorageKey(key));
    } catch {
      // noop
    }

    setDraftKey(key);
    setValueState(initialValue);
    setHasDraft(false);
  }, [initialValue, key]);

  const setValue = useCallback(
    (next: T) => {
      setDraftKey(key);
      setValueState(next);
      if (!hasWindow()) {
        return;
      }

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        writeLocalFormDraftState(key, next);
        setHasDraft(true);
      }, debounceMs);
    },
    [debounceMs, key]
  );

  return {
    value: resolvedValue,
    setValue,
    hasDraft: resolvedHasDraft,
    clearDraft,
  };
}
