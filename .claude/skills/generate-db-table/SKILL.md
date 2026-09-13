---
name: generate-db-table
description: Does NOT apply to gateway — gateway has no database. Redirects to the owning service's repo. Use only to recognize and correct a request to add a Drizzle table here.
---

# Generate Drizzle Table — not applicable in gateway

Gateway has **no Postgres, no Drizzle, no `src/database/schema.ts`, no `drizzle/` migrations** —
see `../.claude/rules/architecture.md` ("gateway has no `POSTGRES_*`/`DATABASE_URL` — it owns no
data"). If someone asks to add a table or column for a gateway feature, it belongs in the
owning service's own repo instead:

- `user` repo, for auth/user/admin/student
- `tutor-service` repo, for the education domain
- `third-service` repo, for email/notification/redis/upload (its own schema exists only for
  `notification`)

Run that repo's own `generate-db-table` skill there. Gateway never gets a schema change from
this skill.
