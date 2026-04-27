// ---------------------------------------------------------------------------
// extractErrorMessage
// ---------------------------------------------------------------------------
// TanStack Query v5 types onError's `err` parameter as `Error` in TypeScript,
// but the *runtime* value is whatever was thrown — in our case a plain ApiError
// object: { message: string, status: number, errors: FieldError[] }.
//
// This helper safely extracts a human-readable message from any thrown value
// so that none of our hooks need to cast or assert.
// ---------------------------------------------------------------------------

import type { ApiError } from '@/types/api.types';

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err == null) return fallback;

  // Our Axios interceptor throws a plain ApiError object (not an Error instance)
  if (
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as ApiError).message === 'string' &&
    (err as ApiError).message.length > 0
  ) {
    return (err as ApiError).message;
  }

  // Standard Error instance (e.g. network timeout, Axios without interceptor)
  if (err instanceof Error && err.message) {
    return err.message;
  }

  // String thrown directly (shouldn't happen, but guard anyway)
  if (typeof err === 'string' && err.length > 0) {
    return err;
  }

  return fallback;
}