---
name: kafka-ssl-disabled-internal
description: Gateway connects to internal Kafka without TLS; SSL disabled by default for Railway service-to-service communication
metadata:
  type: project
---

## Kafka SSL/TLS Configuration (Disabled for Internal Service)

**Status**: ✅ Fixed 2026-09-26 — SSL/TLS disabled for internal Kafka connections

### Background
Gateway was crashing on startup with:
```
KafkaJSNonRetriableError: Connection error: Client network socket disconnected 
before secure TLS connection was established
```

The root cause: Gateway was trying to connect **with TLS enabled** to Railway's **internal Kafka service** (kafka:9092) which doesn't use TLS. TLS handshake data was being misinterpreted as Kafka message frames.

### Solution
- Disabled SSL by default: `ssl: process.env.KAFKA_SSL === 'true'` (was `!== 'false'`)
- Changed default brokers from `localhost:9092` → `kafka:9092` (Railway internal)
- Connection timeout increased: 10s → 15s (for slower connections)
- Added optional SASL authentication support for future use

**Why: Railway's internal service-to-service communication doesn't need TLS** — it's already private within the internal network. Public proxies (like `ballast.proxy.rlwy.net:34047`) need TLS, but internal DNS names (like `kafka:9092`) don't.

### Environment Variables

**For internal Kafka (default, working):**
```env
KAFKA_BROKERS=kafka:9092
KAFKA_SSL=false         # Disabled
```

**For public proxy (if ever needed):**
```env
KAFKA_BROKERS=ballast.proxy.rlwy.net:34047
KAFKA_SSL=true          # Required for public connections
KAFKA_SASL_ENABLED=true # May also need auth
```

### Files Changed
- `src/features/kafka/kafka.module.ts` — `buildKafkaClientConfig()` function
- `src/features/kafka/kafka.admin.ts` — Admin client SSL/SASL config
- `KAFKA_CONFIG.md` — New comprehensive guide

### How to Apply
1. Set `KAFKA_BROKERS=kafka:9092` in Railway gateway env vars
2. Omit `KAFKA_SSL` (defaults to false) or set `KAFKA_SSL=false`
3. Redeploy gateway
4. Should see `[SEND-START]`, `[SEND-SUCCESS]` in logs (no TLS errors)

### Related Decision
The choice to disable SSL by default reflects the architecture: **service-to-service RPC within Railway's private network doesn't need TLS encryption** — Railway's network isolation handles that. TLS is only needed when connecting through public proxies or over the internet.
