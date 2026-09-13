---
description: Build a new RPC endpoint (controller → module → entities → tests)
agent: feature-builder
---

Build the requested feature following gateway conventions.

1. Read `src/packages/entities/index.ts`, `src/app.module.ts`, `src/data/constants/messages.constant.ts`, `src/features/rmq-clients/rmq-clients.module.ts`.
2. Pick closest existing feature as template.
3. Generate: Zod schema → DTO → barrel export → messages → controller/module → app.module registration.
4. Add tests in `test/` mirroring existing spec patterns.
5. Run `bun run lint:check && bun run test` after.
