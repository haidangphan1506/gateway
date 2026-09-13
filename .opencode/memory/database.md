---
description: Gateway has no database — data operations are forwarded over RabbitMQ RPC.
---

# Database

## Gateway has NO database

Gateway owns no database, ORM, or repository layer. All data operations are forwarded over
**RabbitMQ RPC** to the owning service:

- `user` service: auth, user, admin, student domains
- `tutor-service`: class, schedule, session, curriculum, chapter, lesson, tuition, exercise, attendance, dashboard, report, ai-chat domains
- `third-service`: email, notification, redis, upload domains

## Why no database?

After the `[[gateway-rmq-refactor]]`, gateway became a thin HTTP-to-RabbitMQ proxy. It validates
requests (Zod, guards) then forwards them via `sendRpc(...)` to the owning service. There is no
reason for gateway to persist data locally.

## Entity / DTO pattern (unchanged)

Entities still live in `src/packages/entities/{domain}/` for request validation via `ZodValidationPipe`,
even though there's no database behind them. These are Zod schemas, not Drizzle/TypeORM schemas.
