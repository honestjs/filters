import { createErrorResponse, type IFilter } from 'honestjs'
import type { Context } from 'hono'
import { ZodError } from 'zod'

/**
 * A filter that handles Zod validation errors and converts them into structured HTTP responses.
 *
 * This filter catches ZodError instances and transforms them into user-friendly error responses
 * with detailed field-level validation information. It provides structured error details including
 * field names, validation messages, and error codes for better client-side error handling.
 */
export class ZodValidationFilter implements IFilter {
	/**
	 * Catches and processes Zod validation errors.
	 *
	 * This method identifies ZodError instances by their structure (presence of `issues` array
	 * and `name` property) and transforms them into structured error responses. It extracts
	 * field-level validation information and provides detailed error context.
	 *
	 * @param exception - The exception that was thrown (checked for ZodError structure)
	 * @param context - The Hono context object for the current request
	 * @returns A JSON response with structured validation errors, or undefined if not a ZodError
	 */
	catch(exception: any, context: Context): Response | undefined {
		// Check if it's a ZodError by its structure
		if (exception instanceof ZodError) {
			// Create a custom error with validation details
			const validationError = new Error('Validation failed')
			;(validationError as any).code = 'VALIDATION_ERROR'

			const errors = exception.issues.map((err: any) => ({
				field: err.path.join('.'),
				message: err.message,
				code: err.code,
				...(err.code === 'invalid_type' && {
					expected: err.expected,
					received: err.received
				})
			}))
			;(validationError as any).errors = errors

			return context.json(
				createErrorResponse(validationError, context, {
					status: 400,
					title: 'Validation failed',
					code: 'VALIDATION_ERROR',
					additionalDetails: { errors }
				})
			)
		}

		return undefined
	}
}
