#!/bin/sh
set -e

# Darkube معمولاً NEXT_PUBLIC_API_URL را موقع run می‌گذارد نه build.
# Next آن را در باندل اینلاین کرده؛ Route Handler از BACKEND_INTERNAL_URL می‌خواند.
if [ -z "${BACKEND_INTERNAL_URL:-}" ]; then
  if [ -n "${NEST_API_URL:-}" ]; then
    export BACKEND_INTERNAL_URL="$NEST_API_URL"
  elif [ -n "${NEXT_PUBLIC_API_URL:-}" ]; then
    export BACKEND_INTERNAL_URL="$NEXT_PUBLIC_API_URL"
  fi
fi

exec "$@"
