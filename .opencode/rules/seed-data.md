# Seed Data Patterns

## Not applicable to gateway

Gateway has no database, so there are no seed scripts. Seed scripts live in the owning services:

- `user` service: `bun scripts/recreate-db.ts` (drop → push schema → seed accounts)
- `tutor-service`: has its own seed scripts
- `third-service`: has its own seed scripts

Gateway only forwards requests over RabbitMQ RPC — it never touches the database directly.
