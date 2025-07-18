# @honestjs/zod-exception-filter

A validation filter for `honestjs` that integrates with `zod` to handle validation errors. It automatically captures
`ZodError` exceptions and transforms them into a structured, client-friendly JSON error response.

## Features

- Seamlessly integrates with `honestjs` and `hono`.
- Catches `ZodError` and formats it into a standardized error message.
- Provides detailed validation issues in the response body.
- Configurable HTTP status code for error responses (defaults to 400).

## Installation

```bash
npm install @honestjs/zod-exception-filter zod
# or
yarn add @honestjs/zod-exception-filter zod
# or
pnpm add @honestjs/zod-exception-filter zod
```

## Usage

To use the filter, simply add it to your `honestjs` application's `use` method. It should typically be one of the first
filters you register.

```typescript
import { Application } from 'honestjs'
import { ZodValidationFilter } from '@honestjs/zod-exception-filter'
import { z } from 'zod'

// Method 1: Register filter globally in application configuration
const { hono } = await Application.create(AppModule, {
	components: {
		filters: [new ZodValidationFilter()]
	}
})

// Method 2: Use filter on specific controller
@Controller('/users')
@UseFilters(ZodValidationFilter)
class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async createUser(@Body() body: CreateUserDto): Promise<User> {
		// Validate with Zod - this will throw a ZodError if validation fails
		const userSchema = z.object({
			name: z.string().min(3),
			email: z.string().email()
		})

		const validatedData = userSchema.parse(body)
		return await this.usersService.create(validatedData)
	}
}
```

When the validation fails, the filter will catch the `ZodError` and produce a response similar to this:

```json
{
	"error": {
		"message": "Validation failed",
		"code": "VALIDATION_ERROR",
		"errors": [
			{
				"path": ["name"],
				"message": "String must contain at least 3 character(s)"
			}
		]
	}
}
```
