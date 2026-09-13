# Backend Memory — gateway (HTTP edge, no DB)

## Project Structure

```
gateway/
├── src/
│   ├── main.ts                    # Bootstrap: CORS, interceptors, filters, listen (port 8888)
│   ├── app.module.ts              # Root module (imports all feature modules)
│   ├── app.controller.ts          # Health-check controller (+ RabbitMQ pub/sub demo route)
│   ├── app.service.ts             # Health-check service
│   ├── features/                  # Every feature is a thin proxy controller (no service/repository,
│   │   │                          # no DB) except auth's OAuth routes; each forwards via `sendRpc`
│   │   │                          # to whichever service owns it:
│   │   ├── auth/                  # → `user` (OAuth Google/Facebook stays here, needs live Response)
│   │   ├── user/ admin/ student/   # → `user`
│   │   ├── class/ schedule/ session/ curriculum/ chapter/ lesson/ tuition/ exercise/
│   │   │   attendance/ dashboard/ report/ ai-chat/   # → `tutor-service`
│   │   ├── email/ notification/ redis/ upload/   # → `third-service`
│   │   ├── rmq-clients/           # ClientsModule: USER_SERVICE/TUTOR_SERVICE/THIRD_SERVICE RPC
│   │   │                          # clients — all three have responders wired up
│   │   └── rabbitmq/              # Fire-and-forget pub/sub (amqplib) — separate from rmq-clients
│   └── packages/                  # Shared utilities
│       ├── configs/               # JWT sign config
│       ├── decorators/            # @ApiResponse, @Public, @Roles, @CurrentUser
│       ├── entities/              # DTOs + Zod schemas (kept for request validation even with no DB)
│       ├── filters/               # HttpExceptionFilter (global)
│       ├── guards/                # JwtAuthGuard (RPC existence check, no local DB), RolesGuard
│       ├── helpers/                # hashing, sendRpc (rmq.helper — the only sanctioned RPC call path)
│       ├── interceptor/           # ResponseInterceptor, ErrorInterceptor, LoggerInterceptor
│       ├── interfaces/            # ApiResponseInterface, UserInterface
│       ├── pipes/                 # ZodValidationPipe
│       └── strategy/              # Google/Facebook Passport strategies
└── test/                          # Jest + Supertest tests
```

**No `src/database/`, no Drizzle, no `drizzle/` migrations, no `scripts/` seeds** — those only
exist in `user`/`tutor-service`/`third-service`. Gateway is a thin RPC-forwarding edge; see
`CLAUDE.md` and `.claude/rules/nestjs-feature-pattern.md` for the full "why".

## Feature Module Pattern (gateway-specific)

```
features/{name}/
├── {name}.module.ts     # Module definition (controller only)
└── {name}.controller.ts # return sendRpc(this.<name>Client, '<feature>.<methodName>', payload)
```

No `{name}.service.ts` / `{name}.repository.ts` for any feature — that logic lives in the
owning service's `*.service.ts` behind a `@MessagePattern`. All three downstream clients
(`USER_SERVICE`/`TUTOR_SERVICE`/`THIRD_SERVICE`) are live and have responders wired up — see
`[[gateway-rmq-refactor]]` memory and `../.claude/rules/architecture.md` for the RPC contract.

## Request/Response Flow

1. Request → Global `JwtAuthGuard` (unless `@Public()`) — verifies JWT locally, then confirms
   the user exists via `sendRpc(userClient, 'user.getUserByField', ...)` (no local DB)
2. Controller validates body via `ZodValidationPipe`
3. Controller → `sendRpc(this.xClient, '<pattern>', payload)` → RabbitMQ → owning service
4. `ResponseInterceptor` wraps the RPC result the same as a local return value
5. Errors: `sendRpc` turns the responder's `RpcErrorPayload` into an `HttpException`, then the
   normal `ErrorInterceptor` + `HttpExceptionFilter` handle it like any local exception

## Authentication

- **Global guard**: `JwtAuthGuard` via `APP_GUARD` — RPC-based existence check, no local DB
- **Public routes**: `@Public()`. **Admin routes**: `@Roles('ADMIN')` + `RolesGuard`
  (there is no `@Admin()` decorator — don't invent one)
- **OAuth**: Google/Facebook Passport guards + redirect stay in gateway (need a live
  `Response`); only the final token-issuance call goes over RPC to `user`
- **Token flow**: issued entirely by `user` — access (3h default) + refresh (7d default)

## Key Files

- `src/main.ts` — Bootstrap with CORS, interceptors, filters
- `src/app.module.ts` — Root module, all imports + global JWT guard
- `src/features/rmq-clients/rmq-clients.module.ts` — RPC client registration
- `src/packages/helpers/rmq.helper.ts` — `sendRpc`, the only sanctioned downstream call path
- `src/packages/guards/jwt-auth.guard.ts` — Global JWT guard (RPC existence check)
- `src/packages/interceptor/response.interceptor.ts` — Standard response wrapper
- `src/packages/pipes/zod-validation.pipe.ts` — Zod validation pipe

## Commands

```bash
bun start:dev / start:debug / build / start:prod
bun run lint / lint:check / format / format:check
bun run test / test:watch / test:cov / test:e2e / test:debug   # Jest only — no Bun test runner
bun compose:up / compose:down            # RabbitMQ only (Postgres/Redis are for the other 3 services)
bun podman:up / podman:down / podman:logs
```

No `db:*` scripts exist here — gateway has nothing to migrate/seed.

## Environment Variables

| Variable                      | Description                    |
| ----------------------------- | ------------------------------- |
| `NODE_ENV` / `PORT`           | Standard (port default `8888`)  |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Must match `user`'s secrets |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` / `GOOGLE_OAUTH_REDIRECT_URL` | Google OAuth (lives in gateway) |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` / `BACKEND_URL` | Facebook OAuth (lives in gateway) |
| `RABBITMQ_URL` / `RABBITMQ_EXCHANGE` | RabbitMQ connection + pub/sub exchange |
| `USER_QUEUE` / `TUTOR_QUEUE` / `THIRD_QUEUE` | Override each downstream RMQ client's queue name |

No `POSTGRES_*`/`DATABASE_URL`/`REDIS_*`/mail vars — gateway doesn't read them.

## Code Conventions

- `@packages/*` path alias; Prettier single quotes/trailing commas/100-width/semicolons
  (auto-applied by a PostToolUse hook); ESLint + typescript-eslint.
- Every RPC call through `sendRpc` — never `client.send(...)` directly.

## Testing

- **One runner: Jest** (+ Supertest). No Bun-native unit test runner — `bun run test` just runs
  the `test` npm script, which is Jest.
- Mock the injected `ClientProxy` and assert on the `sendRpc` pattern/payload rather than
  mocking a repository (there isn't one).

## Available Skills

`generate-controller`, `generate-db-table`, `generate-entity`, `generate-feature`,
`generate-module`, `generate-repository`, `generate-service` (gateway-adapted: these generate
the thin proxy shape, not the full service/repository layering the other 3 services use) —
plus `add-rpc-endpoint` at `../.claude/skills/` for the cross-repo workflow.

## Available Agents

`dev.md`, `review.md`, `security.md`, `test.md` — see `.claude/agents/` (rewritten to match the
no-DB, no-service/repository RPC-proxy architecture; they used to describe Drizzle/service/repo
layering copied from the other services — fixed).

## Rules

`conventions.md`, `nestjs-feature-pattern.md` (gateway-specific — no `database.md`, gateway has
no DB) plus `../.claude/rules/architecture.md` and `shared-conventions.md` (cross-service).

## Selective File Reading Guideline (IMPORTANT)

**Do NOT read entire source code.** Only read files necessary for the task — see `CLAUDE.md`'s
"IMPORTANT: Selective File Reading" section for the full breakdown.
