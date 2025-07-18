import {
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError
} from '@prisma/client/runtime/library'
import { createErrorResponse, type IFilter } from 'honestjs'
import type { Context } from 'hono'

/**
 * A filter that handles Prisma database errors and converts them into structured HTTP responses.
 *
 * This filter catches various types of Prisma errors including known request errors, validation errors,
 * and initialization errors. It maps specific Prisma error codes to appropriate HTTP status codes and
 * provides meaningful error messages for better client-side error handling.
 */
export class PrismaExceptionFilter implements IFilter {
	/**
	 * Catches and processes Prisma database errors.
	 *
	 * This method identifies different types of Prisma errors by their structure and properties,
	 * then maps them to appropriate HTTP responses with meaningful error messages. It handles
	 * known request errors, validation errors, and initialization errors.
	 *
	 * @param exception - The exception that was thrown (checked for various Prisma error types)
	 * @param context - The Hono context object for the current request
	 * @returns A JSON response with structured error information, or undefined if not a Prisma error
	 */
	catch(exception: any, context: Context): Response | undefined {
		// Handle PrismaClientKnownRequestError
		if (exception instanceof PrismaClientKnownRequestError) {
			const errorCode = exception.code
			let message = 'Database operation failed'
			let code = 'DATABASE_ERROR'
			let statusCode: 409 | 404 | 400 | 500 = 500

			// Handle specific Prisma error codes
			switch (errorCode) {
				case 'P2002': // Unique constraint violation
					message = 'Resource already exists'
					code = 'DUPLICATE_ENTRY'
					statusCode = 409
					break
				case 'P2025': // Record not found
					message = 'Resource not found'
					code = 'NOT_FOUND'
					statusCode = 404
					break
				case 'P2003': // Foreign key constraint violation
					message = 'Invalid reference'
					code = 'FOREIGN_KEY_CONSTRAINT'
					statusCode = 400
					break
				case 'P2004': // Database constraint violation
					message = 'Database constraint violation'
					code = 'CONSTRAINT_VIOLATION'
					statusCode = 400
					break
				case 'P2014': // Required relation violation
					message = 'Required relation missing'
					code = 'RELATION_VIOLATION'
					statusCode = 400
					break
				case 'P2021': // Table does not exist
					message = 'Database schema error'
					code = 'TABLE_NOT_FOUND'
					statusCode = 500
					break
				case 'P2022': // Column does not exist
					message = 'Database schema error'
					code = 'COLUMN_NOT_FOUND'
					statusCode = 500
					break
				case 'P2034':
					message = 'Transaction failed, please retry'
					code = 'TRANSACTION_CONFLICT'
					statusCode = 409
					break
				default:
					message = 'Database operation failed'
					code = errorCode
					statusCode = 500
			}

			return context.json(
				createErrorResponse(exception, context, {
					status: statusCode,
					title: message,
					code: code
				})
			)
		}

		// Handle PrismaClientValidationError
		if (exception instanceof PrismaClientValidationError) {
			return context.json(
				createErrorResponse(exception, context, {
					status: 400,
					title: 'Invalid data provided',
					code: 'VALIDATION_ERROR'
				})
			)
		}

		// Handle PrismaClientInitializationError
		if (exception instanceof PrismaClientInitializationError) {
			return context.json(
				createErrorResponse(exception, context, {
					status: 500,
					title: 'Database connection failed',
					code: 'DATABASE_CONNECTION_ERROR'
				})
			)
		}

		// Handle PrismaClientUnknownRequestError
		if (exception instanceof PrismaClientUnknownRequestError) {
			return context.json(
				createErrorResponse(exception, context, {
					status: 500,
					title: 'An unknown database error occurred',
					code: 'UNKNOWN_DATABASE_ERROR'
				})
			)
		}

		// Handle PrismaClientRustPanicError
		if (exception instanceof PrismaClientRustPanicError) {
			return context.json(
				createErrorResponse(exception, context, {
					status: 500,
					title: 'Internal server error. Please try again later.',
					code: 'PRISMA_PANIC_ERROR'
				})
			)
		}

		return undefined
	}
}
