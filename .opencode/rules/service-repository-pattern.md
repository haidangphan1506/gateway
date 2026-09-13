# Service / Repository Pattern

## Gateway has no service or repository layer

Gateway is a thin HTTP edge with no service or repository layer and no database for any feature.
Every request is validated (Zod, guards) then forwarded over **RabbitMQ RPC** to the owning service.

## Request flow

```
Controller → sendRpc() → RabbitMQ → owning service's *.rpc.controller.ts → its service → its DB
```

- Controller handles HTTP (routes, validation, decorators)
- `sendRpc()` forwards the request to the owning service over RabbitMQ
- The owning service (`user`, `tutor-service`, or `third-service`) handles business logic and DB access

## Do NOT add service/repository layers here

If you're about to add a `*.service.ts` or `*.repository.ts` in gateway, stop. The logic belongs in
the owning service's repo behind a new `@MessagePattern`, and gateway only needs a new `sendRpc(...)` call site.

## Message pattern naming

Gateway's pattern strings must match the owning service's `@MessagePattern(...)` strings exactly.
They are the contract between the two repos and nothing enforces them at compile time across repos.

Example: `auth.login`, `user.updateUserByAdmin`, `admin.createTutor`, `student.findById`
