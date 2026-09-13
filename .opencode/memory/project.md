---
description: Project memory — architecture, decisions, and conventions for the gateway NestJS API.
---

# Project Memory

## Architecture
- **Framework**: NestJS 11 with TypeScript 5 (`strictNullChecks: true`, `noImplicitAny: false`)
- **Inter-service**: RabbitMQ via `@nestjs/microservices` (RMQ transport, request/reply)
- **Auth**: JWT access + refresh tokens via global `APP_GUARD`
- **Validation**: Zod v4 via custom `ZodValidationPipe`
- **API Docs**: `@nestjs/swagger`
- **Runtime**: Bun (dev) / npm (CI) — dual lockfile
- **Test**: Jest 29 (all test commands)

## Key Decisions
- **No database**: Gateway owns no database, ORM, or repository layer
- All data operations forwarded over RabbitMQ RPC via `sendRpc()`
- Global JWT guard via `APP_GUARD` — opt out with `@Public()`
- Zod schemas and DTOs in `src/packages/entities/{domain}/` per domain
- `@packages/*` single path alias (no others)
- Feature = module + controller only (no service/repository)

## Agents
- `dev` — coding agent with full permissions. Follows gateway module pattern: controller + module only. No DB.
- `test` — creates Jest unit tests co-located as `*.spec.ts`, E2E tests in `test/`, reports failures.
- `code-reviewer` — read-only review. Checks types, lint, NestJS patterns, conventions, tests.
- `fixbug` — debug agent. Reproduces errors, traces stack, applies minimal fix, verifies with lint+test.

## Current Features
| Feature | RPC Target | Notable |
|---------|-----------|---------|
| Auth (register, login, refresh, forgot/reset password) | user | JWT access + refresh, OAuth stays in gateway |
| User CRUD | user | Admin user management |
| Class/Schedule/Session/Curriculum/Chapter/Lesson | tutor-service | Education domain |
| Tuition/Exercise/Attendance | tutor-service | Education domain |
| Dashboard/Report/AI-Chat | tutor-service | Education domain |
| Email/Notification/Redis/Upload | third-service | Infra/utility |
| Presence (real-time online/offline) | tutor-service | Socket.io + Redis |
