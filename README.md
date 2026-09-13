# Gateway API

HTTP gateway for a tutoring-platform backend built with **NestJS 11**, **RabbitMQ**, and **JWT authentication**.

Gateway owns no database and no business logic. It validates requests (Zod, guards) then forwards them over **RabbitMQ** to the owning service: `user` (auth/user/admin/student), `tutor-service` (education domain), or `third-service` (email/notification/upload).

## Quick Start

```bash
# 1. Start infrastructure (RabbitMQ)
bun run compose:up

# 2. Copy env and edit secrets
cp .env.example .env
# Required: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (UUID v4)

# 3. Install dependencies
npm install

# 4. Start dev server (--watch, port :8080)
bun run start:dev
```

## Project Structure

```
src/
├── main.ts                          # Entry point, Swagger setup
├── app.module.ts                    # Root module (global guard, all feature imports)
├── app.controller.ts                # Health check
├── app.service.ts
├── features/                        # Feature modules (thin proxy controllers only)
│   ├── auth/                        # → user (RPC), OAuth Passport strategies stay here
│   ├── user/                        # → user (RPC)
│   ├── admin/                       # → user (RPC)
│   ├── student/                     # → user (RPC)
│   ├── class/                       # → tutor-service (RPC)
│   ├── schedule/                    # → tutor-service (RPC)
│   ├── session/                     # → tutor-service (RPC)
│   ├── curriculum/                  # → tutor-service (RPC)
│   ├── chapter/                     # → tutor-service (RPC)
│   ├── lesson/                      # → tutor-service (RPC)
│   ├── tuition/                     # → tutor-service (RPC)
│   ├── exercise/                    # → tutor-service (RPC)
│   ├── attendance/                  # → tutor-service (RPC)
│   ├── dashboard/                   # → tutor-service (RPC)
│   ├── report/                      # → tutor-service (RPC)
│   ├── ai-chat/                     # → tutor-service (RPC)
│   ├── email/                       # → third-service (RPC)
│   ├── notification/                # → third-service (RPC)
│   ├── redis/                       # → third-service (RPC)
│   ├── upload/                      # → third-service (RPC)
│   ├── rmq-clients/                 # ClientsModule registration (RMQ clients)
│   └── rabbitmq/                    # Hand-rolled pub/sub (fire-and-forget)
├── packages/                        # Shared utilities
│   ├── entities/                    # Zod schemas + DTO types per domain
│   ├── decorators/                  # @Public(), @CurrentUser(), @ApiResponse()
│   ├── guards/                      # JwtAuthGuard, AdminRoleGuard
│   ├── interceptors/                # Response/Error/Logger interceptors
│   ├── filters/                     # HttpExceptionFilter
│   ├── pipes/                       # ZodValidationPipe
│   ├── strategy/                    # JWT + Google OAuth strategies
│   ├── helpers/                     # Hashing, JWT, sendRpc
│   └── interfaces/                  # TypeScript interfaces
└── data/
    └── constants/                   # Error/success messages
```

## Available Commands

| Command | Description |
|---|---|
| `npm run start:dev` | Dev server on :8080 with watch |
| `npm run build` | Production build |
| `npm run start:prod` | Run production build |
| `npm run lint` | ESLint with --fix |
| `npm run lint:check` | ESLint check only |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check |
| `npm test` | Jest unit tests |
| `npm run test:cov` | Jest with coverage |
| `npm run test:e2e` | Jest e2e tests |
| `bun run compose:up` | Docker Compose up (RabbitMQ) |
| `bun run compose:down` | Docker Compose down |

> **Note**: Tests use **Jest** (`bun run test`) for unit tests and **Jest** for e2e. Bun test is not used.

## API Documentation (Swagger)

Once the server is running, visit:

- **Swagger UI**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
- **OpenAPI JSON**: [http://localhost:8080/api-docs-json](http://localhost:8080/api-docs-json)

### Authentication

All endpoints require a **Bearer JWT token** in the `Authorization` header unless marked with `@Public()`.

```http
Authorization: Bearer <access_token>
```

**Public endpoints** (no auth required):
- `POST /auth/login`
- `POST /auth/login/user-code`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `GET /auth/google`
- `GET /auth/google/callback`

### Standard Response Format

**Success** (`ResponseInterceptor`):
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2026-06-25T00:00:00.000Z",
  "method": "GET",
  "path": "/users"
}
```

**Error** (`HttpExceptionFilter`):
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email", "code": "invalid_string" }],
  "path": "/auth/login",
  "trace": "...",
  "timestamp": "2026-06-25T00:00:00.000Z"
}
```

## API Endpoints

### Auth (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Bearer | Register new user |
| POST | `/auth/login` | Public | Login with email/password |
| POST | `/auth/login/user-code` | Public | Login with user code |
| POST | `/auth/refresh` | Public | Refresh tokens |
| POST | `/auth/forgot-password` | Public | Request password reset |
| POST | `/auth/reset-password` | Bearer | Reset password |
| GET | `/auth/google` | Public | Google OAuth redirect |
| GET | `/auth/google/callback` | Public | Google OAuth callback |

### Users (`/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users` | Bearer | List users (paginated) |
| GET | `/users/detail-user` | Bearer | Get current user detail |
| GET | `/users/get-by-field` | Bearer | Lookup user by field/value |
| POST | `/users` | Bearer | Create user (admin) |
| PUT | `/users` | Bearer | Update current user |
| PUT | `/users/:id` | Admin | Update any user |
| PUT | `/users/:id/status` | Admin | Toggle user status |
| DELETE | `/users/:id` | Admin | Delete user |

## Key Architecture Decisions

- **No database**: Gateway owns no database, ORM, or repository layer
- **Validation**: Zod v4 schemas in `src/packages/entities/{domain}/` with `ZodValidationPipe`
- **Auth**: Global `JwtAuthGuard` with `@Public()` bypass; separate access/refresh tokens
- **Response**: Global interceptor enforces `{ statusCode, message, data, timestamp, method, path }`
- **Config**: Environment-based via `@nestjs/config`, validated at startup
- **RPC**: All requests forwarded over RabbitMQ via `sendRpc()` to the owning service

## Environment Variables

See `.env.example` for all options. Key variables:

| Variable | Description |
|---|---|
| `PORT` | API server port (default: 8080) |
| `JWT_ACCESS_SECRET` | JWT signing secret for access tokens (UUID) |
| `JWT_REFRESH_SECRET` | JWT signing secret for refresh tokens (UUID) |
| `JWT_ACCESS_EXPIRES_SECONDS` | Access token TTL (default: 604800 = 7d) |
| `JWT_REFRESH_EXPIRES_SECONDS` | Refresh token TTL (default: 604800 = 7d) |
| `RABBITMQ_URL` | RabbitMQ connection URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `GOOGLE_OAUTH_REDIRECT_URL` | Frontend redirect after OAuth |
| `PASSWORD_RESET_URL_BASE` | Frontend reset password URL |

Gateway no longer reads any `POSTGRES_*` / `DATABASE_URL` / `REDIS_*` / mail vars — those belong to the services that actually use them.

## Infrastructure

```bash
# Start services
bun run compose:up          # Docker Compose
bun run podman:up           # Podman Compose

# Stop services
bun run compose:down

# View logs
podman compose logs -f rabbitmq
```

| Service | Host Port | Image |
|---------|-----------|-------|
| RabbitMQ | 5672 | rabbitmq:3-management-alpine |
