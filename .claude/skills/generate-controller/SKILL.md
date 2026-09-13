---
name: generate-controller
description: Scaffold the controller layer (src/features/{name}/{name}.controller.ts) as a thin RPC-proxy — ZodValidationPipe, CurrentUser, inline Swagger schemas, one sendRpc call per route, plural route path. Use when asked to create/add a controller, routes, or REST endpoints for a feature in this NestJS tutoring backend.
---

# Generate Controller

Create `src/features/foo/foo.controller.ts` as a **thin RPC-proxy**: every route validates
input then forwards to the owning service via `sendRpc` — no local business logic. See
`src/features/admin/admin.controller.ts`, `src/features/email/email.controller.ts`, or
`src/features/ai-chat/ai-chat.controller.ts` for real, current examples.

## Prerequisites
- DTOs + schemas exist under `@packages/entities/foo` (see `generate-entity`).
- Know which downstream service owns this feature — `USER_SERVICE`, `TUTOR_SERVICE`, or
  `THIRD_SERVICE` (`../rmq-clients/rmq-clients.constants`) — and the exact
  `<feature>.<methodName>` pattern string(s) its `*.rpc.controller.ts` exposes (or agree the
  naming with whoever is adding that responder, if it doesn't exist yet — see the root
  `add-rpc-endpoint` skill for adding both sides together).

## Shape
```ts
import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags, ApiOperation, ApiBody, ApiResponse as SwaggerResponse,
  ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { ZodValidationPipe } from '@packages/pipes';
import { CurrentUser } from '@packages/decorators';
import { sendRpc } from '@packages/helpers';
import { createFooSchema, type CreateFooDto, getFoosQuerySchema, type GetFoosQueryDto } from '@packages/entities/foo';
import { TUTOR_SERVICE } from '../rmq-clients/rmq-clients.constants'; // or USER_SERVICE / THIRD_SERVICE

const CREATE_FOO_BODY_SCHEMA = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', example: 'Example' } },
}; // inline Swagger body schema — see "Swagger" below

@ApiTags('Foos')
@ApiBearerAuth('access-token')
@Controller('foos') // plural route
export class FooController {
  constructor(@Inject(TUTOR_SERVICE) private readonly tutorClient: ClientProxy) {}

  @Post()
  @HttpCode(StatusCodes.CREATED)
  @ApiOperation({ summary: 'Create foo' })
  @ApiBody({ schema: CREATE_FOO_BODY_SCHEMA })
  @SwaggerResponse({ status: 201, description: 'Foo created' })
  create(@Body(new ZodValidationPipe<CreateFooDto>(createFooSchema)) dto: CreateFooDto) {
    return sendRpc(this.tutorClient, 'foo.create', dto);
  }

  @Get()
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'List foos' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @SwaggerResponse({ status: 200, description: 'Foos fetched' })
  list(@Query(new ZodValidationPipe<GetFoosQueryDto>(getFoosQuerySchema)) query: GetFoosQueryDto) {
    return sendRpc(this.tutorClient, 'foo.list', query);
  }

  @Get(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Get foo detail' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Foo detail' })
  get(@Param('id') id: string) {
    return sendRpc(this.tutorClient, 'foo.get', { id });
  }

  @Delete(':id')
  @HttpCode(StatusCodes.OK)
  @ApiOperation({ summary: 'Delete foo' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @SwaggerResponse({ status: 200, description: 'Foo deleted' })
  delete(@Param('id') id: string) {
    return sendRpc(this.tutorClient, 'foo.delete', { id });
  }
}
```

## Rules
- **No service/repository injected — no business logic here.** Every handler body is exactly
  `return sendRpc(this.<name>Client, '<feature>.<methodName>', payload);`. If you find yourself
  wanting an `if`/validation beyond Zod, that check belongs in the owning service.
- **`ClientProxy` injection**: `@Inject(<SERVICE>) private readonly <name>Client: ClientProxy`
  — pick `USER_SERVICE`/`TUTOR_SERVICE`/`THIRD_SERVICE` based on who owns the feature (see
  `../.claude/rules/architecture.md`'s ownership table). No module wiring needed for this —
  `RmqClientsModule` is `@Global()`.
- **Payload**: build the object passed to `sendRpc` from `@CurrentUser()` / `@Param()` / the
  validated Zod DTO — mirror exactly what the owning service's method signature expects (check
  its `*.rpc.controller.ts` if it already exists).
- Get the current user with `@CurrentUser() user` (from `@packages/decorators`) and read
  `user.id` / `user.role` — do NOT use an old `@User` decorator.
- Routes are protected by the global `JwtAuthGuard`. Add `@Public()` (from `@packages/decorators`)
  only for intentionally open endpoints, `@Roles('ADMIN')` + `@UseGuards(RolesGuard)` (both from
  `@packages/guards`/`@packages/decorators`) for admin-only ones — there is no `@Admin()`
  decorator, don't invent one.
- Route names are plural (`@Controller('foos')`); class/file names singular.

## Swagger (inline, not data-file)
Current gateway controllers inline their Swagger body/query schemas as `const` objects at the
top of the controller file (see `admin.controller.ts`) rather than importing from
`src/data/swaggers/data/*` — that data-file convention only survives for the pre-existing
`user` feature (`src/data/swaggers/{data,messages}/user.swagger.ts` / `user.msg.ts`). Follow the
inline pattern for any new controller: a `const FOO_BODY_SCHEMA = { type: 'object', ... }` per
distinct body shape, referenced from `@ApiBody({ schema: FOO_BODY_SCHEMA })`; `@ApiQuery(...)`
for query params individually; `@ApiParam(...)` for path params; `@ApiOperation` +
`@ApiResponse as SwaggerResponse` on every route.
