export interface ApiResponseInterface<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: Date;
  method: string;
  path: string;
  /** Echoes the `x-correlation-id` for this request — quote it when asking for logs. */
  correlationId?: string;
}

export interface ApiResponseOptions {
  message?: string;
  statusCode?: number;
}
