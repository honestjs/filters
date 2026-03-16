import { describe, expect, it } from 'vitest'
import { Hono } from 'hono'
import { HttpException } from 'http-essentials'
import { HttpExceptionFilter } from './http.filter'

async function runFilterOnRoute(filter: HttpExceptionFilter, exception: any) {
	let filterResult: Response | undefined
	const app = new Hono()

	app.get('/test', (c) => {
		filterResult = filter.catch(exception, c)
		return c.text('ok')
	})

	await app.request('/test')
	return filterResult
}

describe('HttpExceptionFilter', () => {
	it('catches HttpException and returns structured response', async () => {
		const filter = new HttpExceptionFilter()
		const exception = new HttpException('Bad Request', 400)

		const result = await runFilterOnRoute(filter, exception)
		expect(result).toBeDefined()

		const body = await result!.json()
		expect(body.status).toBe(400)
		expect(body.message).toBe('Bad Request')
		expect(body.path).toBe('/test')
		expect(body.timestamp).toBeDefined()
	})

	it('ignores non-HttpException errors', async () => {
		const filter = new HttpExceptionFilter()
		const result = await runFilterOnRoute(filter, new Error('generic'))
		expect(result).toBeUndefined()
	})

	it('ignores plain objects', async () => {
		const filter = new HttpExceptionFilter()
		const result = await runFilterOnRoute(filter, { message: 'not an error' })
		expect(result).toBeUndefined()
	})
})
