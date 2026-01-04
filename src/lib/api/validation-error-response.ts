import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import { API_ERROR_CODES } from '@/constants/api-error-codes';

interface ValidationErrorDetail {
  path: (string | number)[];
  message: string;
}

interface ValidationErrorResponse {
  success: false;
  errorCode: string;
  errors: ValidationErrorDetail[];
}

/**
 * Format Zod validation errors into a standardized API response.
 */
export function createValidationErrorResponse(
  zodError: ZodError,
  errorCode: string = API_ERROR_CODES.INVALID_JSON_BODY,
): NextResponse<ValidationErrorResponse> {
  const errors: ValidationErrorDetail[] = zodError.issues.map((issue) => ({
    path: issue.path.map((p) => (typeof p === 'symbol' ? String(p) : p)),
    message: issue.message,
  }));

  return NextResponse.json(
    {
      success: false,
      errorCode,
      errors,
    },
    { status: 400 },
  );
}
