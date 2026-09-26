import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '@packages/decorators';
import { KafkaProducer } from './features/kafka/kafka.producer';

@ApiTags('Health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns a simple health check response' })
  @SwaggerResponse({
    status: 200,
    description: 'Server is running',
    schema: { type: 'string', example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('kafka/emit')
  @ApiOperation({
    summary: 'Kafka emit health check',
    description: 'Fire-and-forget ping to the user service over Kafka — no reply is awaited',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Ping emitted',
    schema: { type: 'string', example: 'Hello World!' },
  })
  async pingMsgFromKafkaController(): Promise<unknown> {
    this.logger.log(`[EMIT] kafka.emit -> user, payload=123`);
    return await this.kafkaProducer.emit<unknown, number>('kafka.ping', 123);
  }

  @Public()
  @Get('kafka/send')
  @ApiOperation({
    summary: 'Kafka send user data with response',
    description: 'Send user data to user service over Kafka and receive response',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Data sent and response received',
    schema: {
      type: 'object',
      example: {
        statusCode: 200,
        message: 'User data processed successfully',
        data: {
          userId: 'uuid',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'STUDENT',
        },
      },
    },
  })
  async sendMsgFromKafkaController(): Promise<unknown> {
    const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();
    const payload = {
      email: 'test.kafka@example.com',
      firstName: 'Kafka',
      lastName: 'Test',
      username: 'kafka_test_user',
      role: 'STUDENT',
      timestamp: new Date().toISOString(),
    };
    this.logger.log(
      `[SEND-START] requestId=${requestId} kafka.send -> user, payload=${JSON.stringify(payload)}`,
    );
    try {
      // Per-attempt timeout: 10s, with 2 retries = 30s total max
      const response = await this.kafkaProducer.send<unknown, typeof payload>(
        'kafka.send',
        payload,
        10000, // Shorter timeout per attempt
        2, // Max 2 retries = 3 total attempts
      );
      const duration = Date.now() - startTime;
      this.logger.log(
        `[SEND-SUCCESS] requestId=${requestId} kafka.send <- user, duration=${duration}ms, response=${JSON.stringify(response)}`,
      );
      return {
        statusCode: 200,
        message: 'Success',
        data: response,
        requestId,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(
        `[SEND-FAILED] requestId=${requestId} kafka.send -> user, duration=${duration}ms, error=${errorMessage}, stack=${
          error instanceof Error ? error.stack : ''
        }`,
      );

      // If it's already an HttpException (from KafkaProducer), re-throw it
      if (error instanceof Error && error['status'] !== undefined) {
        throw error;
      }

      // Otherwise throw a proper HttpException with detailed error info
      throw new Error(
        `Kafka send failed after ${duration}ms: ${errorMessage}. requestId=${requestId}`,
      );
    }
  }

  @Public()
  @Get('kafka/error')
  @ApiOperation({
    summary: 'Kafka emit health check',
    description: 'Fire-and-forget ping to the user service over Kafka — no reply is awaited',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Ping emitted',
    schema: { type: 'string', example: 'Hello World!' },
  })
  async testMsgError(): Promise<unknown> {
    this.logger.log(`[EMIT] kafka.emit -> user, payload=123`);
    return await this.kafkaProducer.send<unknown, number>('kafka.user.error', 123);
  }

  @Public()
  @Get('kafka/tutor/error')
  @ApiOperation({
    summary: 'Kafka emit health check',
    description: 'Fire-and-forget ping to the user service over Kafka — no reply is awaited',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Ping emitted',
    schema: { type: 'string', example: 'Hello World!' },
  })
  async testError(): Promise<unknown> {
    this.logger.log(`[SEND] kafka.emit -> user, payload=123`);
    return await this.kafkaProducer.send<unknown, number>('kafka.user', 123);
  }

  @Public()
  @Get('health/postgres')
  @ApiOperation({
    summary: 'Check PostgreSQL connection',
    description: 'Test PostgreSQL database connection via user service',
  })
  @SwaggerResponse({
    status: 200,
    description: 'PostgreSQL connection is healthy',
    schema: {
      type: 'object',
      example: {
        statusCode: 200,
        message: 'PostgreSQL connection is healthy',
        data: {
          connection: 'postgres',
          status: 'connected',
          timestamp: '2026-09-26T08:35:31.437Z',
        },
      },
    },
  })
  async checkPostgresConnection(): Promise<unknown> {
    this.logger.log('[HEALTH] Checking PostgreSQL connection and fetching user data');
    try {
      const response = await this.kafkaProducer.send<unknown, unknown>('health.postgres', {
        fetchData: true,
      });
      this.logger.log(`[HEALTH] PostgreSQL data fetched: ${JSON.stringify(response)}`);
      return {
        statusCode: 200,
        message: 'PostgreSQL connection is healthy and data fetched',
        data: {
          connection: 'postgres',
          status: 'connected',
          timestamp: new Date().toISOString(),
          databaseStats: response,
        },
      };
    } catch (error) {
      this.logger.error(`[HEALTH] PostgreSQL connection failed: ${error}`);
      throw error;
    }
  }

  @Public()
  @Get('health/redis')
  @ApiOperation({
    summary: 'Check Redis connection',
    description: 'Test Redis cache connection via third service',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Redis connection is healthy',
    schema: {
      type: 'object',
      example: {
        statusCode: 200,
        message: 'Redis connection is healthy',
        data: {
          connection: 'redis',
          status: 'connected',
          timestamp: '2026-09-26T08:35:31.437Z',
        },
      },
    },
  })
  async checkRedisConnection(): Promise<unknown> {
    this.logger.log('[HEALTH] Checking Redis connection and fetching cache data');
    try {
      const response = await this.kafkaProducer.send<unknown, unknown>('health.redis', {
        fetchData: true,
      });
      this.logger.log(`[HEALTH] Redis data fetched: ${JSON.stringify(response)}`);
      return {
        statusCode: 200,
        message: 'Redis connection is healthy and cache data retrieved',
        data: {
          connection: 'redis',
          status: 'connected',
          timestamp: new Date().toISOString(),
          cacheStats: response,
        },
      };
    } catch (error) {
      this.logger.error(`[HEALTH] Redis connection failed: ${error}`);
      throw error;
    }
  }
}
