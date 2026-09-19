import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '@packages/decorators';
import { KafkaProducer } from './features/kafka/kafka.producer';

interface KafkaEchoResponse {
  echo: string;
  receivedAt: string;
}

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
  @Get('kafka')
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
    this.logger.log(`[EMIT] kafka.ping -> user, payload=123`);
    return await this.kafkaProducer.emit<unknown, number>('kafka.ping', 123);
  }

  @Public()
  @Get('kafka/echo')
  @ApiOperation({
    summary: 'Kafka request-reply health check',
    description: 'Sends a request to the user service over Kafka and awaits its reply',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Echo received back from the user service',
    schema: {
      type: 'object',
      properties: {
        echo: { type: 'string', example: 'ping' },
        receivedAt: { type: 'string', example: '2026-09-19T12:00:00.000Z' },
      },
    },
  })
  async echoViaKafkaController(): Promise<KafkaEchoResponse> {
    this.logger.log(`[SEND] kafka.echo -> user, payload=ping`);
    const result = await this.kafkaProducer.send<KafkaEchoResponse, string>('kafka.echo', 'ping');
    this.logger.log(`[SEND] kafka.echo <- user reply, result=${JSON.stringify(result)}`);
    return result;
  }
}
