import { createErrorResponse, type IFilter } from 'honestjs'
import type { Context } from 'hono'
import { HttpException } from 'http-essentials'

export class HttpExceptionFilter implements IFilter {
	catch(exception: any, context: Context): Response | undefined {
		if (exception instanceof HttpException) {
			const { response, status } = createErrorResponse(exception, context)
			return context.json(response, status)
		}
	}
}
