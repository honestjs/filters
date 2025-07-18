# @honestjs/filters

A collection of lightweight exception filters for the `honestjs` framework. This package provides essential filters for
handling common HTTP exceptions and errors in your HonestJS applications.

## Features

- **HttpExceptionFilter**: Handles HTTP exceptions from the `http-essentials` library
- **Zero dependencies**: Minimal footprint with only essential dependencies
- **TypeScript support**: Full TypeScript support with proper type definitions
- **Framework integration**: Seamlessly integrates with `honestjs` and `hono`

## Installation

```bash
npm install @honestjs/filters http-essentials
# or
yarn add @honestjs/filters http-essentials
# or
pnpm add @honestjs/filters http-essentials
```

## Usage

### HttpExceptionFilter

The `HttpExceptionFilter` catches HTTP exceptions thrown by the `http-essentials` library and converts them into
standardized JSON error responses.

```typescript
import { Application } from 'honestjs'
import { HttpExceptionFilter } from '@honestjs/filters'
import { BadRequestException, NotFoundException } from 'http-essentials'

// Method 1: Register filter globally in application configuration
const { hono } = await Application.create(AppModule, {
	components: {
		filters: [new HttpExceptionFilter()]
	}
})

// Method 2: Use filter on specific controller
@Controller('/users')
@UseFilters(HttpExceptionFilter)
class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('/:id')
	async getUser(@Param('id') id: string): Promise<User> {
		if (!id) {
			throw new BadRequestException('User ID is required')
		}

		const user = await this.usersService.findById(id)
		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user
	}
}
```

When an HTTP exception is thrown, the filter will automatically catch it and return a structured error response:

```json
{
	"error": {
		"message": "User not found",
		"status": 404,
		"timestamp": "2025-01-15T10:30:00.000Z",
		"path": "/users/123"
	}
}
```

### Available HTTP Exceptions

The filter works with all exceptions from the `http-essentials` library, including:

- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `MethodNotAllowedException` (405)
- `ConflictException` (409)
- `UnprocessableEntityException` (422)
- `InternalServerErrorException` (500)
- `NotImplementedException` (501)
- `BadGatewayException` (502)
- `ServiceUnavailableException` (503)

## API Reference

### HttpExceptionFilter

A filter that catches HTTP exceptions and converts them to JSON responses.

#### Methods

##### `catch(exception: any, context: Context): Response | undefined`

Catches HTTP exceptions and returns a formatted JSON response.

**Parameters:**

- `exception`: The exception that was thrown
- `context`: The Hono context object

**Returns:**

- A JSON response with error details if the exception is an HTTP exception
- `undefined` if the exception is not an HTTP exception

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
