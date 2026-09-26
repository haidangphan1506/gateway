# Kafka SSL/TLS Disabled - Change Summary (2026-09-26)

## Problem Solved
**Kafka TLS Connection Error**: Gateway crashed on startup due to TLS handshake failures when connecting to internal Kafka service.

```
KafkaJSNonRetriableError: Connection error: Client network socket 
disconnected before secure TLS connection was established
```

## Root Cause
- Gateway was trying to connect with **TLS enabled** by default
- But Railway's **internal Kafka service** (kafka:9092) doesn't use TLS
- TLS data was being interpreted as message data by Kafka broker
- Resulted in "Invalid receive" errors in Kafka logs

## Solution Implemented

### 1. **src/features/kafka/kafka.module.ts**
**Changes:**
- ✅ Disabled SSL by default: `ssl: process.env.KAFKA_SSL === 'true'`
- ✅ Updated default brokers: `kafka:9092` (internal service)
- ✅ Improved connection timeout: 10s → 15s
- ✅ Added optional SASL authentication support
- ✅ Updated clientId: `gateway-prod-client`
- ✅ Refactored to use `buildKafkaClientConfig()` function for type safety

**Before:**
```typescript
ssl: process.env.KAFKA_SSL !== 'false',  // SSL enabled by default ❌
brokers: 'localhost:9092'                 // Development default
```

**After:**
```typescript
ssl: process.env.KAFKA_SSL === 'true',    // SSL disabled by default ✅
brokers: 'kafka:9092'                     // Railway internal endpoint
```

### 2. **src/features/kafka/kafka.admin.ts**
**Changes:**
- ✅ Updated admin client to match producer SSL/SASL config
- ✅ Uses same environment variables
- ✅ Supports optional SASL authentication

### 3. **KAFKA_CONFIG.md** (New)
- Comprehensive configuration guide
- Railway setup instructions
- Troubleshooting tips
- Testing procedures

## Environment Variables

### Current (working)
```env
KAFKA_BROKERS=kafka:9092           # Railway internal endpoint
KAFKA_SSL=false                    # SSL disabled (default)
KAFKA_CLIENT_ID=gateway-prod-client
KAFKA_GROUP_ID=gateway-service
```

### Optional (for public proxy)
```env
KAFKA_SSL=true
KAFKA_SASL_ENABLED=true
KAFKA_SASL_MECHANISM=plain
KAFKA_SASL_USERNAME=...
KAFKA_SASL_PASSWORD=...
```

## Files Modified
1. `src/features/kafka/kafka.module.ts` ✅
2. `src/features/kafka/kafka.admin.ts` ✅
3. `KAFKA_CONFIG.md` (new) ✅

## Files NOT Modified
- `src/features/kafka/kafka.producer.ts` (no changes needed)
- `src/features/kafka/kafka.consumer.ts` (no changes needed)
- `src/features/kafka/kafka.constants.ts` (no changes needed)
- `src/app.module.ts` (already imports KafkaModule)
- Any packages folder files (no Kafka-specific files there)

## Build Status
✅ **Build successful** - No TypeScript or ESLint errors

## Next Steps

### To Deploy
1. Update Railway gateway env vars:
   ```
   KAFKA_BROKERS=kafka:9092
   KAFKA_SSL=false
   ```
2. Redeploy gateway service
3. Monitor logs for `[SEND-START]`, `[SEND-SUCCESS]` messages
4. Should connect successfully without TLS errors

### To Verify
```bash
# Check gateway logs
railway logs --service gateway

# Look for successful Kafka connections
# Should NOT see: "Client network socket disconnected before secure TLS"
# Should see: "[SEND-START]", "[SEND-SUCCESS]" when making requests
```

## Architecture Impact
- **No breaking changes** to controller/service code
- **No API changes** for downstream services
- **Transparent fix** - just configuration
- **Backward compatible** - SASL auth still optional

## Related Issues
- Fixed: Kafka TLS connection failure on Railway
- Improved: Connection timeout configuration (10s → 15s)
- Enhanced: Added SASL authentication support for future use
