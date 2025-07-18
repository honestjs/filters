# @honestjs/prisma-exception-filter

An exception filter for `honestjs` that handles errors thrown by `Prisma Client`. It catches various `Prisma` exceptions
and formats them into standardized, user-friendly JSON error responses.

## Features

- Integrates with `honestjs` and `hono` to handle database-related errors.
- Catches specific `Prisma` errors, such as validation errors, connection errors, and known request errors.
- Maps different Prisma error codes (like `P2002` for unique constraint violations) to appropriate HTTP status codes and
  messages.
- Provides clear, structured error responses for easier debugging and client-side handling.

## Installation

```bash
npm install @honestjs/prisma-exception-filter @prisma/client
# or
yarn add @honestjs/prisma-exception-filter @prisma/client
# or
pnpm add @honestjs/prisma-exception-filter @prisma/client
```

## Usage

Register the `PrismaExceptionFilter` in your `honestjs` application. It's best to place it before your application's
main logic but after other specific filters like validation.

```typescript
import { Application } from 'honestjs'
import { PrismaClient } from '@prisma/client'
import { PrismaExceptionFilter } from '@honestjs/prisma-exception-filter'

// Method 1: Register filter globally in application configuration
const { hono } = await Application.create(AppModule, {
	components: {
		filters: [new PrismaExceptionFilter()]
	}
})

// Method 2: Use filter on specific controller
@Controller('/users')
@UseFilters(PrismaExceptionFilter)
class UsersController {
	constructor(private readonly prisma: PrismaClient) {}

	@Post()
	async createUser(@Body() body: CreateUserDto): Promise<User> {
		// The PrismaExceptionFilter will catch any Prisma errors automatically
		return await this.prisma.user.create({
			data: {
				email: body.email, // This could fail if the email is already taken
				name: body.name
			}
		})
	}
}
```

If a unique constraint violation occurs (Prisma error code `P2002`), the filter will generate a response like this:

```json
{
	"error": {
		"message": "A record with this value already exists",
		"code": "UNIQUE_CONSTRAINT_VIOLATION"
	}
}
```
