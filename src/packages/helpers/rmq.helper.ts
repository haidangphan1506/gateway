import { HttpException } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

interface RpcErrorPayload {
  statusCode?: number;
  message?: string | string[];
}

function isRpcErrorPayload(value: unknown): value is RpcErrorPayload {
  return typeof value === 'object' && value !== null;
}

/**
 * Sends a request/response message to a downstream service over RabbitMQ (`ClientProxy.send`)
 * and rethrows whatever the responder's `RpcExceptionFilter` produced as a proper
 * `HttpException`, so gateway controllers behave exactly as if they had called a local service.
 * Every gateway controller that talks to a backend service over RabbitMQ goes through this
 * helper — never call `client.send(...)` directly from a controller.
 */
export async function sendRpc<T>(
  client: ClientProxy,
  pattern: string,
  data: unknown = {},
): Promise<T> {
  try {
    return await firstValueFrom(client.send<T>(pattern, data));
  } catch (error: unknown) {
    if (isRpcErrorPayload(error)) {
      const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
      throw new HttpException(message ?? 'Internal server error', error.statusCode ?? 500);
    }
    throw error;
  }
}
