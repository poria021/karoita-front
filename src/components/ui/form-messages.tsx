import React from "react";

export function FormSuccess({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-kv-control border border-kv-success-border bg-kv-success-soft px-3 py-2 text-sm text-kv-success-soft-fg">
      {message}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-kv-control border border-kv-danger-border bg-kv-danger-soft px-3 py-2 text-sm text-kv-danger-soft-fg">
      {message}
    </div>
  );
}
