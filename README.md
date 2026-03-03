# nestjs-api-describe

[![CI](https://github.com/gabry-ts/nestjs-api-describe/actions/workflows/ci.yml/badge.svg)](https://github.com/gabry-ts/nestjs-api-describe/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/nestjs-api-describe)](https://www.npmjs.com/package/nestjs-api-describe)

Composite decorators for standardizing OpenAPI documentation and input validation in NestJS APIs.

## Installation

```bash
pnpm add nestjs-api-describe
```

### Peer dependencies

```bash
pnpm add @nestjs/common @nestjs/swagger class-validator class-transformer reflect-metadata
```

## Quick Start

### ControllerDescribe

A composite method decorator that combines HTTP method, Swagger documentation, auth metadata, and error responses in a single declaration.

```typescript
import { Controller } from '@nestjs/common';
import { ControllerDescribe } from 'nestjs-api-describe';

@Controller('users')
export class UsersController {
  @ControllerDescribe({
    method: 'GET',
    path: ':id',
    summary: 'Get user by ID',
    description: 'Returns a single user by their unique identifier',
    responseType: UserResponseDto,
    errors: [404],
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ControllerDescribe({
    method: 'POST',
    summary: 'Register a new user',
    responseType: UserResponseDto,
    isPublic: true,
    errors: [409],
  })
  register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

#### Options

| Option         | Type             | Required | Default | Description                              |
| -------------- | ---------------- | -------- | ------- | ---------------------------------------- |
| `method`       | `HttpMethod`     | yes      |         | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`  |
| `path`         | `string`         | no       | `''`    | Route path                               |
| `summary`      | `string`         | yes      |         | Swagger operation summary                |
| `description`  | `string`         | no       |         | Swagger operation description            |
| `responseType` | `Type<unknown>`  | yes      |         | Response DTO class for Swagger           |
| `isPublic`     | `boolean`        | no       | `false` | If true, skips auth decorators           |
| `errors`       | `number[]`       | no       | `[]`    | Additional HTTP error status codes       |

Non-public routes automatically include `401` and `403` error responses and `@ApiBearerAuth()`.

### DtoDescribe

A composite property decorator that combines Swagger `@ApiProperty`, class-validator validators, and class-transformer transforms.

```typescript
import { DtoDescribe } from 'nestjs-api-describe';

export class CreateUserDto {
  @DtoDescribe({
    description: 'User email address',
    type: 'email',
    example: 'user@example.com',
  })
  email!: string;

  @DtoDescribe({
    description: 'Display name',
    type: 'string',
    minLength: 2,
    maxLength: 50,
  })
  name!: string;

  @DtoDescribe({
    description: 'User age',
    type: 'int',
    min: 0,
    max: 150,
  })
  age!: number;

  @DtoDescribe({
    description: 'User preferences',
    type: 'object',
    required: false,
  })
  preferences?: Record<string, unknown>;
}
```

#### Options

| Option       | Type             | Required | Default | Description                        |
| ------------ | ---------------- | -------- | ------- | ---------------------------------- |
| `description`| `string`         | yes      |         | Swagger property description       |
| `type`       | `DtoType`        | yes      |         | Field type (see supported types)   |
| `example`    | `unknown`        | no       |         | Swagger example value              |
| `required`   | `boolean`        | no       | `true`  | Adds `IsNotEmpty` or `IsOptional`  |
| `enum`       | `object`         | no       |         | Enum object (for `type: 'enum'`)   |
| `isArray`    | `boolean`        | no       |         | Marks as array in Swagger          |
| `nested`     | `Type<unknown>`  | no       |         | Nested DTO class                   |
| `minLength`  | `number`         | no       |         | Min string length                  |
| `maxLength`  | `number`         | no       |         | Max string length                  |
| `min`        | `number`         | no       |         | Min numeric value                  |
| `max`        | `number`         | no       |         | Max numeric value                  |
| `pattern`    | `RegExp`         | no       |         | Regex pattern validation           |

#### Supported types

| Type         | Validators applied                        |
| ------------ | ----------------------------------------- |
| `string`     | `IsString`, `Length`, `Transform(trim)`   |
| `number`     | `IsNumber`, `Min`, `Max`                  |
| `int`        | `IsInt`, `Min`, `Max`                     |
| `boolean`    | `IsBoolean`                               |
| `uuid`       | `IsUUID`                                  |
| `email`      | `IsEmail`, `Transform(lowercase + trim)`  |
| `date`       | `IsDate`, `Type(() => Date)`              |
| `dateString` | `IsDateString`                            |
| `url`        | `IsUrl`                                   |
| `enum`       | `IsEnum`                                  |
| `nested`     | `ValidateNested`, `Type(() => nested)`    |
| `array`      | `IsArray`, `ValidateNested` (if nested)   |
| `object`     | `IsObject`                                |

### ApiDescribeModule

Optional NestJS dynamic module for global configuration.

```typescript
import { Module } from '@nestjs/common';
import { ApiDescribeModule } from 'nestjs-api-describe';

@Module({
  imports: [
    ApiDescribeModule.forRoot({
      defaultErrors: [400, 500],
      customErrorDescriptions: {
        400: 'Validation failed',
        500: 'Something went wrong',
      },
    }),
  ],
})
export class AppModule {}
```

## License

MIT
