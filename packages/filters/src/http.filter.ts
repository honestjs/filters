import { createErrorResponse, type IFilter } from 'honestjs'
import type { Context } from 'hono'
import { HttpException } from 'http-essentials'

export class HttpExceptionFilter implements IFilter {
	catch(exception: any, context: Context): Response | undefined {
		if (exception instanceof HttpException) {
			return context.json(createErrorResponse(exception, context))
		}
	}
}
