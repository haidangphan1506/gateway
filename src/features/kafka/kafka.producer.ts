import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { KAFKA_PRODUCER, KAFKA_REQUEST_TOPICS } from './kafka.constants';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { randomUUID } from 'node:crypto';
import {
  CORRELATION_ID_HEADER,
  getRequestContext,
  PARENT_TRACE_ID_HEADER,
  SERVICE_NAME_HEADER,
  TRACE_ID_HEADER,
} from '@packages/context/request-context';

const SERVICE_NAME = 'gateway';

interface KafkaMessageEnvelope<T> {
  value: T;
  headers: Record<string, string>;
}

/**
 * Builds the trace headers every outbound Kafka message carries: `correlationId` is reused
 * unchanged from the current `RequestContext` (constant for the whole distributed flow), a fresh
 * `traceId` identifies this specific hop, and `parentTraceId` links it back to whichever hop
 * triggered it. Wrapping the payload as `{value, headers}` (a shape `KafkaRequestSerializer`
 * recognizes as an already-formed Kafka message) is what lets these ride as real Kafka message
 * headers without changing the payload any existing `@Payload()` handler receives — see
 * `[[kafka-rpc-plumbing]]` memory.
 */
function wrapWithTraceHeaders<T>(message: T): KafkaMessageEnvelope<T> {
  const ctx = getRequestContext();
  return {
    value: message,
    headers: {
      [CORRELATION_ID_HEADER]: ctx?.correlationId ?? randomUUID(),
      [TRACE_ID_HEADER]: randomUUID(),
      [PARENT_TRACE_ID_HEADER]: ctx?.traceId ?? '',
      [SERVICE_NAME_HEADER]: SERVICE_NAME,
    },
  };
}

interface RpcErrorPayload {
  statusCode?: number;
  message?: string | string[];
  errors?: unknown;
  serviceName?: string;
}

/**
 * `ClientKafka` never parses the `NEST_ERR` reply header for us — the responder's
 * `RpcExceptionFilter` payload arrives here as a raw `Buffer` (`assignErrorHeader` in
 * `@nestjs/microservices` does `Buffer.from(JSON.stringify(err))` on the server side, but the
 * client-side deserializer hands that `Buffer` straight through unparsed). Decode it back into
 * the `{statusCode, message, errors}` object before reading any field off it, or every RPC error
 * silently collapses into a generic 500.
 */
function toRpcErrorPayload(raw: unknown): RpcErrorPayload {
  let value: unknown = raw;
  if (Buffer.isBuffer(value)) {
    value = value.toString('utf8');
  }
  if (typeof value === 'string') {
    const raw = value;
    try {
      value = JSON.parse(raw);
    } catch {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: raw };
    }
  }
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
}

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducer.name);

  constructor(@Inject(KAFKA_PRODUCER) private readonly client: ClientKafka) {}

  async onModuleInit() {
    KAFKA_REQUEST_TOPICS.forEach((topic) => this.client.subscribeToResponseOf(topic));
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  emit<TResult = unknown, TInput = unknown>(topic: string, message: TInput): Promise<TResult> {
    const envelope = wrapWithTraceHeaders(message);
    this.logger.log(
      `[EMIT] ${topic} correlationId=${envelope.headers[CORRELATION_ID_HEADER]} traceId=${envelope.headers[TRACE_ID_HEADER]}`,
    );
    return firstValueFrom(this.client.emit<TResult, KafkaMessageEnvelope<TInput>>(topic, envelope));
  }

  /**
   * Request-reply with retry logic and exponential backoff.
   * Rethrows whatever the responder's `RpcExceptionFilter` produced as a proper
   * `HttpException` (status + message), so callers see the same error shape a local call would
   * throw instead of a generic rejection — the Kafka equivalent of the old RMQ `sendRpc` helper.
   * @param topic The Kafka topic to send to
   * @param message The message payload
   * @param timeoutMs Optional timeout per attempt in milliseconds (default: 10000ms)
   * @param maxRetries Maximum number of retries (default: 2, total 3 attempts)
   */
  async send<TResponse, TRequest>(
    topic: string,
    message: TRequest,
    timeoutMs?: number,
    maxRetries: number = 2,
  ): Promise<TResponse> {
    const envelope = wrapWithTraceHeaders(message);
    const correlationId = envelope.headers[CORRELATION_ID_HEADER];
    const traceId = envelope.headers[TRACE_ID_HEADER];
    const totalStartTime = Date.now();
    const finalTimeoutMs = timeoutMs ?? 10000;

    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const attemptStartTime = Date.now();

      this.logger.log(
        `[SEND-START] ${topic} attempt=${attempt}/${maxRetries + 1} correlationId=${correlationId} traceId=${traceId} timeoutMs=${finalTimeoutMs}`,
      );

      try {
        let observable = this.client.send<TResponse, KafkaMessageEnvelope<TRequest>>(
          topic,
          envelope,
        );

        observable = observable.pipe(
          timeout({
            each: finalTimeoutMs,
            meta: `Kafka ${topic} request timeout after ${finalTimeoutMs}ms`,
          }),
        );

        const response = await firstValueFrom(observable);
        const totalDuration = Date.now() - totalStartTime;

        this.logger.log(
          `[SEND-SUCCESS] ${topic} correlationId=${correlationId} traceId=${traceId} attempt=${attempt} totalDuration=${totalDuration}ms`,
        );

        return response;
      } catch (error: unknown) {
        lastError = error;
        const attemptDuration = Date.now() - attemptStartTime;
        const totalDuration = Date.now() - totalStartTime;
        const isTimeout = error instanceof Error && error.message?.includes('Timeout');
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

        this.logger.warn(
          `[SEND-ATTEMPT-FAILED] ${topic} correlationId=${correlationId} traceId=${traceId} attempt=${attempt} attemptDuration=${attemptDuration}ms totalDuration=${totalDuration}ms isTimeout=${isTimeout} error=${errorMessage}`,
        );

        // If this was the last attempt, throw the error
        if (attempt === maxRetries + 1) {
          const payload = toRpcErrorPayload(error);
          const finalDuration = Date.now() - totalStartTime;

          this.logger.error(
            `[SEND-FAILED] ${topic} correlationId=${correlationId} traceId=${traceId} attempts=${maxRetries + 1} totalDuration=${finalDuration}ms error=${
              Array.isArray(payload.message) ? payload.message.join(', ') : payload.message
            }`,
          );

          throw new HttpException(
            {
              message: payload.message ?? 'Kafka service unavailable',
              errors: payload.errors,
              serviceName: payload.serviceName,
              isTimeout,
              duration: finalDuration,
              attempts: maxRetries + 1,
            },
            isTimeout ? HttpStatus.GATEWAY_TIMEOUT : payload.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // Exponential backoff: 100ms * 2^(attempt-1)
        const backoffMs = Math.min(100 * Math.pow(2, attempt - 1), 5000);

        this.logger.log(
          `[SEND-RETRY] ${topic} correlationId=${correlationId} traceId=${traceId} attempt=${attempt}/${maxRetries + 1} backoffMs=${backoffMs}`,
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    // Should never reach here, but just in case
    throw new HttpException(
      'Kafka request failed unexpectedly',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
